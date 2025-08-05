#!/bin/bash

echo "🔒 AUDIT COMPLET HTTPS - TECHNICAL.AI"
echo "====================================="

# Nettoyage
pkill -f "node" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
sleep 3

echo "1. 📋 Vérification de la structure..."
echo "   - server.js: $([ -f server.js ] && echo "✅" || echo "❌")"
echo "   - server-simple.js: $([ -f server-simple.js ] && echo "✅" || echo "❌")"
echo "   - ssl/: $([ -d ssl ] && echo "✅" || echo "❌")"
echo "   - frontend/: $([ -d frontend ] && echo "✅" || echo "❌")"

echo -e "\n2. 🔑 Vérification SSL..."
if [ -d ssl ]; then
    echo "   - key.pem: $([ -f ssl/key.pem ] && echo "✅" || echo "❌")"
    echo "   - cert.pem: $([ -f ssl/cert.pem ] && echo "✅" || echo "❌")"
    if [ -f ssl/key.pem ]; then
        echo "   - Permissions key: $(stat -c "%a" ssl/key.pem)"
    fi
else
    echo "   ❌ Dossier SSL manquant"
    mkdir -p ssl
    echo "   🔧 Génération des certificats SSL..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj '/CN=localhost' 2>/dev/null
    chmod 600 ssl/key.pem
    chmod 644 ssl/cert.pem
    echo "   ✅ Certificats générés"
fi

echo -e "\n3. 🦙 Test Ollama..."
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "   ✅ Ollama accessible"
    if ollama list | grep -q "mistral"; then
        echo "   ✅ Modèle Mistral disponible"
    else
        echo "   ⚠️  Modèle Mistral manquant"
    fi
else
    echo "   ❌ Ollama non accessible"
fi

echo -e "\n4. 🚀 Test serveur HTTPS..."