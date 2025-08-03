#!/bin/bash

echo "🚀 Démarrage Technical.AI"

# Arrêt des processus existants
pkill -f "node.*server" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
sleep 2

# Démarrage du serveur
echo "🦙 Démarrage du serveur Ollama..."
node server.js &
SERVER_PID=$!

sleep 5

# Test du serveur
if curl -k -s https://localhost:5443/health > /dev/null; then
    echo "✅ Serveur opérationnel"
else
    echo "❌ Erreur serveur"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Démarrage du frontend
echo "🎨 Démarrage du frontend..."
cd frontend
HTTPS=true npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Technical.AI démarré!"
echo "🔒 Interface: https://localhost:3000"
echo "🔒 API: https://localhost:5443"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"

trap 'echo "🛑 Arrêt..."; kill $SERVER_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait