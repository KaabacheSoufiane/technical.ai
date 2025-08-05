const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');
require('dotenv').config();

const app = express();
const HTTPS_PORT = 5443;

console.log('🔒 Technical.AI Server HTTPS ONLY');

// CORS pour HTTPS
app.use(cors({
  origin: [
    'https://localhost:3000',
    'https://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    name: 'Technical AI HTTPS', 
    version: '1.0.0', 
    status: 'running',
    protocol: 'https',
    port: HTTPS_PORT
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    protocol: 'https',
    ssl: true
  });
});

// Route IA
app.post('/api/ai/ask', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length < 3) {
      return res.status(400).json({ error: 'Question trop courte' });
    }

    const sanitizedQuestion = question.trim().substring(0, 500);
    console.log(`🤖 Question [HTTPS]:`, sanitizedQuestion.substring(0, 50) + '...');

    const prompt = `Tu es un expert technique spécialisé en chauffage et ECS. Réponds de manière concise et pratique.

Question: ${sanitizedQuestion}

Réponse:`;

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral:7b-instruct-q4_K_M',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        max_tokens: 300
      }
    }, { timeout: 30000 });

    const processingTime = Date.now() - startTime;
    console.log(`✅ Réponse générée en ${processingTime}ms [HTTPS]`);
    
    res.json({ 
      answer: response.data.response,
      processing_time: processingTime,
      protocol: 'https'
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Erreur après ${processingTime}ms:`, error.message);
    res.status(500).json({ error: 'Erreur lors de la génération' });
  }
});

// Génération SSL si nécessaire
const setupSSL = () => {
  const sslDir = path.join(__dirname, 'ssl');
  const keyPath = path.join(sslDir, 'key.pem');
  const certPath = path.join(sslDir, 'cert.pem');
  
  if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { mode: 0o755 });
  }
  
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('🔑 Génération certificats SSL...');
    try {
      execSync(`openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj '/CN=localhost'`, { stdio: 'ignore' });
      fs.chmodSync(keyPath, 0o600);
      fs.chmodSync(certPath, 0o644);
      console.log('✅ Certificats SSL générés');
    } catch (error) {
      console.error('❌ Erreur génération SSL:', error.message);
      return null;
    }
  }
  
  return { keyPath, certPath };
};

// Démarrage HTTPS uniquement
const startServer = () => {
  const sslPaths = setupSSL();
  if (sslPaths) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(sslPaths.keyPath),
        cert: fs.readFileSync(sslPaths.certPath)
      };

      const httpsServer = https.createServer(httpsOptions, app);
      httpsServer.listen(HTTPS_PORT, () => {
        console.log(`🔒 HTTPS Server: https://localhost:${HTTPS_PORT}`);
        console.log('✅ Serveur HTTPS prêt!');
      });
    } catch (error) {
      console.error('❌ Erreur HTTPS:', error.message);
    }
  }
};

startServer();