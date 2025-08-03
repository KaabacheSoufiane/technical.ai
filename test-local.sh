#!/bin/bash

echo "🧪 Tests Technical AI - Environnement Local"
echo "=========================================="

# Vérification des certificats
if [ ! -f "ssl/cert.pem" ]; then
    echo "❌ Certificats SSL manquants"
    echo "🔧 Génération automatique..."
    npm run setup:ssl
fi

# Test de santé du serveur
echo "🏥 Test de santé du serveur..."
curl -k -s https://localhost:5443/health | jq '.' || echo "❌ Serveur non accessible"

# Test de l'API IA
echo "🤖 Test de l'API IA..."
curl -k -X POST https://localhost:5443/api/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Test de connexion"}' \
  -s | jq '.' || echo "❌ API IA non fonctionnelle"

echo "✅ Tests terminés"