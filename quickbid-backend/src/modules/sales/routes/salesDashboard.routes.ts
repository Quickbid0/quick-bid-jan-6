import express from 'express';
import type { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../../supabaseAdmin';
import { requireAuth, AuthedRequest } from '../../../middleware/authMiddleware';

export const salesRouter = express.Router();

salesRouter.get(
  '/sales/dashboard',
  requireAuth,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      const now = new Date();
      const month = Number.parseInt(String(req.query.month || ''), 10) || now.getMonth() + 1;
      const year = Number.parseInt(String(req.query.year || ''), 10) || now.getFullYear();

      const periodStart = new Date(year, month - 1, 1).toISOString();
      const periodEnd = new Date(year, month, 1).toISOString();

      // Overall metrics
      const [auctionsRes, payoutsRes, sellersRes, leadsRes] = await Promise.all([
        supabaseAdmin
          .from('auctions')
          .select('id, final_price, created_at')
          .gte('created_at', periodStart)
          .lt('created_at', periodEnd),
        supabaseAdmin
          .from('payouts')
          .select('net_payout, sale_price, status, created_at')
          .gte('created_at', periodStart)
          .lt('created_at', periodEnd),
        supabaseAdmin
          .from('profiles')
          .select('id, created_at')
          .gte('created_at', periodStart)
          .lt('created_at', periodEnd),
        supabaseAdmin
          .from('sales_leads')
          .select('owner_user_id, status, value_gmv, created_at')
          .gte('created_at', periodStart)
          .lt('created_at', periodEnd),
      ]);

      const auctions = auctionsRes.data || [];
      const payouts = payoutsRes.data || [];
      const newSellers = sellersRes.data || [];
      const leads = leadsRes.data || [];

      const totalAuctions = auctions.length;
      const totalGMV = auctions.reduce((sum: number, a: any) => sum + (a.final_price || 0), 0);
      const totalNetPayout = payouts.reduce((sum: number, p: any) => sum + (p.net_payout || 0), 0);
      const newSellersCount = newSellers.length;

      // Geo stats by city (best-effort from products.location)
      const { data: geoRows } = await supabaseAdmin
        .from('products')
        .select('id, location')
        .in('id', auctions.map((a: any) => a.id));

      const geoByCity: Record<string, { auctions: number; gmv: number }> = {};
      const geoMapSource = geoRows || [];

      auctions.forEach((a: any) => {
        const product = geoMapSource.find((p: any) => p.id === a.id);
        if (!product) return;
        const loc: string = product.location || 'Unknown';
        const city = loc.split(',')[0].trim() || 'Unknown';
        if (!geoByCity[city]) {
          geoByCity[city] = { auctions: 0, gmv: 0 };
        }
        geoByCity[city].auctions += 1;
        geoByCity[city].gmv += a.final_price || 0;
      });

      const geoStats = Object.entries(geoByCity)
        .map(([city, stats]) => ({ city, auctions: stats.auctions, gmv: stats.gmv }))
        .sort((a, b) => b.gmv - a.gmv)
        .slice(0, 20);

      // Payout pipeline breakdown
      let completedCount = 0;
      let inProgressCount = 0;
      let pendingCount = 0;
      let completedValue = 0;
      let inProgressValue = 0;
      let pendingValue = 0;

      payouts.forEach((p: any) => {
        const rawStatus = (p.status || 'pending') as string;
        const status = rawStatus.toLowerCase();
        const val = Number(p.sale_price || 0);

        if (status === 'completed') {
          completedCount += 1;
          completedValue += val;
        } else if (status === 'in_progress' || status === 'processing') {
          inProgressCount += 1;
          inProgressValue += val;
        } else {
          pendingCount += 1;
          pendingValue += val;
        }
      });

      const totalPaidSaleValue = payouts.reduce(
        (sum: number, p: any) => sum + (p.sale_price ? Number(p.sale_price) : 0),
        0,
      );
      const unpaidGMV = Math.max(0, totalGMV - totalPaidSaleValue);

      // Per-rep performance (based on sales_leads ownership)
      const perRep: Record<string, {
        owner_user_id: string;
        totalLeads: number;
        activeLeads: number;
        wonLeads: number;
        pipelineGMV: number;
        wonGMV: number;
      }> = {};

      (leads || []).forEach((l: any) => {
        const owner = l.owner_user_id || 'unassigned';
        if (!perRep[owner]) {
          perRep[owner] = {
            owner_user_id: owner,
            totalLeads: 0,
            activeLeads: 0,
            wonLeads: 0,
            pipelineGMV: 0,
            wonGMV: 0,
          };
        }
        const row = perRep[owner];
        row.totalLeads += 1;

        const status = (l.status || 'new') as string;
        const val = Number(l.value_gmv || 0);

        if (status === 'won') {
          row.wonLeads += 1;
          row.wonGMV += val;
        } else if (status !== 'lost') {
          row.activeLeads += 1;
          row.pipelineGMV += val;
        }
      });

      const ownerIds = Object.keys(perRep).filter((id) => id !== 'unassigned');
      let reps: any[] = [];
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email')
          .in('id', ownerIds);
        const profilesById = new Map((profiles || []).map((p: any) => [p.id, p]));

        reps = Object.values(perRep).map((r) => {
          if (r.owner_user_id === 'unassigned') {
            return {
              ...r,
              name: 'Unassigned',
              email: null,
            };
          }
          const profile = profilesById.get(r.owner_user_id);
          return {
            ...r,
            name: profile?.full_name || 'Unknown rep',
            email: profile?.email || null,
          };
        });
      } else if (Object.keys(perRep).includes('unassigned')) {
        reps = [
          {
            ...perRep['unassigned'],
            name: 'Unassigned',
            email: null,
          },
        ];
      }

      return res.json({
        period: { month, year, start: periodStart, end: periodEnd },
        totals: {
          auctions: totalAuctions,
          gmv: totalGMV,
          netPayout: totalNetPayout,
          newSellers: newSellersCount,
        },
        geo: geoStats,
        reps,
        pipeline: {
          completedCount,
          inProgressCount,
          pendingCount,
          completedValue,
          inProgressValue,
          pendingValue,
          unpaidGMV,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// List leads with optional filters
salesRouter.get(
  '/sales/leads',
  requireAuth,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      const { status, owner, search } = req.query as {
        status?: string;
        owner?: string;
        search?: string;
      };
      const limit = Number.parseInt(String(req.query.limit || ''), 10) || 50;
      const offset = Number.parseInt(String(req.query.offset || ''), 10) || 0;

      let query = supabaseAdmin
        .from('sales_leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq('status', status);
      if (owner) query = query.eq('owner_user_id', owner);
      if (search) {
        const term = `%${search}%`;
        query = query.or(
          `name.ilike.${term},company.ilike.${term},city.ilike.${term},state.ilike.${term}`,
        );
      }

      const { data, error, count } = await query;
      if (error) {
        console.error('sales/leads list error', error);
        return res.status(500).json({ error: 'Failed to load leads' });
      }

      return res.json({
        items: data || [],
        total: typeof count === 'number' ? count : (data || []).length,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Create new lead
salesRouter.post(
  '/sales/leads',
  requireAuth,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      const {
        source = 'seller',
        name,
        phone,
        email,
        city,
        state,
        company,
        owner_user_id,
        status = 'new',
        value_gmv,
        notes,
        next_follow_up_at,
      } = req.body || {};

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'name is required' });
      }

      const { data, error } = await supabaseAdmin
        .from('sales_leads')
        .insert({
          source,
          name,
          phone,
          email,
          city,
          state,
          company,
          owner_user_id: owner_user_id || req.user?.id || null,
          status,
          value_gmv,
          notes,
          next_follow_up_at,
        })
        .select('*')
        .single();

      if (error) {
        console.error('sales/leads create error', error);
        return res.status(500).json({ error: 'Failed to create lead' });
      }

      return res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  },
);

// Update existing lead
salesRouter.patch(
  '/sales/leads/:id',
  requireAuth,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      const updatable: Record<string, any> = {};
      const allowedFields = [
        'status',
        'owner_user_id',
        'notes',
        'value_gmv',
        'next_follow_up_at',
        'city',
        'state',
        'phone',
        'email',
        'company',
      ];

      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
          updatable[field] = (req.body as any)[field];
        }
      }

      if (Object.keys(updatable).length === 0) {
        return res.status(400).json({ error: 'No updatable fields provided' });
      }

      updatable.updated_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from('sales_leads')
        .update(updatable)
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('sales/leads update error', error);
        return res.status(500).json({ error: 'Failed to update lead' });
      }

      if (!data) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      return res.json(data);
    } catch (err) {
      next(err);
    }
  },
);
