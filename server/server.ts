import app from './app';
import https from 'https';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

// Configuration HTTPS
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem'))
};

// Serveur HTTPS
https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`🔒 Serveur HTTPS Technical AI démarré sur https://localhost:${HTTPS_PORT}`);
});

// Serveur HTTP (redirection vers HTTPS)
app.listen(PORT, () => {
  console.log(`🚀 Serveur HTTP Technical AI démarré sur http://localhost:${PORT} (redirection vers HTTPS)`);
});