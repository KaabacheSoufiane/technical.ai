import app from './app';
import https from 'https';
import fs from 'fs';
import path from 'path';

// Configuration environnement
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

if (NODE_ENV !== 'production') {
  console.log('🛠️ Environnement de développement activé');
  console.log(`🔧 Variables: PORT=${PORT}, HTTPS_PORT=${HTTPS_PORT}`);
}

// Configuration HTTPS
try {
  const sslKeyPath = path.join(__dirname, '../ssl/key.pem');
  const sslCertPath = path.join(__dirname, '../ssl/cert.pem');
  
  if (NODE_ENV !== 'production') {
    console.log(`🔑 Chargement SSL: ${sslKeyPath}`);
  }
  
  const httpsOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath)
  };

  // Serveur HTTPS
  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    console.log(`🔒 Serveur HTTPS Technical AI démarré sur https://localhost:${HTTPS_PORT}`);
    if (NODE_ENV !== 'production') {
      console.log(`🌐 Interface: https://localhost:3000`);
      console.log(`📊 Health: https://localhost:${HTTPS_PORT}/health`);
    }
  }).on('error', (err) => {
    console.error('❌ Erreur HTTPS:', err.message);
  });

  // Serveur HTTP (redirection vers HTTPS)
  app.listen(PORT, () => {
    console.log(`🚀 Serveur HTTP démarré sur http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error('❌ Erreur HTTP:', err.message);
  });
  
} catch (error) {
  console.error('❌ Erreur SSL:', error.message);
  console.log('🛠️ Générez les certificats avec: npm run setup:ssl');
  process.exit(1);
}