import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name?: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
}

/**
 * FIX S-03: JWT stored in httpOnly cookies instead of localStorage
 * This middleware extracts JWT from httpOnly cookie or Authorization header
 */
export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | null = null;

    // Try to get token from httpOnly cookie first
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // Fallback to Authorization header
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * FIX S-01: Server-side RBAC middleware
 * ✅ Never trust client-submitted role — verify from JWT only
 * Usage: app.post('/api/admin/approve-seller', verifyAuth, verifyRole('admin', 'superadmin'), handler)
 */
export const verifyRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`,
      });
    }

    next();
  };
};

/**
 * FIX S-02, S-04: Handle token expiry with 401 response
 * Frontend will detect this and attempt silent refresh
 */
export const handleTokenRefresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const jwtSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
    const decoded = jwt.verify(refreshToken, jwtSecret) as JwtPayload;

    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role, name: decoded.name },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    // Set new token in httpOnly cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

export const authMiddleware = verifyAuth;
