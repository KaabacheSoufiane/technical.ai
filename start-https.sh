#!/bin/bash

echo "🔒 DÉMARRAGE HTTPS TECHNICAL.AI"
echo "==============================="

# Nettoyage
echo "🧹 Nettoyage des processus..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
sleep 3

# Vérification SSL
echo "🔑 Vérification SSL..."
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    echo "Génération des certificats SSL..."
    mkdir -p ssl
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj '/CN=localhost' 2>/dev/null
    chmod 600 ssl/key.pem
    chmod 644 ssl/cert.pem
    
    # Copie pour React
    cp ssl/cert.pem frontend/
    cp ssl/key.pem frontend/
    echo "✅ Certificats générés et copiés"
fi

# Démarrage backend HTTPS
echo "🚀 Démarrage backend HTTPS..."
node server-https.js &
BACKEND_PID=$!
sleep 5

# Test backend
if curl -k -s https://localhost:5443/health | grep -q "OK"; then
    echo "✅ Backend HTTPS: https://localhost:5443"
else
    echo "❌ Backend HTTPS échoué"
    exit 1
fi

# Démarrage frontend HTTPS
echo "🎨 Démarrage frontend HTTPS..."
cd frontend
HTTPS=true npm start &
FRONTEND_PID=$!
cd ..
sleep 10

# Test frontend
if curl -k -s https://localhost:3000 | grep -q "Technical"; then
    echo "✅ Frontend HTTPS: https://localhost:3000"
else
    echo "⚠️  Frontend en cours de démarrage..."
fi

echo -e "\n🎉 APPLICATION HTTPS PRÊTE!"
echo "Frontend: https://localhost:3000"
echo "Backend: https://localhost:5443"
echo "Health: https://localhost:5443/health"
echo ""
echo "⚠️  Acceptez les certificats auto-signés dans votre navigateur"
echo "Appuyez sur Ctrl+C pour arrêter"

# Attendre
trap 'echo "🛑 Arrêt..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait