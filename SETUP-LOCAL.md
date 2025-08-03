# 🚀 Setup Local - Technical AI

## 1. Clé API Mistral (OBLIGATOIRE)

```bash
# 1. Créer le fichier .env
cp .env.example .env

# 2. Obtenir une clé API Mistral
# - Aller sur https://console.mistral.ai
# - Créer un compte
# - Générer une clé API
# - Copier la clé dans .env
```

## 2. Installation des dépendances

```bash
# Installer toutes les dépendances
npm run install:all
```

## 3. Démarrage

```bash
# Démarrage HTTPS automatique
./start-https.sh
```

## 4. Test

- Frontend: https://localhost:3000
- API: https://localhost:5443/health
- Test IA: https://localhost:5443/api/ai/ask

## ⚠️ Problèmes courants

- **Certificats SSL** : Accepter dans le navigateur
- **Port occupé** : Changer PORT dans .env
- **Clé API manquante** : Erreur 401 de Mistral