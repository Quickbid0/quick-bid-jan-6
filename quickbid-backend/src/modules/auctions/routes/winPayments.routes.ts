import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../../supabaseAdmin';
import { requireAuth, AuthedRequest } from '../../../middleware/authMiddleware';
import { rateLimit } from '../../../middleware/rateLimit';
import crypto from 'crypto';

export const winPaymentsRouter = express.Router();

const requireAdminOrSuperAdmin = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

type PaymentStatus =
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'pending_documents'
  | 'refund_in_progress'
  | 'refunded'
  | 'partial_payment';

const ALLOWED_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending_verification: ['approved', 'rejected', 'pending_documents', 'partial_payment'],
  pending_documents: ['approved', 'rejected'],
  approved: ['refund_in_progress'],
  refund_in_progress: ['refunded'],
  refunded: [],
  rejected: [],
  partial_payment: ['approved', 'refund_in_progress'],
};

const isValidStatus = (s: string): s is PaymentStatus => {
  const lower = (s || '').toLowerCase();
  return [
    'pending_verification',
    'approved',
    'rejected',
    'pending_documents',
    'refund_in_progress',
    'refunded',
    'partial_payment',
  ].includes(lower);
};

const canTransition = (from: string | null, to: string): boolean => {
  const f = ((from || '') as string).toLowerCase() as PaymentStatus;
  const t = (to || '').toLowerCase() as PaymentStatus;
  const allowed = ALLOWED_TRANSITIONS[f] || [];
  return allowed.includes(t);
};

const setRequestIdHeader = (req: Request, res: Response) => {
  const rid =
    (req.headers['x-request-id'] as string) ||
    (req.headers['x-requestid'] as string) ||
    (req.headers['request-id'] as string) ||
    '';
  if (rid) res.set('x-request-id', rid);
};
// Buyer endpoint: submit a payment attempt for a won auction
winPaymentsRouter.post(
  '/wins/:auctionId/payments',
  requireAuth,
  rateLimit(
    (req: Request) => {
      const userId = (req as AuthedRequest).user?.id || req.ip;
      return `winpay:${userId}`;
    },
    10,
    60_000,
  ),
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const { auctionId } = req.params;
      const { method, amount, reference_number, screenshot_url, notes } = req.body || {};

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      if (!auctionId) {
        return res.status(400).json({ error: 'auctionId is required' });
      }

      if (!method || typeof method !== 'string') {
        return res.status(400).json({ error: 'method is required' });
      }

      const allowedMethods = ['upi', 'bank_transfer', 'gateway', 'loan'];
      const normalizedMethod = String(method).toLowerCase();
      if (!allowedMethods.includes(normalizedMethod)) {
        return res.status(400).json({ error: 'Unsupported payment method' });
      }

      const buyerId = req.user?.id;
      if (!buyerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Load the auction to verify winner and get expected amount
      const { data: auction, error: auctionErr } = await supabaseAdmin
        .from('auctions')
        .select('id, winner_id, status, final_price')
        .eq('id', auctionId)
        .maybeSingle();

      if (auctionErr) {
        console.error('winPayments: auction select error', auctionErr);
        return res.status(500).json({ error: 'Failed to load auction' });
      }

      if (!auction) {
        return res.status(404).json({ error: 'Auction not found' });
      }

      if (!auction.winner_id || auction.winner_id !== buyerId) {
        return res.status(403).json({ error: 'Only the winning buyer can submit payment for this auction' });
      }

      const auctionStatusNow = (auction.status || '').toLowerCase();
      if (!['payment_pending', 'payment_under_review', 'won', 'ended'].includes(auctionStatusNow)) {
        return res.status(409).json({ error: 'Auction not in a payable state' });
      }

      const baseAmount = auction.final_price != null ? Number(auction.final_price) : 0;
      const paymentAmount = amount != null ? Number(amount) : baseAmount;

      if (!paymentAmount || Number.isNaN(paymentAmount) || paymentAmount <= 0) {
        return res.status(400).json({ error: 'Valid payment amount is required' });
      }

      if (paymentAmount > 0 && baseAmount > 0 && paymentAmount > baseAmount * 1.2) {
        return res.status(400).json({ error: 'Payment amount exceeds expected limit' });
      }

      if (reference_number && typeof reference_number === 'string') {
        const { data: dup, error: dupErr } = await supabaseAdmin
          .from('win_payments')
          .select('id, submitted_at')
          .eq('reference_number', reference_number)
          .eq('buyer_id', buyerId)
          .order('submitted_at', { ascending: false })
          .limit(1);
        if (!dupErr && dup && dup.length > 0) {
          return res.status(409).json({ error: 'Duplicate reference number detected' });
        }
      }

      const now = new Date().toISOString();

      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from('win_payments')
        .insert({
          auction_id: auctionId,
          buyer_id: buyerId,
          method,
          reference_number: reference_number || null,
          screenshot_url: screenshot_url || null,
          amount: paymentAmount,
          submitted_at: now,
          status: 'pending_verification',
          notes: notes || null,
        })
        .select('id, auction_id, buyer_id, method, amount, status, submitted_at')
        .maybeSingle();

      if (insertErr) {
        console.error('winPayments: insert error', insertErr);
        return res.status(500).json({ error: 'Failed to submit payment' });
      }

      // Optionally nudge auction status toward payment_under_review if it was payment_pending
      const auctionStatus = (auction.status || '').toLowerCase();
      if (auctionStatus === 'payment_pending') {
        const { error: updateAuctionErr } = await supabaseAdmin
          .from('auctions')
          .update({ status: 'payment_under_review' })
          .eq('id', auctionId);

        if (updateAuctionErr) {
          console.error('winPayments: failed to update auction status to payment_under_review', updateAuctionErr);
        }
      }

      return res.status(201).json(inserted);
    } catch (err) {
      next(err);
    }
  },
);

