import type { Request, Response } from 'express';
import type { Pool } from 'pg';
import {
  getLoanPartnerAdapter,
  getInsurancePartnerAdapter,
  loadLoanProviderConfig,
  loadInsuranceProviderConfig,
} from '../services/partnerAdapters.ts';

export const applyLoanHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const user: any = (req as any).user;
    const userId: string | undefined = user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    const {
      product_id,
      requested_amount,
      tenor_months,
      loan_type,
      prefilled,
      documents,
      provider_id,
      consent_text,
    } = req.body || {};

    if (!product_id || !requested_amount || !tenor_months) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    const docsArray: Array<{ path: string; type?: string }> = Array.isArray(documents)
      ? documents
      : [];

    let selectedProviderId: string | undefined = provider_id;

    if (!selectedProviderId) {
      const { rows } = await pool.query(
        `select id
           from public.loan_providers
          where active = true
          order by priority desc, created_at asc
          limit 1`,
      );
      selectedProviderId = rows[0]?.id;
    }

    if (!selectedProviderId) {
      return res.status(503).json({ error: 'NO_LOAN_PROVIDER_AVAILABLE' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const insertRes = await client.query(
        `insert into public.loan_applications (
           product_id,
           user_id,
           provider_id,
           status,
           requested_amount,
           tenure_months,
           loan_type,
           docs_url,
           meta,
           documents,
           consent_text,
           consent_ip,
           consent_at
         ) values ($1, $2, $3, 'submitted', $4, $5, $6, null, $7, $8, $9, $10, now())
         returning id, provider_id`,
        [
          product_id,
          userId,
          selectedProviderId,
          requested_amount,
          tenor_months,
          loan_type || null,
          prefilled || {},
          docsArray,
          consent_text || null,
          req.ip || null,
        ],
      );

      const application = insertRes.rows[0];
      const applicationId: string = application.id;

      await client.query('COMMIT');

      // Best-effort: create a generic finance_leads row for admin view
      try {
        await pool.query(
          `insert into public.finance_leads (
             user_id,
             product_id,
             product_title,
             lead_type,
             status,
             name,
             phone,
             email,
             notes,
             source
           ) values (
             $1,
             $2,
             (select title from public.products where id = $2),
             'loan',
             'new',
             null,
             null,
             null,
             null,
             'loan_apply_flow'
           )`,
          [userId, product_id],
        );
      } catch (leadErr) {
        console.warn('[finance] failed to insert finance_leads row (ignored)', leadErr);
      }

      try {
        const provider = await loadLoanProviderConfig(pool, application.provider_id);
        if (provider && provider.adapter_key && provider.status === 'active') {
          const adapter = getLoanPartnerAdapter(provider.adapter_key);
          if (adapter) {
            const lead = {
              id: applicationId,
              userId,
              productId: product_id,
              requestedAmount: requested_amount,
              tenorMonths: tenor_months,
              loanType: loan_type || undefined,
              documents: docsArray,
            };
            const result = await adapter.sendLead(lead, provider);
            if (result.partnerRefId) {
              await pool.query(
                `update public.loan_applications
                    set partner_ref_id = $1,
                        partner_response = $2,
                        updated_at = now()
                  where id = $3`,
                [result.partnerRefId, result.rawResponse || {}, applicationId],
              );
            }
          }
        }
      } catch (err) {
        console.error('[finance] sendLead error', err);
      }

      return res.status(201).json({ id: applicationId, status: 'submitted' });
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore
      }
      console.error('[finance] applyLoan error', err);
      return res.status(500).json({ error: 'LOAN_APPLY_FAILED' });
    } finally {
      client.release();
    }
  };

export const getLoanHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const user: any = (req as any).user;
    const userId: string | undefined = user?.id;
    const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];

    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    const { id } = req.params;

    try {
      const isAdmin = roles.includes('admin') || roles.includes('superadmin');

      const sql = `
        select
          id,
          product_id,
          user_id,
          provider_id,
          status,
          requested_amount,
          approved_amount,
          interest_rate_annual,
          tenure_months,
          emi,
          application_ref,
          partner_ref_id,
          documents,
          partner_response,
          created_at,
          updated_at
        from public.loan_applications
        where id = $1
          and ($2::uuid = user_id or $3::boolean = true)
      `;

      const { rows } = await pool.query(sql, [id, userId, isAdmin]);

      if (!rows.length) {
        return res.status(404).json({ error: 'LOAN_NOT_FOUND' });
      }

      const row = rows[0];

      if (!isAdmin) {
        delete row.documents;
        delete row.partner_response;
      }

      return res.json(row);
    } catch (err) {
      console.error('[finance] getLoan error', err);
      return res.status(500).json({ error: 'LOAN_GET_FAILED' });
    }
  };

