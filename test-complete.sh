#!/bin/bash

echo "🧪 BATTERIE DE TESTS COMPLÈTE - TECHNICAL.AI"
echo "=============================================="

FAILED_TESTS=0
TOTAL_TESTS=0

# Fonction de test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "[$TOTAL_TESTS] $test_name... "
    
    if eval "$test_command" | grep -q "$expected" 2>/dev/null; then
        echo "✅ PASS"
    else
        echo "❌ FAIL"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# 1. TESTS INFRASTRUCTURE
echo -e "\n🏗️  TESTS INFRASTRUCTURE"
echo "------------------------"

run_test "Node.js installé" "node --version" "v"
run_test "NPM installé" "npm --version" "."
run_test "Ollama installé" "ollama --version" "ollama version"
run_test "Modèle Mistral disponible" "ollama list" "mistral"

# 2. TESTS OLLAMA API
echo -e "\n🦙 TESTS OLLAMA API"
echo "-------------------"

run_test "Service Ollama actif" "curl -s http://localhost:11434/api/tags" "models"
run_test "Génération de texte" "curl -s -X POST http://localhost:11434/api/generate -d '{\"model\":\"mistral:7b-instruct-q4_K_M\",\"prompt\":\"Test\",\"stream\":false}' | jq -r '.response'" "."

# 3. TESTS SERVEUR BACKEND
echo -e "\n🔧 TESTS SERVEUR BACKEND"
echo "------------------------"

# Démarrage du serveur si nécessaire
if ! lsof -i :5443 >/dev/null 2>&1; then
    echo "Démarrage du serveur backend..."
    node server.js &
    SERVER_PID=$!
    sleep 5
fi

run_test "Serveur HTTP actif" "curl -s http://localhost:5000" "Technical"
run_test "Serveur HTTPS actif" "curl -k -s https://localhost:5443/health" "OK"
run_test "Route racine" "curl -k -s https://localhost:5443/" "Technical AI"
run_test "Health check" "curl -k -s https://localhost:5443/health" "timestamp"

# 4. TESTS API IA
echo -e "\n🤖 TESTS API IA"
echo "---------------"

run_test "API IA - Question valide" "curl -k -s -X POST https://localhost:5443/api/ai/ask -H 'Content-Type: application/json' -d '{\"question\":\"Test diagnostic\"}'" "answer"
run_test "API IA - Question vide" "curl -k -s -X POST https://localhost:5443/api/ai/ask -H 'Content-Type: application/json' -d '{\"question\":\"\"}'" "error"
run_test "API IA - Question courte" "curl -k -s -X POST https://localhost:5443/api/ai/ask -H 'Content-Type: application/json' -d '{\"question\":\"Hi\"}'" "error"
run_test "API IA - Sans question" "curl -k -s -X POST https://localhost:5443/api/ai/ask -H 'Content-Type: application/json' -d '{}'" "error"

# 5. TESTS FRONTEND
echo -e "\n🎨 TESTS FRONTEND"
echo "-----------------"

cd frontend

run_test "Package.json valide" "cat package.json" "react"
run_test "Dépendances installées" "ls node_modules" "react"
run_test "TypeScript config" "cat tsconfig.json" "compilerOptions"
run_test "Composant principal" "cat src/components/TechnicalAI.tsx" "TechnicalAI"
run_test "Styles CSS" "cat src/components/TechnicalAI.css" "hero-section"

# Test de build
echo -n "[$((TOTAL_TESTS + 1))] Build frontend... "
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if npm run build >/dev/null 2>&1; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

cd ..

# 6. TESTS SÉCURITÉ
echo -e "\n🔒 TESTS SÉCURITÉ"
echo "-----------------"

run_test "Certificats SSL présents" "ls ssl/" "cert.pem"
run_test "Clé privée SSL" "ls ssl/" "key.pem"
run_test "HTTPS forcé" "curl -s -I http://localhost:5000/health" "301"
run_test "CORS configuré" "curl -k -s -I https://localhost:5443/health" "Access-Control"

# 7. TESTS PERFORMANCE
echo -e "\n⚡ TESTS PERFORMANCE"
echo "-------------------"

