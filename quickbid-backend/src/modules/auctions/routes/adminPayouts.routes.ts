import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../../supabaseAdmin';
import { recordSettlementForPayout } from '../services/settlementLedger.service';
import { requireAuth, AuthedRequest } from '../../../middleware/authMiddleware';

export const adminPayoutsRouter = express.Router();

const requireAdminOrSuperAdmin = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

adminPayoutsRouter.post(
  '/payouts/:payoutId/complete',
  requireAuth,
  requireAdminOrSuperAdmin,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const { payoutId } = req.params;
      if (!payoutId) {
        return res.status(400).json({ error: 'payoutId is required' });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      const { data: payout, error: selectErr } = await supabaseAdmin
        .from('payouts')
        .select('id, status')
        .eq('id', payoutId)
        .maybeSingle();

      if (selectErr) {
        console.error('admin complete payout: select error', selectErr);
        return res.status(500).json({ error: 'Failed to load payout' });
      }

      if (!payout) {
        return res.status(404).json({ error: 'Payout not found' });
      }

      if (payout.status === 'completed') {
        // Idempotent: still trigger ledger in case it was missed earlier
        await recordSettlementForPayout({ payoutId });
        return res.status(200).json({ status: 'already_completed' });
      }

      const { error: updateErr } = await supabaseAdmin
        .from('payouts')
        .update({ status: 'completed' })
        .eq('id', payoutId);

      if (updateErr) {
        console.error('admin complete payout: update error', updateErr);
        return res.status(500).json({ error: 'Failed to mark payout as completed' });
      }

      await recordSettlementForPayout({ payoutId });

      return res.status(200).json({ status: 'completed' });
    } catch (err) {
      next(err);
    }
  }
);
