import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
  actorRole?: UserRole;
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

export const requireRole = (roles: UserRole[]) => async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const actor = await User.findById(req.userId).select('role accountStatus');

    if (!actor) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (actor.accountStatus !== 'active') {
      res.status(403).json({ error: 'Account is not active' });
      return;
    }

    if (!roles.includes(actor.role as UserRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    req.actorRole = actor.role as UserRole;
    next();
  } catch (error) {
    next(error);
  }
};
