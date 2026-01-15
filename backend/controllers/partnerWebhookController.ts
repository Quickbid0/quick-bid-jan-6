import type { Request, Response } from 'express';
import type { Pool } from 'pg';
import { computeHmacSha256, verifyHmacSignature } from '../services/hmacService.ts';

export const partnerWebhookHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const { partnerKey } = req.params as { partnerKey: string };

    const providersSql = `
      select
        'loan' as partner_type,
        id as partner_id,
        webhook_secret,
        hmac_header_name,
        adapter_key
      from public.loan_providers
      where adapter_key = $1 and active = true
      union all
      select
        'insurance' as partner_type,
        id as partner_id,
        webhook_secret,
        hmac_header_name,
        adapter_key
      from public.insurance_providers
      where adapter_key = $1 and active = true
      limit 1
    `;

    const { rows } = await pool.query(providersSql, [partnerKey]);
    const provider = rows[0];

    if (!provider) {
      return res.status(404).json({ error: 'PARTNER_NOT_FOUND' });
    }

    const rawBody = (req as any).rawBody || JSON.stringify(req.body || {});
    const headerName: string = provider.hmac_header_name || 'X-Partner-Signature';
    const signatureHeader = req.header(headerName) || req.header(headerName.toLowerCase());

    let verified = false;

    if (provider.webhook_secret) {
      verified = verifyHmacSignature({
        secret: provider.webhook_secret,
        payload: rawBody,
        headerValue: signatureHeader,
        prefix: 'sha256=',
      });
    }

    try {
      const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : req.body || {};

      const eventType = payload.event_type || payload.event || null;
      const partnerRefId: string | undefined =
        payload.partner_ref_id || payload.reference_id || payload.ref_id || payload.application_id;
      const newStatus: string | undefined =
        payload.status || payload.new_status || payload.decision_status;

      await pool.query(
        `insert into public.partner_webhook_logs (
           partner_type,
           partner_id,
           event_type,
           payload,
           headers,
           verified
         ) values ($1, $2, $3, $4, $5, $6)`,
        [
          provider.partner_type,
          provider.partner_id,
          eventType,
          payload,
          req.headers,
          verified,
        ],
      );

      if (!verified) {
        return res.status(400).json({ error: 'INVALID_SIGNATURE' });
      }

      if (!partnerRefId || !newStatus) {
        return res.status(202).json({ status: 'logged' });
      }

      if (provider.partner_type === 'loan') {
        const { rows: appRows } = await pool.query(
          `update public.loan_applications
              set status = $1,
                  partner_response = coalesce(partner_response, '{}'::jsonb) || $2::jsonb,
                  updated_at = now()
            where partner_ref_id = $3
          returning id, user_id, requested_amount, commission_amount, provider_id`,
          [newStatus, payload, partnerRefId],
        );

        const app = appRows[0];
        if (app && (newStatus === 'approved' || newStatus === 'disbursed')) {
          const { rows: provRows } = await pool.query(
            `select commission_percent from public.loan_providers where id = $1`,
            [provider.partner_id],
          );
          const commissionPercent = provRows[0]?.commission_percent as number | undefined;
          if (commissionPercent && app.requested_amount) {
            const commissionAmount = (Number(app.requested_amount) * commissionPercent) / 100;
            await pool.query(
              `insert into public.partner_commissions (
                 partner_type,
                 partner_id,
                 application_type,
                 application_id,
                 commission_amount,
                 status
               ) values ('loan', $1, 'loan', $2, $3, 'pending')
               on conflict do nothing`,
              [provider.partner_id, app.id, commissionAmount],
            );
          }
        }
      } else {
        const { rows: appRows } = await pool.query(
          `update public.insurance_applications
              set status = $1,
                  partner_response = coalesce(partner_response, '{}'::jsonb) || $2::jsonb,
                  updated_at = now()
            where partner_ref_id = $3
          returning id, user_id, premium_amount, provider_id`,
          [newStatus, payload, partnerRefId],
        );

        const app = appRows[0];
        if (app && (newStatus === 'purchased' || newStatus === 'active')) {
          const { rows: provRows } = await pool.query(
            `select commission_percent from public.insurance_providers where id = $1`,
            [provider.partner_id],
          );
          const commissionPercent = provRows[0]?.commission_percent as number | undefined;
          if (commissionPercent && app.premium_amount) {
            const commissionAmount = (Number(app.premium_amount) * commissionPercent) / 100;
            await pool.query(
              `insert into public.partner_commissions (
                 partner_type,
                 partner_id,
                 application_type,
                 application_id,
                 commission_amount,
                 status
               ) values ('insurance', $1, 'insurance', $2, $3, 'pending')
               on conflict do nothing`,
              [provider.partner_id, app.id, commissionAmount],
            );
          }
        }
      }

      return res.json({ status: 'ok' });
    } catch (err) {
      console.error('[partner-webhook] handler error', err);
      return res.status(500).json({ error: 'WEBHOOK_HANDLING_FAILED' });
    }
  };
