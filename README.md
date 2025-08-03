# 🔧 Technical.AI

**Technical.AI** est une application d'assistance intelligente dédiée aux techniciens de maintenance dans les domaines du chauffage individuel et de la production d'eau chaude sanitaire (ECS).

Grâce à l'intelligence artificielle, cette solution permet :
- 💡 d'identifier plus rapidement les pannes
- 📚 de consulter la documentation technique en un clic
- 🔍 de faciliter la recherche par mots-clés, symptômes ou codes erreur
- ⚙️ d'optimiser les interventions pour améliorer la rentabilité

---

## 🚀 Démarrage Rapide

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd technical-ai

# Installer toutes les dépendances
npm run install:all

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec votre clé API Mistral
```

### Lancement HTTPS (Recommandé)
```bash
# Démarrage automatique avec HTTPS
./start-https.sh

# Ou manuellement
npm run dev:all
```

### URLs d'accès
- 🌐 **Frontend**: https://localhost:3000
- 🔌 **API Backend**: https://localhost:5443
- 📖 **Documentation API**: https://localhost:5443/docs

⚠️ **Note**: Acceptez les certificats auto-signés dans votre navigateur

---

## 🏗️ Architecture

```
technical-ai/
├── 🎨 frontend/          # Interface React + TypeScript
│   ├── src/components/   # Composants UI
│   └── public/          # Assets statiques
├── 🔧 server/           # API principale TypeScript
│   ├── routes/          # Routes API
│   ├── controllers/     # Logique métier
│   ├── services/        # Services externes (Mistral AI)
│   └── docs/           # Documentation API
├── 🔌 backend/          # Serveur Express simple
├── 🔒 ssl/             # Certificats SSL
└── 📄 docs/            # Documentation projet
```

---

## 🧠 Fonctionnalités

### ✅ Implémentées
- 🤖 **Chat IA** avec Mistral AI pour diagnostic technique
- 🔒 **HTTPS** avec certificats SSL auto-signés
- 🌐 **API REST** sécurisée avec CORS configuré
- 📱 **Interface React** responsive
- 📖 **Documentation API** avec Redoc
- 🔧 **Scripts de développement** automatisés

### 🚧 En Développement
- 🛡️ Protection CSRF
- 🔐 Système d'authentification
- 📚 Upload et parsing de documentation PDF
- 🔍 Recherche vectorielle dans les documents
- 📊 Tableau de bord analytics

---

## 🛠️ Technologies

### Frontend
- ⚛️ **React 18** + TypeScript
- 🎨 **CSS3** avec design responsive
- 🔗 **Fetch API** pour les requêtes HTTPS

### Backend
- 🟢 **Node.js** + Express
- 📘 **TypeScript** pour la sécurité des types
- 🤖 **Mistral AI** pour l'intelligence artificielle
- 🔒 **HTTPS** avec certificats SSL
- 📖 **OpenAPI/Swagger** pour la documentation

### Sécurité
- 🔐 **HTTPS** obligatoire
- 🛡️ **CORS** configuré
- 🔒 **Variables d'environnement** pour les secrets
- 📜 **Certificats SSL** auto-signés (dev)

---

## 📋 Scripts Disponibles

```bash
# Développement
npm run dev:all          # Lance frontend + backend HTTPS
npm run dev:frontend     # Frontend seul (HTTPS)
npm run dev:server       # API serveur seul
npm run dev:backend      # Backend simple seul

# Installation
npm run install:all      # Installe toutes les dépendances

# SSL
npm run setup:ssl        # Génère les certificats SSL
```

---

## ⚙️ Configuration

### Variables d'environnement (.env)
```bash
# API Mistral
MISTRAL_API_KEY=your_mistral_api_key_here

# Serveur
PORT=5000
HTTPS_PORT=5443
NODE_ENV=development

# SSL
SSL_KEY_PATH=./ssl/key.pem
SSL_CERT_PATH=./ssl/cert.pem
```

### Obtenir une clé API Mistral
1. Créer un compte sur [Mistral AI](https://mistral.ai)
2. Générer une clé API
3. L'ajouter dans votre fichier `.env`

---

## 🔧 Utilisation

### Interface Chat IA
1. Accéder à https://localhost:3000
2. Saisir une question technique (ex: "Pourquoi mon ballon d'eau chaude ne chauffe plus ?")
3. Recevoir une réponse personnalisée de l'IA

### API REST
```bash
# Poser une question à l'IA
curl -X POST https://localhost:5443/api/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Diagnostic panne chaudière"}' \
  -k
```

---

## 🚀 Déploiement

### Développement
- Certificats SSL auto-signés
- CORS permissif pour localhost
- Logs détaillés

### Production
1. Remplacer les certificats SSL par des certificats valides
2. Configurer `NODE_ENV=production`
3. Restreindre les origines CORS
4. Utiliser un reverse proxy (Nginx)

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🆘 Support

- 📖 [Documentation HTTPS](HTTPS-SETUP.md)
- 🐛 [Signaler un bug](issues)
- 💡 [Demander une fonctionnalité](issues)

---

**Développé avec ❤️ pour les techniciens de maintenance**