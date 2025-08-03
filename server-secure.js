const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = 5000;
const HTTPS_PORT = 5443;

// Sanitisation des logs
const sanitizeForLog = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[\r\n\t]/g, '').substring(0, 100);
};

// Rate limiting sécurisé
const rateLimiter = new Map();
const RATE_LIMIT = 10; // requêtes par minute
const WINDOW_MS = 60000;

const checkRateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, []);
  }
  
  const requests = rateLimiter.get(ip).filter(time => now - time < WINDOW_MS);
  
  if (requests.length >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Trop de requêtes' });
  }
  
  requests.push(now);
  rateLimiter.set(ip, requests);
  next();
};

// CORS sécurisé
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://localhost:3000'] 
    : ['https://localhost:3000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '1mb' }));
app.use(checkRateLimit);

// Routes sécurisées
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

// Validation et sanitisation des entrées
const validateQuestion = (question) => {
  if (!question || typeof question !== 'string') {
    return { valid: false, error: 'Question invalide' };
  }
  
  const sanitized = question.trim().replace(/[<>\"'&]/g, '').substring(0, 500);
  
  if (sanitized.length < 3) {
    return { valid: false, error: 'Question trop courte' };
  }
  
  return { valid: true, sanitized };
};

// Route IA sécurisée
app.post('/api/ai/ask', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const validation = validateQuestion(req.body.question);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    console.log(`🤖 Question [${validation.sanitized.length} chars]:`, sanitizeForLog(validation.sanitized));

    const prompt = `Tu es un expert technique spécialisé en chauffage et ECS. Réponds de manière concise et pratique.

Question: ${validation.sanitized}

Réponse:`;

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral:7b-instruct-q4_K_M',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.9,
        num_predict: 400
      }
    }, { 
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' }
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
    console.error(`❌ Erreur après ${processingTime}ms:`, sanitizeForLog(error.message));
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Service IA indisponible' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la génération' });
  }
});

// SSL sécurisé
const setupSSL = () => {
  const sslDir = path.join(__dirname, 'ssl');
  const keyPath = path.join(sslDir, 'key.pem');
  const certPath = path.join(sslDir, 'cert.pem');
  
  if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { mode: 0o700 });
  }
  
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('🔑 Génération SSL sécurisée...');
    try {
      execSync(`openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj '/CN=localhost'`, { stdio: 'ignore' });
      fs.chmodSync(keyPath, 0o600);
      fs.chmodSync(certPath, 0o644);
      console.log('✅ SSL généré avec permissions sécurisées');
    } catch (error) {
      console.error('❌ Erreur SSL:', error.message);
      return null;
    }
  }
  
  return { keyPath, certPath };
};

// Démarrage sécurisé
try {
  const sslPaths = setupSSL();
  
  if (sslPaths) {
    const httpsOptions = {
      key: fs.readFileSync(sslPaths.keyPath),
      cert: fs.readFileSync(sslPaths.certPath)
    };

    https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
      console.log(`🔒 HTTPS sécurisé: https://localhost:${HTTPS_PORT}`);
    });
  }

  // HTTP avec redirection forcée
  const httpApp = express();
  httpApp.use((req, res) => {
    res.redirect(301, `https://localhost:${HTTPS_PORT}${req.url}`);
  });
  
  httpApp.listen(PORT, () => {
    console.log(`🚀 HTTP (redirection): http://localhost:${PORT}`);
    console.log('✅ Serveur sécurisé prêt!');
  });

} catch (error) {
  console.error('❌ Erreur critique:', error.message);
  process.exit(1);
}