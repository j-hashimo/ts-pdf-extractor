import { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { prisma } from '../app';

const upload = multer({ dest: 'uploads/' });
export const uploadMiddleware = upload.single('pdf');

export const uploadPdfHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const file = req.file;

    console.log('📥 Upload received');
    console.log('👤 User:', user);
    console.log('📄 File:', file);

    if (!file || !user) {
      console.log('❌ Missing:', {
        userExists: !!user,
        fileExists: !!file,
      });
      res.status(400).json({ message: 'Missing file or authentication' });
      return;
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), {
      filename: file.originalname,
    });

    const pythonRes = await axios.post('http://localhost:8000/extract', formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const { highlights, images } = pythonRes.data;

    const saved = await prisma.pdfUpload.create({
      data: {
        filename: file.originalname,
        userId: user.userId,
        highlights,
        images: {
          create: images.map((img: string) => ({
            imageData: img,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    fs.unlink(file.path, () => {}); // cleanup temp file

    res.status(200).json({
      message: 'PDF processed',
      highlights,
      images,
      pdfId: saved.id,
    });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ message: 'Failed to process PDF' });
  }
};

export const getUserUploads = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    console.log("👤 Fetching uploads for userId:", user?.userId);

    const uploads = await prisma.pdfUpload.findMany({
      where: { userId: user.userId }, // ✅ user-specific filter
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(uploads);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch uploads' });
  }
};

export const deletePdfUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const pdfId = parseInt(req.params.id);
    const userId = (req as any).user.userId;

    const existing = await prisma.pdfUpload.findUnique({
      where: { id: pdfId },
      include: { images: true },
    });

    if (!existing || existing.userId !== userId) {
      res.status(403).json({ message: 'Not allowed to delete this PDF' });
      return;
    }

    await prisma.image.deleteMany({ where: { pdfUploadId: pdfId } });
    await prisma.pdfUpload.delete({ where: { id: pdfId } });

    res.status(200).json({ message: 'PDF deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete PDF' });
  }
};

