#!/bin/bash

echo "🔍 AUDIT FINAL TECHNICAL.AI"
echo "============================"

ERRORS=0

# Test 1: Structure des fichiers
echo "📁 Vérification structure..."
FILES=(
    "server-pdf.js"
    "pdf-processor.js" 
    "database/database-manager.js"
    "frontend/src/components/TechnicalAI.tsx"
    "frontend/src/components/PDFUpload.tsx"
    "frontend/public/manifest.json"
    "frontend/public/serviceWorker.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file MANQUANT"
        ((ERRORS++))
    fi
done

# Test 2: Base de données
echo -e "\n📚 Test base de données..."
if node -e "const DB = require('./database/database-manager'); const db = new DB(); console.log('Stats:', db.getStats());" 2>/dev/null; then
    echo "✅ Base de données OK"
else
    echo "❌ Base de données KO"
    ((ERRORS++))
fi

# Test 3: PDF Processor
echo -e "\n📄 Test PDF processor..."
if node -e "const PDF = require('./pdf-processor'); const pdf = new PDF(); console.log('PDF Stats:', pdf.getStats());" 2>/dev/null; then
    echo "✅ PDF processor OK"
else
    echo "❌ PDF processor KO"
    ((ERRORS++))
fi

# Test 4: Ollama + Mistral
echo -e "\n🤖 Test Ollama..."
if ollama list | grep -q "mistral"; then
    echo "✅ Mistral installé"
else
    echo "❌ Mistral manquant"
    ((ERRORS++))
fi

# Test 5: Frontend build
echo -e "\n🎨 Test frontend..."
cd frontend
if npm run build >/dev/null 2>&1; then
    echo "✅ Frontend build OK"
else
    echo "❌ Frontend build KO"
    ((ERRORS++))
fi
cd ..

# Test 6: PWA
echo -e "\n📱 Test PWA..."
if [ -f "frontend/public/manifest.json" ] && [ -f "frontend/public/serviceWorker.js" ]; then
    echo "✅ PWA configurée"
else
    echo "❌ PWA incomplète"
    ((ERRORS++))
fi

# Test 7: Serveur
echo -e "\n🚀 Test serveur..."
timeout 10s node server-pdf.js &
SERVER_PID=$!
sleep 5

if curl -k -s https://localhost:5443/health | grep -q "OK"; then
    echo "✅ Serveur HTTPS OK"
    kill $SERVER_PID 2>/dev/null
else
    echo "❌ Serveur HTTPS KO"
    kill $SERVER_PID 2>/dev/null
    ((ERRORS++))
fi

# Résultat final
echo -e "\n📊 RÉSULTAT AUDIT"
echo "=================="
if [ $ERRORS -eq 0 ]; then
    echo "🎉 AUDIT RÉUSSI - Prêt pour Git!"
    echo "✅ Tous les composants fonctionnent"
    exit 0
else
    echo "⚠️  $ERRORS ERREUR(S) DÉTECTÉE(S)"
    echo "❌ Corriger avant Git push"
    exit 1
fi