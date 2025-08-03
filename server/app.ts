import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.routes';
import docRoutes from './routes/doc.routes';
import publicRoutes from './routes/public.routes';

const app = express();

// Middleware de redirection HTTPS
app.use((req, res, next) => {
  // Force HTTPS en production et optionnel en dev
  if (req.header('x-forwarded-proto') !== 'https' && 
      (process.env.NODE_ENV === 'production' || process.env.FORCE_HTTPS === 'true')) {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  next();
});

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://localhost:3000', 'https://technical-ai.com'] 
    : ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Protection CSRF simple (dev)
app.use((req, res, next) => {
  if (req.method === 'POST' && process.env.NODE_ENV === 'production') {
    const origin = req.get('Origin');
    const allowedOrigins = ['https://localhost:3000', 'https://technical-ai.com'];
    if (!origin || !allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: 'Origine non autorisée' });
    }
  }
  next();
});

// Rate limiting simple
const requestCounts = new Map();
app.use('/api/ai', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 10;
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip)!.filter((time: number) => now - time < windowMs);
  
  if (requests.length >= maxRequests) {
    return res.status(429).json({ error: 'Trop de requêtes. Attendez 1 minute.' });
  }
  
  requests.push(now);
  requestCounts.set(ip, requests);
  return next();
});

// Routes publiques
app.use(publicRoutes);

// Routes API protégées
app.use('/api/ai', aiRoutes);
app.use('/api/docs', docRoutes);

export default app;
