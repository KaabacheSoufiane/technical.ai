// routes/ai.routes.ts
import { Router } from 'express';
import { askAI } from '../controlloers/ai.controller';

const router = Router();

router.post('/ask', askAI);

export default router;
