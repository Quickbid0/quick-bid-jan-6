import { Response, NextFunction } from 'express';
import { AuthedRequest } from '../../../middleware/authMiddleware';
import { verifyToken } from '../../../utils/jwt';
import { findSalesUserById } from '../services/salesAuth.service';

export const requireSalesAuth = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  try {
    const token = authHeader.substring('Bearer '.length);
    const payload = verifyToken(token);

    if (payload.role !== 'sales') {
      return res.status(403).json({ message: 'Forbidden: sales access required' });
    }

    const user = await findSalesUserById(payload.sub);
    if (!user || user.status !== 'active') {
      return res.status(403).json({ message: 'Sales user is inactive' });
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    res.locals.salesUser = user;

    return next();
  } catch (err) {
    console.error('requireSalesAuth error', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