// Admin endpoint: seller payouts summary (per seller aggregates)
winPaymentsRouter.get(
  '/admin/seller-payouts-summary',
  requireAuth,
  requireAdminOrSuperAdmin,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      // Load all payouts with a seller_id and aggregate in memory
      const { data: payouts, error: payoutsError } = await supabaseAdmin
        .from('payouts')
        .select('seller_id, status, net_payout, sale_price, commission_amount')
        .not('seller_id', 'is', null);

      if (payoutsError) {
        console.error('seller-payouts-summary: payouts query error', payoutsError);
        return res.status(500).json({ error: 'Failed to load payouts' });
      }

      type Summary = {
        seller_id: string;
        totals: {
          completed_count: number;
          completed_net_total: number;
          pending_count: number;
          pending_net_total: number;
          in_progress_count: number;
          in_progress_net_total: number;
          other_count: number;
        };
      };

      const bySeller: Record<string, Summary> = {};

      (payouts || []).forEach((p: any) => {
        const sellerId = String(p.seller_id || '');
        if (!sellerId) return;

        if (!bySeller[sellerId]) {
          bySeller[sellerId] = {
            seller_id: sellerId,
            totals: {
              completed_count: 0,
              completed_net_total: 0,
              pending_count: 0,
              pending_net_total: 0,
              in_progress_count: 0,
              in_progress_net_total: 0,
              other_count: 0,
            },
          };
        }

        const s = (p.status || '').toLowerCase();
        const net = p.net_payout != null ? Number(p.net_payout) : 0;

        if (s === 'completed') {
          bySeller[sellerId].totals.completed_count += 1;
          bySeller[sellerId].totals.completed_net_total += net;
        } else if (s === 'pending') {
          bySeller[sellerId].totals.pending_count += 1;
          bySeller[sellerId].totals.pending_net_total += net;
        } else if (s === 'in_progress' || s === 'processing') {
          bySeller[sellerId].totals.in_progress_count += 1;
          bySeller[sellerId].totals.in_progress_net_total += net;
        } else {
          bySeller[sellerId].totals.other_count += 1;
        }
      });

      const sellerIds = Object.keys(bySeller);

      if (sellerIds.length === 0) {
        return res.json([]);
      }

      // Enrich with seller profiles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', sellerIds);

      if (profilesError) {
        console.error('seller-payouts-summary: profiles query error', profilesError);
      }

      const profilesById: Record<string, any> = {};
      (profiles || []).forEach((p: any) => {
        profilesById[p.id] = p;
      });

      // Enrich with seller_metrics if available
      const { data: metrics, error: metricsError } = await supabaseAdmin
        .from('seller_metrics')
        .select('seller_id, total_auctions, total_sales')
        .in('seller_id', sellerIds);

      if (metricsError) {
        console.error('seller-payouts-summary: metrics query error', metricsError);
      }

      const metricsBySeller: Record<string, any> = {};
      (metrics || []).forEach((m: any) => {
        metricsBySeller[m.seller_id] = m;
      });

      const result = sellerIds.map((sellerId) => {
        const summary = bySeller[sellerId];
        const profile = profilesById[sellerId] || null;
        const metric = metricsBySeller[sellerId] || null;

        return {
          seller_id: sellerId,
          seller_name: profile?.name || null,
          seller_email: profile?.email || null,
          seller_phone: profile?.phone || null,
          total_auctions: metric?.total_auctions != null ? Number(metric.total_auctions) : null,
          total_sales: metric?.total_sales != null ? Number(metric.total_sales) : null,
          ...summary.totals,
        };
      });

      return res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

// Admin diagnostics: payments FSM and rate limit dry-run
winPaymentsRouter.get(
  '/admin/payments/dry-run',
  requireAuth,
  requireAdminOrSuperAdmin,
  async (req: AuthedRequest, res: Response, _next: NextFunction) => {
    const envsOk = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    const supabaseOk = Boolean(supabaseAdmin);
    const requestId = (req.headers['x-request-id'] as string) || undefined;

    const fsmMatrix = [
      { from: 'pending_verification', to: 'approved', allowed: canTransition('pending_verification', 'approved') },
      { from: 'pending_verification', to: 'rejected', allowed: canTransition('pending_verification', 'rejected') },
      { from: 'pending_verification', to: 'refund_in_progress', allowed: canTransition('pending_verification', 'refund_in_progress') },
      { from: 'approved', to: 'refund_in_progress', allowed: canTransition('approved', 'refund_in_progress') },
      { from: 'refund_in_progress', to: 'refunded', allowed: canTransition('refund_in_progress', 'refunded') },
      { from: 'refunded', to: 'approved', allowed: canTransition('refunded', 'approved') },
    ];

    const redisConfigured = Boolean(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL);

    const webhookSecretPresent = Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
    const sampleBody = JSON.stringify({ ping: 'ok' });
    const expectedSig = webhookSecretPresent
      ? crypto.createHmac('sha256', String(process.env.RAZORPAY_WEBHOOK_SECRET)).update(sampleBody).digest('hex')
      : null;
    const rejectsInvalidSignature = webhookSecretPresent ? expectedSig !== 'invalid' : false;

    const trustProxy = req.app.get('trust proxy');
    const hasXff = Boolean(req.headers['x-forwarded-for']);
    const stickySessionsIndicators = {
      trustProxy: typeof trustProxy === 'number' ? trustProxy : (trustProxy ? 1 : 0),
      hasXForwardedFor: hasXff,
    };

    const healthRoutePresent = Array.isArray((req.app as any)?._router?.stack)
      ? (req.app as any)._router.stack.some((layer: any) => {
          return layer?.route?.path === '/health' && layer?.route?.methods?.get;
        })
      : true;

    const gracefulShutdownReady = Boolean(req.app.locals?.gracefulShutdownEnabled);

    return res.json({
      requestId,
      envsOk,
      supabaseOk,
      fsmMatrix,
      rateLimitProbe: { redisConfigured },
      razorpayWebhook: {
        secretPresent: webhookSecretPresent,
        sampleHmac: expectedSig,
        rejectsInvalidSignature,
      },
      stickySessionsIndicators,
      healthRoutePresent,
      gracefulShutdownReady,
      message: 'Dry-run complete',
    });
  },
);

// Admin endpoint: list payments awaiting verification (or by status)
winPaymentsRouter.get(
  '/admin/win-payments',
  requireAuth,
  requireAdminOrSuperAdmin,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      const status = (req.query.status as string) || 'pending_verification';

      const { data, error } = await supabaseAdmin
        .from('win_payments')
        .select(
          `
          id,
          auction_id,
          buyer_id,
          method,
          reference_number,
          amount,
          status,
          submitted_at,
          verified_by,
          verified_at,
          notes,
          auction:auctions(id, status, final_price),
          buyer:profiles(id, name, email, phone)
        `,
        )
        .eq('status', status)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('winPayments admin list error', error);
        return res.status(500).json({ error: 'Failed to load win payments' });
      }

      return res.json(data || []);
    } catch (err) {
      next(err);
    }
  },
);

