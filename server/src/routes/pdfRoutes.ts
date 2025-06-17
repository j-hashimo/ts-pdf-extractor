import express from 'express';
import { uploadMiddleware, uploadPdfHandler } from '../controllers/pdfController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/upload', authenticateToken, uploadMiddleware, uploadPdfHandler);

export default router;
