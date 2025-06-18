import express from 'express';
import { uploadMiddleware, uploadPdfHandler, getUserUploads, deletePdfUpload } from '../controllers/pdfController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/list', authenticateToken, getUserUploads);
router.post('/upload', authenticateToken, uploadMiddleware, uploadPdfHandler);
router.delete('/:id', authenticateToken, deletePdfUpload);

export default router;