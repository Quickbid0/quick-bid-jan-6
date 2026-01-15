import express from 'express';
import type { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../../supabaseAdmin';
import { requireAuth, AuthedRequest } from '../../../middleware/authMiddleware';

export const payoutsRouter = express.Router();

const requireAdminOrSuperAdmin = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Admin endpoint: list payouts with optional seller/status filters
payoutsRouter.get(
  '/admin/payouts',
  requireAuth,
  requireAdminOrSuperAdmin,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      const sellerId = (req.query.sellerId as string) || null;
      const status = (req.query.status as string) || null;

      let q = supabaseAdmin
        .from('payouts')
        .select(
          `
          id,
          seller_id,
          status,
          sale_price,
          commission_amount,
          net_payout,
          payout_reference,
          created_at,
          paid_at,
          seller:profiles(id, name, email, phone)
        `,
        );

      if (sellerId) {
        q = q.eq('seller_id', sellerId);
      }

      if (status) {
        q = q.eq('status', status);
      }

      const { data, error } = await q.order('created_at', { ascending: false });

      if (error) {
        console.error('admin payouts list error', error);
        return res.status(500).json({ error: 'Failed to load payouts' });
      }

      return res.json(data || []);
    } catch (err) {
      next(err);
    }
  },
);
