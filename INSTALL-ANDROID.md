# 📱 Installation Technical.AI sur Android

## 🚀 Méthode 1: PWA (Progressive Web App)

### Étapes d'installation:

1. **Ouvrir Chrome** sur votre smartphone Android
2. **Aller sur** `https://localhost:3000` (ou votre IP locale)
3. **Accepter** le certificat SSL auto-signé
4. **Appuyer** sur le menu Chrome (3 points)
5. **Sélectionner** "Ajouter à l'écran d'accueil"
6. **Confirmer** l'installation

### ✅ Avantages PWA:
- Icône sur l'écran d'accueil
- Fonctionne hors ligne (cache)
- Interface native
- Notifications push
- Pas besoin du Play Store

## 🌐 Méthode 2: Accès réseau local

### Configuration réseau:

1. **Vérifier l'IP** du serveur:
   ```bash
   ip addr show | grep inet
   ```

2. **Remplacer localhost** par l'IP locale:
   - Au lieu de: `https://localhost:3000`
   - Utiliser: `https://192.168.1.X:3000`

3. **Ouvrir sur Android** et suivre les étapes PWA

## 🔧 Méthode 3: APK avec Capacitor

### Si vous voulez une vraie app:

```bash
# Installation Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Initialisation
npx cap init TechnicalAI com.technicalai.app

# Build et génération APK
npm run build
npx cap add android
npx cap sync
npx cap open android
```

## 📋 Fonctionnalités mobiles:

- ✅ Interface responsive
- ✅ Upload photos depuis caméra
- ✅ Diagnostic IA hors ligne
- ✅ Base PDF accessible
- ✅ Mode sombre optimisé
- ✅ Notifications push

## 🎯 Recommandation:

**Utilisez la méthode PWA** - Simple, rapide, et toutes les fonctionnalités sont disponibles !

L'app sera installée comme une vraie application native sur votre Android. 🚀