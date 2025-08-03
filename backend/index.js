const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
const httpsPort = process.env.HTTPS_PORT || 5443;

// Configuration CORS sécurisée
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://localhost:3000'] 
    : ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true
}));

// Middleware de redirection HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Route publique sécurisée (pas d'infos sensibles)
app.get('/', (req, res) => {
  res.json({ 
    name: 'Technical AI Backend',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route protégée exemple (à supprimer en production)
app.get('/api/message', (req, res) => {
  // TODO: Ajouter authentification en production
  res.json({ message: 'API Backend Technical AI' });
});

// Configuration HTTPS
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem'))
};

// Serveur HTTPS
https.createServer(httpsOptions, app).listen(httpsPort, () => {
  console.log(`🔒 Backend HTTPS démarré sur https://localhost:${httpsPort}`);
}).on('error', (err) => {
  console.error('❌ Erreur HTTPS:', err);
});

// Serveur HTTP (redirection)
app.listen(port, () => {
  console.log(`🚀 Backend HTTP démarré sur http://localhost:${port}`);
}).on('error', (err) => {
  console.error('❌ Erreur HTTP:', err);
});
