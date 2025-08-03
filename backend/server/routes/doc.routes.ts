import { Router } from 'express';
import { uploadDoc, listDocs } from '../controllers/doc.controller';

const router = Router();

router.post('/upload', uploadDoc);
router.get('/', listDocs);

export default router;
