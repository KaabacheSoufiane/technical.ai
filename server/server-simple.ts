import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Routes de base
app.get('/', (req, res) => {
  res.json({ 
    name: 'Technical AI API', 
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

// Route IA simplifiée
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question requise' });
    }

    if (!process.env.MISTRAL_API_KEY) {
      return res.status(500).json({ error: 'Clé API Mistral non configurée' });
    }

    const response = await axios.post('https://api.mistral.ai/v1/chat/completions', {
      model: 'open-mistral-nemo',
      messages: [
        { role: 'system', content: 'Tu es un expert technique en chauffage et ECS. Réponds de manière concise.' },
        { role: 'user', content: question }
      ],
      max_tokens: 300
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const answer = response.data.choices?.[0]?.message?.content;
    res.json({ answer });

  } catch (error: any) {
    console.error('Erreur API:', error.message);
    res.status(500).json({ error: 'Erreur lors de la génération de la réponse' });
  }
});

// Démarrage des serveurs
try {
  // HTTPS
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem'))
  };

  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    console.log(`🔒 HTTPS Server: https://localhost:${HTTPS_PORT}`);
  });

  // HTTP
  app.listen(PORT, () => {
    console.log(`🚀 HTTP Server: http://localhost:${PORT}`);
  });

} catch (error) {
  console.error('❌ Erreur serveur:', error);
  process.exit(1);
}