import { Router } from 'express';

const router = Router();

// Route d'accueil sécurisée
router.get('/', (req, res) => {
  res.json({ 
    name: 'Technical AI API', 
    version: '1.0.0', 
    status: 'running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Route de test (à supprimer en production)
router.get('/api/test', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Route non disponible en production' });
  }
  res.json({ message: 'API Test - Développement uniquement' });
});

export default router;