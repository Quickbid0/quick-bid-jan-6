import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name?: string;
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

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : Array.isArray(authHeader) ? authHeader[0]?.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  await authMiddleware(req, res, (err) => {
    if (err) return next(err);
    
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  });
};

export const sellerAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  await authMiddleware(req, res, (err) => {
    if (err) return next(err);
    
    if (!req.user || (req.user.role !== 'seller' && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Seller access required' });
    }
    
    next();
  });
};

export const buyerAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  await authMiddleware(req, res, (err) => {
    if (err) return next(err);
    
    if (!req.user || (req.user.role !== 'buyer' && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Buyer access required' });
    }
    
    next();
  });
};
