const express = require('express');
const cors = require('cors');
const axios = require('axios');
const DatabaseManager = require('./database/database-manager');
const PDFProcessor = require('./pdf-processor');
require('dotenv').config();

const app = express();
const PORT = 8080;
const db = new DatabaseManager();
const pdfProcessor = new PDFProcessor();

console.log('🚀 Technical.AI Server HTTP Simple');

app.use(cors({
  origin: '*',
  credentials: false
}));

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({ 
    name: 'Technical AI HTTP', 
    version: '1.0.0', 
    status: 'running',
    database_stats: db.getStats(),
    pdf_stats: pdfProcessor.getStats()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    protocol: 'http'
  });
});

app.post('/api/ai/ask', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length < 3) {
      return res.status(400).json({ error: 'Question trop courte' });
    }

    const sanitizedQuestion = question.trim().substring(0, 500);
    console.log(`🤖 Question:`, sanitizedQuestion.substring(0, 50) + '...');

    // Recherche dans les PDF
    const pdfResults = pdfProcessor.searchInDocs(sanitizedQuestion);
    
    let contextFromSources = '';
    
    if (pdfResults.length > 0) {
      contextFromSources += `\n=== DOCUMENTATION TECHNIQUE ===\n`;
      pdfResults.slice(0, 2).forEach(result => {
        contextFromSources += `Document: ${result.document}\n`;
        Object.entries(result.relevant_sections).forEach(([section, content]) => {
          contextFromSources += `${section}: ${content}\n`;
        });
      });
    }

    const prompt = `Tu es un expert technique spécialisé en chauffage et ECS.
Utilise la documentation ci-dessous pour répondre précisément.

${contextFromSources}

Question: ${sanitizedQuestion}

Réponse technique détaillée:`;

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral:7b-instruct-q4_K_M',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.2,
        max_tokens: 400
      }
    }, { timeout: 30000 });

    const processingTime = Date.now() - startTime;
    console.log(`✅ Réponse générée en ${processingTime}ms`);
    
    res.json({ 
      answer: response.data.response,
      processing_time: processingTime,
      sources: {
        pdf_docs: pdfResults.length,
        pdf_matches: pdfResults.slice(0, 2).map(r => ({
          document: r.document,
          brand: r.metadata.marque,
          score: r.score
        }))
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Erreur après ${processingTime}ms:`, error.message);
    res.status(500).json({ error: 'Erreur lors de la génération' });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 HTTP Server: http://localhost:${PORT}`);
  console.log(`📊 BDD:`, db.getStats());
  console.log(`📚 PDF:`, pdfProcessor.getStats());
  console.log('✅ Serveur HTTP prêt!');
});