import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as { userId: string };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as { userId: string };
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    next();
  }
};
