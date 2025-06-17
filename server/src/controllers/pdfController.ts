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

    if (!file || !user) {
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

    // Save to DB
    const saved = await prisma.pdfUpload.create({
      data: {
        filename: file.originalname,
        userId: user.userId,
        highlights,
        images,
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
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Failed to process PDF' });
  }
};
