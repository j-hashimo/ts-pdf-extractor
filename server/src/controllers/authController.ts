import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

// Register a new user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
