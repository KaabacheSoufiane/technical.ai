import { Router } from 'express';
import { uploadDoc, listDocs } from '../controlloers/doc.controller';

const router = Router();

router.post('/upload', uploadDoc);
router.get('/', listDocs);

export default router;
