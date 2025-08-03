import { Request, Response } from 'express';
import mistralClient from '../services/mistralClient';

export const askAI = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    // Validation améliorée
    if (!question || question.trim().length < 3) {
      return res.status(400).json({ error: 'Question trop courte (minimum 3 caractères).' });
    }

    if (question.length > 500) {
      return res.status(400).json({ error: 'Question trop longue (maximum 500 caractères).' });
    }

    // Prompt optimisé pour techniciens chauffage/ECS
    const systemPrompt = `Tu es un expert technique spécialisé en chauffage individuel et production d'eau chaude sanitaire (ECS). 
Réponds de manière concise et pratique avec des solutions concrètes. 
Si possible, mentionne les vérifications à effectuer et les pièces potentiellement défaillantes.`;

    const response = await mistralClient.post('/chat/completions', {
      model: 'open-mistral-nemo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question.trim() }
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
    console.error('Erreur Mistral:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'Clé API Mistral invalide.' });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Limite de requêtes atteinte. Réessayez dans quelques minutes.' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la génération de la réponse.' });
  }
};
