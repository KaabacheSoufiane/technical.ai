import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.routes';
import docRoutes from './routes/doc.routes';

const app = express();

// Middleware de redirection HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://localhost:3000', 'https://technical-ai.com'] 
    : ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting simple
const requestCounts = new Map();
app.use('/api/ai', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip).filter((time: number) => now - time < windowMs);
  
  if (requests.length >= maxRequests) {
    return res.status(429).json({ error: 'Trop de requêtes. Attendez 1 minute.' });
  }
  
  requests.push(now);
  requestCounts.set(ip, requests);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/docs', docRoutes);

export default app;
