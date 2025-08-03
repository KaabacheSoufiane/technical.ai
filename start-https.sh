#!/bin/bash

echo "🔧 Configuration HTTPS pour Technical AI"

# Vérification des certificats SSL
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "📜 Génération des certificats SSL..."
    npm run setup:ssl
fi

# Installation des dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm run install:all
fi

echo "🚀 Démarrage des serveurs HTTPS..."
echo "Frontend: https://localhost:3000"
echo "Backend: https://localhost:5443"
echo ""
echo "⚠️  Acceptez les certificats auto-signés dans votre navigateur"

npm run dev:all