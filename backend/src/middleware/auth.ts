import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload extends JwtPayload {
  _id: string;
  role?: string; // mentor | mentee (tùy bạn đưa vào token hay không)
}

// Kiểu user gắn lên req sau khi auth
export interface AuthUser {
  _id: string;
  role?: string;
}

// Request sau khi auth sẽ có thêm user
export interface AuthRequest extends Request {
  user?: AuthUser;
}

// ========== 1. Middleware xác thực JWT ==========
export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');

    // Bắt buộc header dạng "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.substring('Bearer '.length).trim();

    // Nếu server chưa cấu hình JWT secret → lỗi cấu hình
    if (!env.jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify token
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
    }) as TokenPayload;

    if (!decoded || !decoded._id) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Gắn user (kèm role nếu có trong token) vào request
    req.user = {
      _id: decoded._id,
      role: decoded.role,
    };

    return next();
  } catch (err) {
    console.error('Auth middleware error:', err);

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// ========== 2. Middleware phân quyền theo role ==========

/**
 * authorize(...allowedRoles)
 *  - Ví dụ: authorize('mentor'), authorize('mentee'), authorize('mentor', 'mentee')
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const role = req.user.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }

    return next();
  };
};

// Helper cho gọn khi dùng trong route
export const mentorOnly = authorize('mentor');
export const menteeOnly = authorize('mentee');
