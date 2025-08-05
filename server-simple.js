const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;

console.log('🚀 Technical.AI Server Simple');

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
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

// Route IA
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length < 3) {
      return res.status(400).json({ error: 'Question trop courte' });
    }

    const sanitizedQuestion = question.trim().substring(0, 500);
    console.log('🤖 Question:', sanitizedQuestion.substring(0, 50) + '...');

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

    console.log('✅ Réponse générée');
    res.json({ 
      answer: response.data.response,
      processing_time: Date.now()
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    res.status(500).json({ error: 'Erreur lors de la génération' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 HTTP: http://localhost:${PORT}`);
  console.log('✅ Serveur prêt!');
});