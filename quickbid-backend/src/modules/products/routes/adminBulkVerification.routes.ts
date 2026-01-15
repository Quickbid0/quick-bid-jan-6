import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../../supabaseAdmin';
import { requireAuth, AuthedRequest } from '../../../middleware/authMiddleware';
import { requirePermission } from '../../rbac/middleware/requirePermission';

export const adminBulkVerificationRouter = express.Router();

function mapVerificationStatus(status: string | null | undefined): 'pending_verification' | 'pending_documents' | 'verified' | 'rejected' {
  const s = (status || '').toLowerCase();
  if (s === 'approved' || s === 'verified') return 'verified';
  if (s === 'rejected') return 'rejected';
  if (s === 'pending_documents') return 'pending_documents';
  return 'pending_verification';
}

// GET /api/admin/products/bulk-verification
adminBulkVerificationRouter.get(
  '/bulk-verification',
  requireAuth,
  requirePermission('product.verify'),
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      const {
        status = 'pending_verification',
        source_type,
        source_name,
        upload_job_id,
        category,
        auction_type,
        from,
        to,
        page = '1',
        page_size = '100',
        location_id,
        search,
      } = req.query as Record<string, string>;

      const pageNum = Math.max(parseInt(page || '1', 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(page_size || '100', 10) || 100, 1), 500);
      const offset = (pageNum - 1) * limit;

      let query = supabaseAdmin
        .from('products')
        .select(
          'id,title,category,image_url,verification_status,auction_type,reserve_price,location_id,source_type,source_name,upload_job_id,rc_url,insurance_url,puc_url,service_history_urls',
          { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status && status !== 'all') {
        if (status === 'pending_verification') {
          query = query.in('verification_status', ['pending', 'pending_review', 'pending_verification']);
        } else if (status === 'pending_documents') {
          query = query.eq('verification_status', 'pending_documents');
        } else if (status === 'verified') {
          query = query.in('verification_status', ['approved', 'verified']);
        } else if (status === 'rejected') {
          query = query.eq('verification_status', 'rejected');
        }
      }
      if (category && category !== 'all') query = query.eq('category', category);
      if (auction_type && auction_type !== 'all') query = query.eq('auction_type', auction_type);
      if (upload_job_id) query = query.eq('upload_job_id', upload_job_id);
      if (source_type && source_type !== 'all') query = query.eq('source_type', source_type);
      if (source_name) query = query.eq('source_name', source_name);
      if (location_id) query = query.eq('location_id', location_id);
      if (search) {
        const term = `%${search}%`;
        query = query.or(`title.ilike.${term},category.ilike.${term},source_name.ilike.${term},id.ilike.${term}`);
      }
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);

      const { data, error, count } = await query;
      if (error) {
        console.error('bulk-verification list error', error);
        return res.status(500).json({ error: 'Failed to load products for verification' });
      }

      const items = (data || []).map((p: any) => {
        const requiredDocsPresent = Boolean(p.rc_url) && Boolean(p.insurance_url);
        const optionalDocsMissing = !(Array.isArray(p.service_history_urls) && p.service_history_urls.length > 0);
        return {
          id: p.id,
          asset_id: p.id,
          title: p.title || '',
          source_type: p.source_type || 'user',
          source_name: p.source_name || null,
          reserve_price: p.reserve_price ?? null,
          required_docs_present: requiredDocsPresent,
          optional_docs_missing: optionalDocsMissing,
          auction_type: p.auction_type || null,
          issues: null,
          status: mapVerificationStatus(p.verification_status),
          image_url: p.image_url || null,
          category: p.category || null,
          upload_job_id: p.upload_job_id || null,
          location_id: p.location_id || null,
        };
      });

      return res.json({
        items,
        total: typeof count === 'number' ? count : items.length,
        page: pageNum,
        page_size: limit,
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/admin/products/bulk-action
adminBulkVerificationRouter.post(
  '/bulk-action',
  requireAuth,
  requirePermission('product.verify'),
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase admin not configured' });
      }

      const { action, product_ids, note, required_docs } = req.body || {};
      const actorId = req.user?.id || null;

      if (!Array.isArray(product_ids) || product_ids.length === 0) {
        return res.status(400).json({ error: 'product_ids is required' });
      }
      if (!['approve', 'reject', 'request_docs'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      const results: Array<{ product_id: string; ok: boolean; reason?: string }> = [];
      for (const pid of product_ids) {
        try {
          const { data: existing, error: getErr } = await supabaseAdmin
            .from('products')
            .select('id, verification_status, admin_notes')
            .eq('id', pid)
            .maybeSingle();
          if (getErr) throw getErr;
          if (!existing) {
            results.push({ product_id: pid, ok: false, reason: 'not_found' });
            continue;
          }

          const current = mapVerificationStatus(existing.verification_status);
          let nextStatus: 'verified' | 'rejected' | 'pending_documents';
          if (action === 'approve') {
            if (current === 'verified' || current === 'rejected') {
              results.push({ product_id: pid, ok: false, reason: 'terminal_status' });
              continue;
            }
            nextStatus = 'verified';
          } else if (action === 'reject') {
            if (current === 'verified' || current === 'rejected') {
              results.push({ product_id: pid, ok: false, reason: 'terminal_status' });
              continue;
            }
            nextStatus = 'rejected';
          } else {
            if (current === 'verified' || current === 'rejected') {
              results.push({ product_id: pid, ok: false, reason: 'terminal_status' });
              continue;
            }
            nextStatus = 'pending_documents';
          }

          const { error: updErr } = await supabaseAdmin
            .from('products')
            .update({
              verification_status: nextStatus,
              admin_notes:
                action === 'request_docs'
                  ? `${existing.admin_notes || ''}\nRequired docs: ${(required_docs || []).join(', ')}${note ? `\nNote: ${note}` : ''}`
                  : existing.admin_notes || null,
            })
            .eq('id', pid);
          if (updErr) throw updErr;

          try {
            await supabaseAdmin.from('admin_audit_logs').insert({
              admin_id: actorId,
              action:
                action === 'approve'
                  ? 'PRODUCT_BULK_APPROVE'
                  : action === 'reject'
                  ? 'PRODUCT_BULK_REJECT'
                  : 'PRODUCT_BULK_REQUEST_DOCS',
              target_table: 'products',
              target_id: pid,
              meta: {
                permission: 'product.verify',
                request_id: (req as any).requestId || null,
                before_state: { verification_status: current },
                after_state: { verification_status: nextStatus, note: note ?? null, required_docs: required_docs ?? null },
              },
            });
          } catch (auditErr) {}

          results.push({ product_id: pid, ok: true });
        } catch (e: any) {
          results.push({ product_id: pid, ok: false, reason: e?.message || 'update_failed' });
        }
      }

      const success_count = results.filter((r) => r.ok).length;
      const failed = results.filter((r) => !r.ok);

      return res.json({
        success_count,
        failed_count: failed.length,
        failures: failed,
      });
    } catch (err) {
      next(err);
    }
  },
);
