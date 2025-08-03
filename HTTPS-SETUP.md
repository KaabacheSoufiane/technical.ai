# 🔒 Configuration HTTPS - Technical AI

## Démarrage Rapide

```bash
# Démarrage automatique avec HTTPS
./start-https.sh
```

## URLs Sécurisées

- **Frontend**: https://localhost:3000
- **API Backend**: https://localhost:5443
- **Documentation**: https://localhost:5443/docs

## Certificats SSL

Les certificats auto-signés sont générés automatiquement dans `/ssl/`:
- `cert.pem` - Certificat public
- `key.pem` - Clé privée

## Configuration Navigateur

⚠️ **Important**: Acceptez les certificats auto-signés dans votre navigateur :
1. Visitez https://localhost:3000
2. Cliquez sur "Avancé" → "Continuer vers localhost"
3. Répétez pour https://localhost:5443

## Production

Pour la production, remplacez les certificats auto-signés par des certificats valides (Let's Encrypt, etc.).