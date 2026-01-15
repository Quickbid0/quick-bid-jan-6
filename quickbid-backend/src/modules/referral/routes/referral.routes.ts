import { Router, Request, Response } from 'express';
import { requireAuth } from '../../../middleware/authMiddleware';
import { requirePermission } from '../../rbac/middleware/requirePermission';
import { applyFirstDepositBonus, applyFirstBidBonus } from '../referral.service';
import { ReferralBonusHistory } from '../models/ReferralBonusHistory';
import { ReferralBonusRule } from '../models/ReferralBonusRule';

export const referralRouter = Router();

// Apply first deposit bonus
referralRouter.post(
  '/referral/apply-first-deposit-bonus',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId, depositAmount, walletTransactionId, deviceId, ipAddress } = req.body;
      if (!userId || !depositAmount || !walletTransactionId) {
        return res.status(400).json({ message: 'userId, depositAmount and walletTransactionId are required' });
      }

      const result = await applyFirstDepositBonus({
        userId,
        depositAmount,
        walletTransactionId,
        deviceId,
        ipAddress,
      });

      res.json(result);
    } catch (err: any) {
      console.error('apply-first-deposit-bonus error', err);
      res.status(500).json({ message: 'Failed to apply first deposit bonus', error: err.message });
    }
  }
);

// Apply first bid bonus
referralRouter.post(
  '/referral/apply-first-bid-bonus',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId, bidId, deviceId, ipAddress } = req.body;
      if (!userId || !bidId) {
        return res.status(400).json({ message: 'userId and bidId are required' });
      }

      const result = await applyFirstBidBonus({ userId, bidId, deviceId, ipAddress });
      res.json(result);
    } catch (err: any) {
      console.error('apply-first-bid-bonus error', err);
      res.status(500).json({ message: 'Failed to apply first bid bonus', error: err.message });
    }
  }
);

// Bonus history for current user (or specific user if you add RBAC later)
referralRouter.get('/referral/bonus/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const currentUserId = (req as any).user?.id;
    const targetUserId = (userId as string) || currentUserId;

    if (!targetUserId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const history = await ReferralBonusHistory.find({ referrerUserId: targetUserId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(history);
  } catch (err: any) {
    console.error('bonus history error', err);
    res.status(500).json({ message: 'Failed to fetch bonus history', error: err.message });
  }
});

// Admin: list referral bonus history with filters
referralRouter.get(
  '/admin/referral/bonus/history',
  requireAuth,
  requirePermission('referral.history.view_all'),
  async (req: Request, res: Response) => {
    try {
      const {
        status,
        source,
        eventType,
        referrerUserId,
        referredUserId,
        from,
        to,
        searchTerm,
        limit = '50',
        offset = '0',
      } = req.query as Record<string, string>;

      const query: any = {};
      if (status) query.status = status;
      if (source) query.source = source;
      if (eventType) query.eventType = eventType;
      if (referrerUserId) query.referrerUserId = referrerUserId;
      if (referredUserId) query.referredUserId = referredUserId;

      // Date range filter on createdAt
      if (from || to) {
        const range: any = {};
        if (from) range.$gte = new Date(from);
        if (to) range.$lte = new Date(to);
        query.createdAt = range;
      }

      // Search term across referrerUserId and referredUserId
      if (searchTerm) {
        const regex = new RegExp(searchTerm, 'i');
        query.$or = [
          { referrerUserId: regex },
          { referredUserId: regex },
        ];
      }

      const lim = Math.min(parseInt(limit, 10) || 50, 200);
      const off = parseInt(offset, 10) || 0;

      const [items, total] = await Promise.all([
        ReferralBonusHistory.find(query)
          .sort({ createdAt: -1 })
          .skip(off)
          .limit(lim)
          .lean(),
        ReferralBonusHistory.countDocuments(query),
      ]);

      res.json({ items, total });
    } catch (err: any) {
      console.error('admin bonus history error', err);
      res.status(500).json({ message: 'Failed to fetch referral bonus history', error: err.message });
    }
  }
);

// Admin: update referral bonus status (approve/reject/mark credited)
referralRouter.patch(
  '/admin/referral/bonus/:id/status',
  requireAuth,
  requirePermission('referral.payout.approve'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body as { status?: string; reason?: string };

      if (!status || !['approved', 'rejected', 'credited'].includes(status)) {
        return res.status(400).json({ message: 'status must be one of approved, rejected, credited' });
      }

      const updates: any = {
        status,
      };
      if (reason) updates.reason = reason;
      if (status === 'approved' || status === 'credited') {
        updates.approvedBy = (req as any).user?.id || 'system';
      }

      const updated = await ReferralBonusHistory.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({ message: 'Referral bonus record not found' });
      }

      res.json(updated);
    } catch (err: any) {
      console.error('admin update referral bonus status error', err);
      res.status(500).json({ message: 'Failed to update referral bonus status', error: err.message });
    }
  }
);

// Admin: freeze / unfreeze referral bonus for fraud review
referralRouter.patch(
  '/admin/referral/bonus/:id/freeze',
  requireAuth,
  requirePermission('referral.bonus.freeze'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { frozen, fraudNotes } = req.body as { frozen?: boolean; fraudNotes?: string };

      const isFrozen = !!frozen;
      const updates: any = {
        status: isFrozen ? 'frozen' : 'pending',
        flaggedFraud: isFrozen,
      };

      if (typeof fraudNotes === 'string') {
        updates.fraudNotes = fraudNotes;
      }

      if (isFrozen) {
        updates.frozenBy = (req as any).user?.id || 'system';
      }

      const updated = await ReferralBonusHistory.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({ message: 'Referral bonus record not found' });
      }

      res.json(updated);
    } catch (err: any) {
      console.error('admin freeze referral bonus error', err);
      res.status(500).json({ message: 'Failed to update referral bonus freeze state', error: err.message });
    }
  }
);

// Admin: update referral bonus settings (single rule per type)
referralRouter.put(
  '/admin/referral/bonus/settings',
  requireAuth,
  requirePermission('referral.settings.manage'),
  async (req: Request, res: Response) => {
    try {
      const { type, ...settings } = req.body;
      if (!type) {
        return res.status(400).json({ message: 'type is required' });
      }

      const updated = await ReferralBonusRule.findOneAndUpdate(
        { type },
        {
          $set: {
            ...settings,
            updatedBy: (req as any).user?.id || 'system',
          },
          $setOnInsert: {
            createdBy: (req as any).user?.id || 'system',
          },
        },
        { new: true, upsert: true }
      ).lean();

      res.json(updated);
    } catch (err: any) {
      console.error('update referral settings error', err);
      res.status(500).json({ message: 'Failed to update referral settings', error: err.message });
    }
  }
);
