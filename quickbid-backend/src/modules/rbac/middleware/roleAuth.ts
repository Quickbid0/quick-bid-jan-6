import { Request, Response, NextFunction } from 'express';
import { AuthedRequest } from '../../../middleware/authMiddleware';
import { verifyToken } from '../../../utils/jwt';

interface TokenPayload {
  sub: string;
  role: string;
  [key: string]: unknown;
}

const extractBearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.substring('Bearer '.length);
};

const requireRole = (role?: string, allowedRoles?: string[]) => {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Missing authorization header' });
    }

    try {
      const payload = verifyToken(token);
      if (!payload?.sub) {
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      if (role && payload.role !== role) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }

      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }

      req.user = {
        id: payload.sub,
        role: payload.role,
      };
      res.locals.user = payload;
      return next();
    } catch (err) {
      console.error('roleAuth error', err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

export const requireAnyAuth = requireRole();
export const requireSalesAuth = requireRole('sales');
export const requireMarketingAuth = requireRole('marketing');
export const requireAdminAuth = requireRole('admin');
