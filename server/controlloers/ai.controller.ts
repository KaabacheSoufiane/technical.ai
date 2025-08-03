import { Request, Response } from 'express';
import mistralClient from '../services/mistralClient';

// Fonction de sanitisation simple
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>"'&]/g, '') // Supprime caractères dangereux
    .trim()
    .substring(0, 500); // Limite la taille
};

export const askAI = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    
    // Debug en développement
    if (process.env.NODE_ENV !== 'production') {
      console.log('🤖 Requête IA reçue:', { questionLength: question?.length });
    }

    // Validation et sanitisation
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question invalide.' });
    }

    const sanitizedQuestion = sanitizeInput(question);
    
    if (sanitizedQuestion.length < 3) {
      return res.status(400).json({ error: 'Question trop courte (minimum 3 caractères).' });
    }

    // Prompt optimisé pour techniciens chauffage/ECS
    const systemPrompt = `Tu es un expert technique spécialisé en chauffage individuel et production d'eau chaude sanitaire (ECS). 
Réponds de manière concise et pratique avec des solutions concrètes. 
Si possible, mentionne les vérifications à effectuer et les pièces potentiellement défaillantes.`;

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔑 Clé API Mistral:', process.env.MISTRAL_API_KEY ? 'Présente' : 'Manquante');
    }

    const response = await mistralClient.post('/chat/completions', {
      model: 'open-mistral-nemo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: sanitizedQuestion }
      ],
      max_tokens: 300,
      temperature: 0.3
    });

    const answer = response.data.choices?.[0]?.message?.content;
    
    if (!answer) {
      return res.status(500).json({ error: 'Réponse vide de l\'IA.' });
    }

    res.json({ answer: answer.trim() });
  } catch (error: any) {
    // Logging sécurisé (pas de données sensibles)
    const errorLog = {
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/ask',
      status: error.response?.status || 'unknown',
      message: error.message || 'Unknown error'
    };
    console.error('API Error:', errorLog);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'Erreur de configuration API.' });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Limite de requêtes atteinte. Réessayez dans quelques minutes.' });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Timeout - Requête trop longue.' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la génération de la réponse.' });
  }
};
