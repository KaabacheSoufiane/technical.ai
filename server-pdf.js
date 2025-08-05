const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const DatabaseManager = require('./database/database-manager');
const PDFProcessor = require('./pdf-processor');
require('dotenv').config();

const app = express();
const HTTPS_PORT = 5443;
const db = new DatabaseManager();
const pdfProcessor = new PDFProcessor();

// Configuration multer pour upload PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'docs/pdf/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

console.log('📚 Technical.AI Server avec PDF');

app.use(cors({
  origin: ['https://localhost:3000', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    name: 'Technical AI avec PDF', 
    version: '2.1.0', 
    database_stats: db.getStats(),
    pdf_stats: pdfProcessor.getStats()
  });
});

// Upload PDF
app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier PDF fourni' });
    }

    const metadata = {
      marque: req.body.marque,
      modele: req.body.modele,
      type: req.body.type
    };

    const processedDoc = await pdfProcessor.processPDF(req.file.path, metadata);
    
    res.json({
      success: true,
      message: 'PDF traité avec succès',
      data: {
        filename: processedDoc.filename,
        pages: processedDoc.pages,
        codes_erreur: processedDoc.codes_erreur.length,
        procedures: processedDoc.procedures.length,
        metadata: processedDoc.metadata
      }
    });

  } catch (error) {
    console.error('❌ Erreur upload PDF:', error.message);
    res.status(500).json({ error: 'Erreur lors du traitement du PDF' });
  }
});

// Route IA enrichie avec PDF + BDD
app.post('/api/ai/ask', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length < 3) {
      return res.status(400).json({ error: 'Question trop courte' });
    }

    const sanitizedQuestion = question.trim().substring(0, 500);
    console.log(`🤖 Question avec PDF+BDD:`, sanitizedQuestion.substring(0, 50) + '...');

    // Recherche dans la BDD
    const dbResults = db.smartSearch(sanitizedQuestion);
    
    // Recherche dans les PDF
    const pdfResults = pdfProcessor.searchInDocs(sanitizedQuestion);
    
    let contextFromSources = '';
    
    // Contexte BDD
    if (dbResults.equipments.length > 0) {
      contextFromSources += `\n=== BASE DE DONNÉES ===\n`;
      dbResults.equipments.forEach(eq => {
        contextFromSources += `${eq.marque} (${eq.type}): ${JSON.stringify(eq.data.modeles?.[0] || eq.data, null, 2)}\n`;
      });
    }

    // Contexte PDF
    if (pdfResults.length > 0) {
      contextFromSources += `\n=== DOCUMENTATION TECHNIQUE ===\n`;
      pdfResults.slice(0, 3).forEach(result => {
        contextFromSources += `Document: ${result.document} (${result.metadata.marque} ${result.metadata.modele})\n`;
        Object.entries(result.relevant_sections).forEach(([section, content]) => {
          contextFromSources += `${section}: ${content}\n`;
        });
      });
    }

    const prompt = `Tu es un expert technique avec accès à une base de données et à la documentation officielle des fabricants.
Utilise ces informations pour donner une réponse précise et technique.

${contextFromSources}

Question: ${sanitizedQuestion}

Réponse technique détaillée avec références:`;

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral:7b-instruct-q4_K_M',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1,
        max_tokens: 600
      }
    }, { timeout: 60000 });

    const processingTime = Date.now() - startTime;
    console.log(`✅ Réponse enrichie générée en ${processingTime}ms`);
    
    res.json({ 
      answer: response.data.response,
      processing_time: processingTime,
      sources: {
        database: dbResults.equipments.length > 0,
        pdf_docs: pdfResults.length,
        pdf_matches: pdfResults.slice(0, 3).map(r => ({
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

// Liste des PDF traités
app.get('/api/pdf/list', (req, res) => {
  const stats = pdfProcessor.getStats();
  res.json({ success: true, data: stats });
});

// Recherche dans les PDF
app.post('/api/pdf/search', (req, res) => {
  const { query, marque, type } = req.body;
  
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Requête trop courte' });
  }
  
  const results = pdfProcessor.searchInDocs(query, marque, type);
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
      console.log(`🔒 HTTPS Server avec PDF: https://localhost:${HTTPS_PORT}`);
      console.log(`📊 BDD:`, db.getStats());
      console.log(`📚 PDF:`, pdfProcessor.getStats());
      console.log('✅ Serveur avec PDF prêt!');
    });
  } else {
    console.error('❌ Certificats SSL manquants');
  }
};

startServer();