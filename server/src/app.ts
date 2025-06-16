import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes';
import pdfRoutes from './routes/pdfRoutes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/pdf', pdfRoutes);

// Health check route
app.get('/', (req, res) => {
    res.send('PDF Extraction API is running 🚀');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export Prisma so services/controllers can use it
export { prisma };