# Test de latence API
echo -n "[$((TOTAL_TESTS + 1))] Latence API IA... "
TOTAL_TESTS=$((TOTAL_TESTS + 1))
START_TIME=$(date +%s%N)
curl -k -s -X POST https://localhost:5443/api/ai/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"Test rapide"}' >/dev/null
END_TIME=$(date +%s%N)
LATENCY=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $LATENCY -lt 60000 ]; then
    echo "✅ PASS (${LATENCY}ms)"
else
    echo "❌ FAIL (${LATENCY}ms > 60s)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test de charge
echo -n "[$((TOTAL_TESTS + 1))] Test de charge (5 requêtes)... "
TOTAL_TESTS=$((TOTAL_TESTS + 1))
CHARGE_SUCCESS=0
for i in {1..5}; do
    if curl -k -s -X POST https://localhost:5443/api/ai/ask \
       -H 'Content-Type: application/json' \
       -d "{\"question\":\"Test $i\"}" | grep -q "answer"; then
        CHARGE_SUCCESS=$((CHARGE_SUCCESS + 1))
    fi
done

if [ $CHARGE_SUCCESS -eq 5 ]; then
    echo "✅ PASS (5/5)"
else
    echo "❌ FAIL ($CHARGE_SUCCESS/5)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 8. TESTS INTÉGRATION
echo -e "\n🔗 TESTS INTÉGRATION"
echo "--------------------"

run_test "Frontend accessible" "curl -k -s https://localhost:3000" "Technical"
run_test "SweetAlert2 chargé" "curl -k -s https://localhost:3000" "sweetalert2"
run_test "Font Awesome chargé" "curl -k -s https://localhost:3000" "font-awesome"

# 9. TESTS FONCTIONNELS
echo -e "\n⚙️  TESTS FONCTIONNELS"
echo "---------------------"

# Test questions techniques
QUESTIONS=(
    "Ballon eau chaude ne chauffe plus"
    "Chaudière ne démarre pas"
    "Pression circuit trop basse"
    "Code erreur E10"
)

for i in "${!QUESTIONS[@]}"; do
    echo -n "[$((TOTAL_TESTS + 1))] Question technique $((i+1))... "
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    RESPONSE=$(curl -k -s -X POST https://localhost:5443/api/ai/ask \
        -H 'Content-Type: application/json' \
        -d "{\"question\":\"${QUESTIONS[$i]}\"}")
    
    if echo "$RESPONSE" | grep -q "answer" && echo "$RESPONSE" | grep -q "processing_time"; then
        echo "✅ PASS"
    else
        echo "❌ FAIL"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
done

# 10. TESTS ROBUSTESSE
echo -e "\n🛡️  TESTS ROBUSTESSE"
echo "--------------------"

run_test "Gestion caractères spéciaux" "curl -k -s -X POST https://localhost:5443/api/ai/ask -H 'Content-Type: application/json' -d '{\"question\":\"Test <script>alert(1)</script>\"}'" "answer"
run_test "Question très longue" "curl -k -s -X POST https://localhost:5443/api/ai/ask -H 'Content-Type: application/json' -d '{\"question\":\"'$(printf 'A%.0s' {1..600})'\"}'" "."
run_test "JSON malformé" "curl -k -s -X POST https://localhost:5443/api/ai/ask -H 'Content-Type: application/json' -d '{invalid json}'" "error"
run_test "Méthode non autorisée" "curl -k -s -X DELETE https://localhost:5443/api/ai/ask" "Cannot"

# RÉSULTATS FINAUX
echo -e "\n📊 RÉSULTATS FINAUX"
echo "==================="
echo "Tests exécutés: $TOTAL_TESTS"
echo "Tests réussis: $((TOTAL_TESTS - FAILED_TESTS))"
echo "Tests échoués: $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n🎉 TOUS LES TESTS SONT PASSÉS!"
    echo "✅ Application prête pour la production"
    exit 0
else
    echo -e "\n⚠️  $FAILED_TESTS TEST(S) ONT ÉCHOUÉ"
    echo "❌ Vérifiez les erreurs ci-dessus"
    exit 1
fi