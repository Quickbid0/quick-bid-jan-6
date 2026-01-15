import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth, AuthedRequest } from '../../../middleware/authMiddleware';
import { getSellerRiskSummary, applySellerPenalty } from '../services/sellerRisk.service';

export const riskRouter = express.Router();

const requireAdminOrSuperAdmin = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

riskRouter.get('/risk/sellers/:sellerId', requireAuth, async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId) {
      return res.status(400).json({ error: 'sellerId is required' });
    }

    const callerId = req.user?.id;
    const callerRole = req.user?.role;

    if (!callerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (callerId !== sellerId && callerRole !== 'admin' && callerRole !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const summary = await getSellerRiskSummary(sellerId);
    if (!summary) {
      return res.status(404).json({ error: 'No risk data for seller' });
    }

    res.json(summary);
  } catch (err) {
    next(err);
  }
});

riskRouter.post(
  '/risk/sellers/:sellerId/penalties',
  requireAuth,
  requireAdminOrSuperAdmin,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const { sellerId } = req.params;
      if (!sellerId) {
        return res.status(400).json({ error: 'sellerId is required' });
      }

      const { type, severity, points, reason, evidenceJson, cooldownDays } = req.body || {};

      if (!type || typeof type !== 'string') {
        return res.status(400).json({ error: 'type is required' });
      }

      if (!severity || !['low', 'medium', 'high'].includes(String(severity))) {
        return res.status(400).json({ error: 'severity must be one of low, medium, high' });
      }

      const adminId = req.user?.id || null;

      const summary = await applySellerPenalty({
        sellerId,
        type,
        severity,
        points: typeof points === 'number' ? points : undefined,
        reason: typeof reason === 'string' ? reason : null,
        evidenceJson: evidenceJson && typeof evidenceJson === 'object' ? evidenceJson : {},
        appliedBy: adminId,
        cooldownDays: typeof cooldownDays === 'number' ? cooldownDays : undefined,
      });

      return res.status(200).json(summary);
    } catch (err) {
      next(err);
    }
  },
);
