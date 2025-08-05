#!/bin/bash

echo "🔍 AUDIT COMPLET CONNEXION TECHNICAL.AI"
echo "========================================"

# Nettoyage des processus
echo "🧹 Nettoyage des processus..."
pkill -f "node" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
sleep 3

# Vérification des ports
echo "📊 Vérification des ports..."
for port in 3000 5000 5443 11434; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo "⚠️  Port $port occupé"
        lsof -i :$port
    else
        echo "✅ Port $port libre"
    fi
done

# Test Ollama
echo -e "\n🦙 Test Ollama..."
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "✅ Ollama accessible"
else
    echo "❌ Ollama non accessible"
    echo "Démarrage d'Ollama..."
    ollama serve &
    sleep 5
fi

# Test modèle Mistral
echo "🤖 Test modèle Mistral..."
if ollama list | grep -q "mistral"; then
    echo "✅ Modèle Mistral disponible"
else
    echo "❌ Modèle Mistral manquant"
    echo "Installation du modèle..."
    ollama pull mistral:7b-instruct-q4_K_M
fi

# Démarrage serveur backend
echo -e "\n🚀 Démarrage serveur backend..."
node server-simple.js &
BACKEND_PID=$!
sleep 5

# Test backend HTTP
echo "🔗 Test backend HTTP..."
if curl -s http://localhost:5000/health | grep -q "OK"; then
    echo "✅ Backend HTTP fonctionnel"
else
    echo "❌ Backend HTTP non fonctionnel"
    curl -s http://localhost:5000/health || echo "Pas de réponse"
fi

# Test API IA
echo "🤖 Test API IA..."
AI_RESPONSE=$(curl -s -X POST http://localhost:5000/api/ai/ask \
    -H "Content-Type: application/json" \
    -d '{"question":"test"}' | jq -r '.answer' 2>/dev/null)

if [ -n "$AI_RESPONSE" ] && [ "$AI_RESPONSE" != "null" ]; then
    echo "✅ API IA fonctionnelle"
    echo "   Réponse: ${AI_RESPONSE:0:50}..."
else
    echo "❌ API IA non fonctionnelle"
fi

# Démarrage frontend
echo -e "\n🎨 Démarrage frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..
sleep 10

# Test frontend
echo "🌐 Test frontend..."
if curl -s http://localhost:3000 | grep -q "Technical"; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend non accessible"
fi

# Résumé
echo -e "\n📋 RÉSUMÉ DE L'AUDIT"
echo "===================="
echo "🦙 Ollama: $(curl -s http://localhost:11434/api/tags >/dev/null 2>&1 && echo "✅ OK" || echo "❌ KO")"
echo "🔧 Backend: $(curl -s http://localhost:5000/health >/dev/null 2>&1 && echo "✅ OK" || echo "❌ KO")"
echo "🎨 Frontend: $(curl -s http://localhost:3000 >/dev/null 2>&1 && echo "✅ OK" || echo "❌ KO")"

echo -e "\n🌐 URLs d'accès:"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo "API Health: http://localhost:5000/health"

echo -e "\n🎉 Application prête pour les tests!"
echo "Appuyez sur Ctrl+C pour arrêter"

# Attendre
trap 'echo "🛑 Arrêt..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait