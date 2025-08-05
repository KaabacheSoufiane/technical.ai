const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const DatabaseManager = require('./database/database-manager');
require('dotenv').config();

const app = express();
const HTTPS_PORT = 5443;
const db = new DatabaseManager();

console.log('🔒 Technical.AI Server avec Base de Données');

// CORS
app.use(cors({
  origin: ['https://localhost:3000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    name: 'Technical AI avec BDD', 
    version: '2.0.0', 
    status: 'running',
    database_stats: db.getStats()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Route recherche équipement
app.get('/api/equipment/:marque/:modele', (req, res) => {
  const { marque, modele } = req.params;
  const type = req.query.type || 'chaudieres';
  
  const equipment = db.findEquipment(marque, modele, type);
  if (equipment) {
    res.json({ success: true, data: equipment });
  } else {
    res.status(404).json({ error: 'Équipement non trouvé' });
  }
});

// Route code erreur
app.get('/api/error/:marque/:code', (req, res) => {
  const { marque, code } = req.params;
  
  const errorInfo = db.findErrorCode(marque, code);
  if (errorInfo) {
    res.json({ success: true, data: errorInfo });
  } else {
    res.status(404).json({ error: 'Code erreur non trouvé' });
  }
});

// Route IA enrichie avec BDD
app.post('/api/ai/ask', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length < 3) {
      return res.status(400).json({ error: 'Question trop courte' });
    }

    const sanitizedQuestion = question.trim().substring(0, 500);
    console.log(`🤖 Question avec BDD:`, sanitizedQuestion.substring(0, 50) + '...');

    // Recherche dans la BDD
    const dbResults = db.smartSearch(sanitizedQuestion);
    let contextFromDB = '';
    
    if (dbResults.equipments.length > 0) {
      contextFromDB = `\nInformations de la base de données:\n`;
      dbResults.equipments.forEach(eq => {
        contextFromDB += `- ${eq.marque} (${eq.type}): ${JSON.stringify(eq.data.modeles?.[0] || eq.data, null, 2)}\n`;
      });
    }

    // Recherche code erreur si détecté
    const codeMatch = sanitizedQuestion.match(/[A-Z]\d+|F\d+|E\d+/i);
    if (codeMatch) {
      const marqueMatch = sanitizedQuestion.match(/viessmann|saunier|bosch|atlantic|thermor/i);
      if (marqueMatch) {
        const errorInfo = db.findErrorCode(marqueMatch[0], codeMatch[0].toUpperCase());
        if (errorInfo) {
          contextFromDB += `\nCode erreur ${codeMatch[0]}:\n${JSON.stringify(errorInfo, null, 2)}\n`;
        }
      }
    }

    const prompt = `Tu es un expert technique spécialisé en chauffage et ECS avec accès à une base de données complète.
Utilise les informations de la base de données ci-dessous pour enrichir ta réponse.

${contextFromDB}

Question: ${sanitizedQuestion}

Réponse technique détaillée:`;

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral:7b-instruct-q4_K_M',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.2,
        max_tokens: 500
      }
    }, { timeout: 45000 });

    const processingTime = Date.now() - startTime;
    console.log(`✅ Réponse avec BDD générée en ${processingTime}ms`);
    
    res.json({ 
      answer: response.data.response,
      processing_time: processingTime,
      database_context: dbResults.equipments.length > 0,
      protocol: 'https'
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Erreur après ${processingTime}ms:`, error.message);
    res.status(500).json({ error: 'Erreur lors de la génération' });
  }
});

// Route recherche globale
app.post('/api/search', (req, res) => {
  const { query } = req.body;
  
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Requête trop courte' });
  }
  
  const results = db.smartSearch(query);
  res.json({ success: true, data: results });
});

// Démarrage HTTPS
const startServer = () => {
  const keyPath = path.join(__dirname, 'ssl', 'key.pem');
  const certPath = path.join(__dirname, 'ssl', 'cert.pem');
  
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
      console.log(`🔒 HTTPS Server avec BDD: https://localhost:${HTTPS_PORT}`);
      console.log(`📊 Stats BDD:`, db.getStats());
      console.log('✅ Serveur avec base de données prêt!');
    });
  } else {
    console.error('❌ Certificats SSL manquants');
  }
};

startServer();