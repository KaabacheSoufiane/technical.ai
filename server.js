const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;
const HTTPS_PORT = 5443;

console.log('🦙 Technical.AI Server v1.0.0');
console.log('🔧 Mode:', process.env.NODE_ENV || 'development');

// CORS
app.use(cors({
  origin: ['https://localhost:3000', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    name: 'Technical AI', 
    version: '1.0.0', 
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// Route IA optimisée avec Ollama
app.post('/api/ai/ask', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { question } = req.body;
    
    // Validation
    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return res.status(400).json({ error: 'Question invalide (minimum 3 caractères)' });
    }

    const sanitizedQuestion = question.trim().substring(0, 500);
    console.log(`🤖 Question [${sanitizedQuestion.length} chars]:`, sanitizedQuestion.substring(0, 50) + '...');

    // Prompt optimisé
    const prompt = `Tu es un expert technique spécialisé en chauffage individuel et production d'eau chaude sanitaire (ECS).
Réponds de manière concise et pratique avec des solutions concrètes.
Si possible, mentionne les vérifications à effectuer et les pièces potentiellement défaillantes.

Question: ${sanitizedQuestion}

Réponse technique:`;

    // Requête Ollama optimisée
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral:7b-instruct-q4_K_M',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.9,
        repeat_penalty: 1.1,
        num_predict: 400
      }
    }, { 
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' },
      maxRedirects: 0
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ Réponse générée en ${processingTime}ms`);
    
    res.json({ 
      answer: response.data.response.trim(),
      processing_time: processingTime,
      model: 'mistral:7b-instruct-q4_K_M'
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Erreur après ${processingTime}ms:`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Service IA indisponible. Vérifiez qu\'Ollama est démarré.' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la génération de la réponse' });
  }
});

// SSL
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) fs.mkdirSync(sslDir);

const keyPath = path.join(sslDir, 'key.pem');
const certPath = path.join(sslDir, 'cert.pem');

if (!fs.existsSync(keyPath)) {
  const { execSync } = require('child_process');
  execSync(`openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj '/CN=localhost'`, { stdio: 'ignore' });
  console.log('✅ SSL généré');
}

// Serveurs
const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`🔒 HTTPS: https://localhost:${HTTPS_PORT}`);
});

app.listen(PORT, () => {
  console.log(`🚀 HTTP: http://localhost:${PORT}`);
  console.log('✅ Serveur prêt!');
});