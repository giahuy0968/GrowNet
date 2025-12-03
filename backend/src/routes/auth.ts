import express from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const router = express.Router();

// Minimal token issuer for development/testing
// POST /api/auth/token { userId: string }
router.post('/token', (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const token = jwt.sign({ _id: userId }, secret, { expiresIn: '7d' });

        res.json({ token });
    } catch (err) {
        console.error('Issue token error:', err);
        res.status(500).json({ error: 'Failed to issue token' });
    }
});

export default router;