export const applyInsuranceHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const user: any = (req as any).user;
    const userId: string | undefined = user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    const {
      product_id,
      insured_value,
      coverage_type,
      documents,
      provider_id,
      consent_text,
    } = req.body || {};

    if (!product_id) {
      return res.status(400).json({ error: 'MISSING_PRODUCT_ID' });
    }

    const docsArray: Array<{ path: string; type?: string }> = Array.isArray(documents)
      ? documents
      : [];

    let selectedProviderId: string | undefined = provider_id;

    if (!selectedProviderId) {
      const { rows } = await pool.query(
        `select id
           from public.insurance_providers
          where status = 'active'
          order by created_at asc
          limit 1`,
      );
      selectedProviderId = rows[0]?.id;
    }

    if (!selectedProviderId) {
      return res.status(503).json({ error: 'NO_INSURANCE_PROVIDER_AVAILABLE' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const insertRes = await client.query(
        `insert into public.insurance_applications (
           user_id,
           product_id,
           provider_id,
           status,
           premium_amount,
           documents,
           consent_text,
           consent_ip,
           consent_at
         ) values ($1, $2, $3, 'applied', null, $4, $5, $6, now())
         returning id, provider_id`,
        [
          userId,
          product_id,
          selectedProviderId,
          docsArray,
          consent_text || null,
          req.ip || null,
        ],
      );

      const application = insertRes.rows[0];
      const applicationId: string = application.id;

      await client.query('COMMIT');

      // Best-effort finance_leads row for insurance
      try {
        await pool.query(
          `insert into public.finance_leads (
             user_id,
             product_id,
             product_title,
             lead_type,
             status,
             name,
             phone,
             email,
             notes,
             source
           ) values (
             $1,
             $2,
             (select title from public.products where id = $2),
             'insurance',
             'new',
             null,
             null,
             null,
             null,
             'insurance_apply_flow'
           )`,
          [userId, product_id],
        );
      } catch (leadErr) {
        console.warn('[finance] failed to insert insurance finance_leads row (ignored)', leadErr);
      }

      try {
        const provider = await loadInsuranceProviderConfig(pool, application.provider_id);
        if (provider && provider.adapter_key && provider.status === 'active') {
          const adapter = getInsurancePartnerAdapter(provider.adapter_key);
          if (adapter) {
            const appForAdapter = {
              id: applicationId,
              userId,
              productId: product_id,
              premiumAmount: insured_value ? Number(insured_value) : undefined,
              documents: docsArray,
            };
            const result = await adapter.sendLead(appForAdapter, provider);
            if (result.partnerRefId) {
              await pool.query(
                `update public.insurance_applications
                    set partner_ref_id = $1,
                        partner_response = $2,
                        updated_at = now()
                  where id = $3`,
                [result.partnerRefId, result.rawResponse || {}, applicationId],
              );
            }
          }
        }
      } catch (err) {
        console.error('[finance] insurance sendLead error', err);
      }

      return res.status(201).json({ id: applicationId, status: 'applied' });
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore
      }
      console.error('[finance] applyInsurance error', err);
      return res.status(500).json({ error: 'INSURANCE_APPLY_FAILED' });
    } finally {
      client.release();
    }
  };

export const getInsuranceHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const user: any = (req as any).user;
    const userId: string | undefined = user?.id;
    const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];

    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    const { id } = req.params;

    try {
      const isAdmin = roles.includes('admin') || roles.includes('superadmin');

      const sql = `
        select
          id,
          user_id,
          product_id,
          provider_id,
          status,
          premium_amount,
          policy_number,
          policy_pdf_url,
          documents,
          partner_ref_id,
          partner_response,
          created_at,
          updated_at
        from public.insurance_applications
        where id = $1
          and ($2::uuid = user_id or $3::boolean = true)
      `;

      const { rows } = await pool.query(sql, [id, userId, isAdmin]);

      if (!rows.length) {
        return res.status(404).json({ error: 'INSURANCE_NOT_FOUND' });
      }

      const row = rows[0];

      if (!isAdmin) {
        delete row.documents;
        delete row.partner_response;
      }

      return res.json(row);
    } catch (err) {
      console.error('[finance] getInsurance error', err);
      return res.status(500).json({ error: 'INSURANCE_GET_FAILED' });
    }
  };
