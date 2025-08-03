#!/bin/bash
set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly HTTP_PORT=5000
readonly HTTPS_PORT=5443
readonly FRONTEND_PORT=3000

echo "🔒 TESTS DE SÉCURITÉ TECHNICAL.AI"
echo "=================================="

# Vérification des prérequis
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "❌ $1 n'est pas installé"
        exit 1
    fi
}

echo "🔍 Vérification des prérequis..."
check_command node
check_command npm
check_command curl
check_command ollama

# Test de sécurité SSL
test_ssl_security() {
    echo "🔒 Test sécurité SSL..."
    
    if [ -f "ssl/key.pem" ]; then
        local perms=$(stat -c "%a" ssl/key.pem 2>/dev/null || echo "000")
        if [ "$perms" != "600" ]; then
            echo "⚠️  Permissions SSL non sécurisées: $perms (devrait être 600)"
        else
            echo "✅ Permissions SSL sécurisées"
        fi
    fi
}

# Test rate limiting
test_rate_limiting() {
    echo "🛡️  Test rate limiting..."
    
    local success_count=0
    for i in {1..15}; do
        if curl -k -s -X POST "https://localhost:$HTTPS_PORT/api/ai/ask" \
           -H "Content-Type: application/json" \
           -d '{"question":"test"}' | grep -q "answer\|error"; then
            ((success_count++))
        fi
    done
    
    if [ $success_count -lt 15 ]; then
        echo "✅ Rate limiting actif ($success_count/15 requêtes passées)"
    else
        echo "⚠️  Rate limiting peut-être inactif"
    fi
}

# Test injection
test_injection_protection() {
    echo "🛡️  Test protection injection..."
    
    local malicious_inputs=(
        "<script>alert('xss')</script>"
        "'; DROP TABLE users; --"
        "../../../etc/passwd"
        "\n\r\tlog injection"
    )
    
    for input in "${malicious_inputs[@]}"; do
        local response=$(curl -k -s -X POST "https://localhost:$HTTPS_PORT/api/ai/ask" \
                        -H "Content-Type: application/json" \
                        -d "{\"question\":\"$input\"}" 2>/dev/null || echo "error")
        
        if echo "$response" | grep -q "error"; then
            echo "✅ Protection contre: ${input:0:20}..."
        else
            echo "⚠️  Possible vulnérabilité: ${input:0:20}..."
        fi
    done
}

# Démarrage du serveur sécurisé
if [ -f "server-secure.js" ]; then
    echo "🚀 Démarrage serveur sécurisé..."
    node server-secure.js &
    SERVER_PID=$!
    sleep 5
else
    echo "❌ server-secure.js introuvable"
    exit 1
fi

# Exécution des tests
test_ssl_security
test_rate_limiting
test_injection_protection

# Test HTTPS forcé
echo "🔒 Test redirection HTTPS..."
if curl -s -I "http://localhost:$HTTP_PORT/health" | grep -q "301"; then
    echo "✅ Redirection HTTPS forcée"
else
    echo "⚠️  Redirection HTTPS non configurée"
fi

# Nettoyage
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "🎉 TESTS DE SÉCURITÉ TERMINÉS"
echo "Vérifiez les avertissements ci-dessus"