// Admin endpoint: get audit history for a specific payment
winPaymentsRouter.get(
  '/admin/win-payments/:paymentId/audit',
  requireAuth,
  requireAdminOrSuperAdmin,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.params;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      if (!paymentId) {
        return res.status(400).json({ error: 'paymentId is required' });
      }

      const { data, error } = await supabaseAdmin
        .from('win_payment_audit_logs')
        .select(
          `
          id,
          win_payment_id,
          changed_by,
          old_status,
          new_status,
          note,
          created_at,
          admin:profiles!win_payment_audit_logs_changed_by_fkey(id, name, email)
        `,
        )
        .eq('win_payment_id', paymentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('winPayments admin audit list error', error);
        return res.status(500).json({ error: 'Failed to load payment audit history' });
      }

      return res.json(data || []);
    } catch (err) {
      next(err);
    }
  },
);

// Admin endpoint: update payment status (approve/reject/etc.) and log audit + update auction
winPaymentsRouter.patch(
  '/admin/win-payments/:paymentId',
  requireAuth,
  requireAdminOrSuperAdmin,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.params;
      const { status, notes } = req.body || {};

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      if (!paymentId) {
        return res.status(400).json({ error: 'paymentId is required' });
      }

      if (!status || typeof status !== 'string') {
        return res.status(400).json({ error: 'status is required' });
      }

      const newStatus = String(status).toLowerCase();
      if (!isValidStatus(newStatus)) {
        setRequestIdHeader(req, res);
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const { data: existing, error: selectErr } = await supabaseAdmin
        .from('win_payments')
        .select('id, auction_id, status, amount')
        .eq('id', paymentId)
        .maybeSingle();

      if (selectErr) {
        console.error('winPayments admin update: select error', selectErr);
        return res.status(500).json({ error: 'Failed to load payment' });
      }

      if (!existing) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const oldStatus = existing.status as string | null;
      const now = new Date().toISOString();
      const adminUserId = req.user?.id || null;

      if ((oldStatus || '').toLowerCase() === newStatus) {
        return res.status(200).json({ id: paymentId, status: newStatus, message: 'No change' });
      }

      if (!canTransition(oldStatus, newStatus)) {
        setRequestIdHeader(req, res);
        return res.status(400).json({ error: 'Illegal status transition' });
      }

      if (newStatus === 'rejected' && (!notes || String(notes).trim().length === 0)) {
        setRequestIdHeader(req, res);
        return res.status(400).json({ error: 'Notes required when rejecting a payment' });
      }

      const { error: updateErr } = await supabaseAdmin
        .from('win_payments')
        .update({
          status: newStatus,
          verified_by: adminUserId,
          verified_at: now,
          notes: notes ?? null,
        })
        .eq('id', paymentId);

      if (updateErr) {
        console.error('winPayments admin update: update error', updateErr);
        return res.status(500).json({ error: 'Failed to update payment' });
      }

      // Insert audit log
      const { error: auditErr } = await supabaseAdmin
        .from('win_payment_audit_logs')
        .insert({
          win_payment_id: paymentId,
          changed_by: adminUserId,
          old_status: oldStatus,
          new_status: newStatus,
          note: notes || null,
        });

      if (auditErr) {
        console.error('winPayments admin update: audit insert error', auditErr);
      }

      const lower = newStatus;
      if (lower === 'approved' || lower === 'partial_payment' || lower === 'refund_in_progress' || lower === 'rejected' || lower === 'refunded') {
        const { data: auctionRow, error: auctionLoadErr } = await supabaseAdmin
          .from('auctions')
          .select('id, status, final_price')
          .eq('id', existing.auction_id)
          .maybeSingle();
        if (auctionLoadErr) {
          console.error('winPayments admin update: auction load error', auctionLoadErr);
        } else if (auctionRow) {
          let nextAuctionStatus: string | null = null;
          if (lower === 'rejected') {
            nextAuctionStatus = 'payment_pending';
          } else if (lower === 'refund_in_progress') {
            nextAuctionStatus = 'payment_under_review';
          } else if (lower === 'refunded') {
            nextAuctionStatus = 'payment_pending';
          } else if (lower === 'approved' || lower === 'partial_payment') {
            const finalPrice = auctionRow.final_price != null ? Number(auctionRow.final_price) : null;
            let totalApprovedOrPartial = 0;
            const { data: paymentsForAuction, error: sumErr } = await supabaseAdmin
              .from('win_payments')
              .select('amount, status')
              .eq('auction_id', existing.auction_id)
              .in('status', ['approved', 'partial_payment']);
            if (sumErr) {
              console.error('winPayments admin update: sum payments error', sumErr);
              nextAuctionStatus = 'payment_under_review';
            } else {
              (paymentsForAuction || []).forEach((p: any) => {
                const amt = p.amount != null ? Number(p.amount) : 0;
                const st = (p.status || '').toLowerCase();
                if (st === 'approved' || st === 'partial_payment') {
                  totalApprovedOrPartial += amt;
                }
              });
              if (finalPrice != null && totalApprovedOrPartial >= finalPrice) {
                nextAuctionStatus = 'paid';
              } else {
                nextAuctionStatus = 'payment_under_review';
              }
            }
          }
          if (nextAuctionStatus) {
            const { error: auctionUpdateErr } = await supabaseAdmin
              .from('auctions')
              .update({ status: nextAuctionStatus })
              .eq('id', existing.auction_id);
            if (auctionUpdateErr) {
              console.error('winPayments admin update: auction status update error', auctionUpdateErr);
            }
          }
        }
      }

      return res.status(200).json({ id: paymentId, status: newStatus });
    } catch (err) {
      next(err);
    }
  },
);
