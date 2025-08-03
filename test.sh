#!/bin/bash

echo "🧪 TEST COMPLET TECHNICAL.AI"
echo "================================"

# Test 1: Ollama
echo "1. Test Ollama..."
if ollama list | grep -q "mistral"; then
    echo "✅ Ollama: Modèle Mistral disponible"
else
    echo "❌ Ollama: Modèle Mistral manquant"
    exit 1
fi

# Test 2: API Ollama
echo "2. Test API Ollama..."
OLLAMA_TEST=$(curl -s http://localhost:11434/api/generate -d '{"model":"mistral:7b-instruct-q4_K_M","prompt":"Test","stream":false}' | jq -r '.response' 2>/dev/null)
if [ -n "$OLLAMA_TEST" ]; then
    echo "✅ API Ollama: Fonctionnelle"
else
    echo "❌ API Ollama: Non accessible"
    exit 1
fi

# Test 3: Serveur Technical.AI
echo "3. Test serveur Technical.AI..."
pkill -f "node.*server" 2>/dev/null || true
sleep 2

node server.js &
SERVER_PID=$!
sleep 5

# Test health
if curl -k -s https://localhost:5443/health | grep -q "OK"; then
    echo "✅ Serveur: Health check OK"
else
    echo "❌ Serveur: Health check échoué"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test API IA
echo "4. Test API IA..."
AI_RESPONSE=$(curl -k -s -X POST https://localhost:5443/api/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Test de diagnostic"}' | jq -r '.answer' 2>/dev/null)

if [ -n "$AI_RESPONSE" ] && [ "$AI_RESPONSE" != "null" ]; then
    echo "✅ API IA: Réponse générée"
    echo "   Extrait: ${AI_RESPONSE:0:50}..."
else
    echo "❌ API IA: Pas de réponse"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test 5: Frontend
echo "5. Test frontend..."
cd frontend
if npm list react >/dev/null 2>&1; then
    echo "✅ Frontend: Dépendances OK"
else
    echo "❌ Frontend: Dépendances manquantes"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
cd ..

# Nettoyage
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎉 TOUS LES TESTS PASSÉS!"
echo "✅ Ollama opérationnel"
echo "✅ Serveur fonctionnel"
echo "✅ API IA responsive"
echo "✅ Frontend prêt"
echo ""
echo "Pour démarrer: ./start.sh"