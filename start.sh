#!/bin/bash

# Script de démarrage Technical.AI
# Version améliorée avec bonnes pratiques

set -euo pipefail  # Arrêt en cas d'erreur, variables non définies, ou erreur dans un pipe

# Configuration
readonly SCRIPT_NAME="Technical.AI"
readonly SERVER_PORT=5443
readonly FRONTEND_PORT=3000
readonly HEALTH_ENDPOINT="https://localhost:${SERVER_PORT}/health"
readonly FRONTEND_DIR="frontend"

# Variables globales pour les PIDs
SERVER_PID=""
FRONTEND_PID=""

# Fonction de logging
log() {
    local level="$1"
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*"
}

log_info() {
    log "INFO" "$@"
}

log_error() {
    log "ERROR" "$@"
}

log_success() {
    log "SUCCESS" "$@"
}

# Fonction de nettoyage
cleanup() {
    log_info "🛑 Arrêt de ${SCRIPT_NAME}..."
    
    if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
        log_info "Arrêt du serveur (PID: $SERVER_PID)"
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    
    if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        log_info "Arrêt du frontend (PID: $FRONTEND_PID)"
        kill "$FRONTEND_PID" 2>/dev/null || true
        wait "$FRONTEND_PID" 2>/dev/null || true
    fi
    
    log_info "Arrêt terminé"
    exit 0
}

# Fonction pour arrêter les processus existants
stop_existing_processes() {
    log_info "🧹 Arrêt des processus existants..."
    
    # Arrêt plus ciblé des processus
    if pgrep -f "node.*server" > /dev/null 2>&1; then
        pkill -f "node.*server" || true
        log_info "Processus serveur Node.js arrêtés"
    fi
    
    if pgrep -f "react-scripts" > /dev/null 2>&1; then
        pkill -f "react-scripts" || true
        log_info "Processus React arrêtés"
    fi
    
    sleep 2
}

# Fonction pour démarrer le serveur
start_server() {
    log_info "🦙 Démarrage du serveur Ollama..."
    
    if [[ ! -f "server.js" ]]; then
        log_error "Fichier server.js introuvable"
        return 1
    fi
    
    node server.js &
    SERVER_PID=$!
    
    log_info "Serveur démarré avec PID: $SERVER_PID"
    sleep 5
}

# Fonction pour tester la santé du serveur
test_server_health() {
    log_info "🔍 Test de santé du serveur..."
    
    local max_retries=5
    local retry_count=0
    
    while [[ $retry_count -lt $max_retries ]]; do
        if curl -k -s --connect-timeout 5 --max-time 10 "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
            log_success "✅ Serveur opérationnel"
            return 0
        fi
        
        ((retry_count++))
        log_info "Tentative $retry_count/$max_retries échouée, nouvelle tentative dans 2s..."
        sleep 2
    done
    
    log_error "❌ Serveur non accessible après $max_retries tentatives"
    return 1
}

# Fonction pour démarrer le frontend
start_frontend() {
    log_info "🎨 Démarrage du frontend..."
    
    if [[ ! -d "$FRONTEND_DIR" ]]; then
        log_error "Répertoire $FRONTEND_DIR introuvable"
        return 1
    fi
    
    if [[ ! -f "$FRONTEND_DIR/package.json" ]]; then
        log_error "package.json introuvable dans $FRONTEND_DIR"
        return 1
    fi
    
    cd "$FRONTEND_DIR" || {
        log_error "Impossible d'accéder au répertoire $FRONTEND_DIR"
        return 1
    }
    
    # Vérification que npm est disponible
    if ! command -v npm > /dev/null 2>&1; then
        log_error "npm n'est pas installé"
        cd ..
        return 1
    fi
    
    HTTPS=true npm start &
    FRONTEND_PID=$!
    cd ..
    
    log_info "Frontend démarré avec PID: $FRONTEND_PID"
}

# Fonction pour afficher les informations de démarrage
show_startup_info() {
    echo ""
    log_success "🎉 ${SCRIPT_NAME} démarré avec succès!"
    echo ""
    echo "🔒 Interface: https://localhost:${FRONTEND_PORT}"
    echo "🔒 API: https://localhost:${SERVER_PORT}"
    echo ""
    echo "Appuyez sur Ctrl+C pour arrêter"
    echo ""
}

# Fonction principale
main() {
    log_info "🚀 Démarrage de ${SCRIPT_NAME}"
    
    # Configuration du trap pour le nettoyage
    trap cleanup INT TERM EXIT
    
    # Vérification des prérequis
    if ! command -v node > /dev/null 2>&1; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    if ! command -v curl > /dev/null 2>&1; then
        log_error "curl n'est pas installé"
        exit 1
    fi
    
    # Exécution des étapes
    stop_existing_processes
    
    if ! start_server; then
        log_error "Échec du démarrage du serveur"
        exit 1
    fi
    
    if ! test_server_health; then
        log_error "Serveur non opérationnel"
        exit 1
    fi
    
    if ! start_frontend; then
        log_error "Échec du démarrage du frontend"
        exit 1
    fi
    
    show_startup_info
    
    # Attente infinie avec gestion des signaux
    while true; do
        sleep 1
        
        # Vérification que les processus sont toujours actifs
        if [[ -n "$SERVER_PID" ]] && ! kill -0 "$SERVER_PID" 2>/dev/null; then
            log_error "Le serveur s'est arrêté de manière inattendue"
            exit 1
        fi
        
        if [[ -n "$FRONTEND_PID" ]] && ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
            log_error "Le frontend s'est arrêté de manière inattendue"
            exit 1
        fi
    done
}

# Point d'entrée
main "$@"