import type { Request, Response } from 'express';
import type { Pool } from 'pg';

// GET /api/support/tickets
export const listSupportTicketsHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const user: any = (req as any).user;
    const userId: string | undefined = user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    const { category, priority, mine } = req.query as {
      category?: string;
      priority?: string;
      mine?: string;
    };

    const values: any[] = [];
    const where: string[] = [];

    if (category) {
      values.push(category);
      where.push(`category = $${values.length}`);
    }
    if (priority) {
      values.push(priority);
      where.push(`priority = $${values.length}`);
    }
    if (mine === 'true') {
      values.push(userId);
      where.push(`assigned_to = $${values.length}`);
    }

    try {
      let sql = `
        select id,
               user_id,
               subject,
               category,
               status,
               priority,
               assigned_to,
               last_update_at,
               created_at
          from public.support_tickets`;

      if (where.length) {
        sql += ` where ${where.join(' and ')}`;
      }

      sql += `
         order by coalesce(last_update_at, created_at) desc
         limit 200`;

      const { rows } = await pool.query(sql, values);
      return res.json(rows);
    } catch (err) {
      console.error('listSupportTickets error', err);
      return res.status(500).json({ error: 'TICKETS_LIST_FAILED' });
    }
  };

// PATCH /api/support/tickets/:id
export const patchSupportTicketHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const user: any = (req as any).user;
    const userId: string | undefined = user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    const { id } = req.params;
    const { status, action } = req.body as {
      status?: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
      action?: 'assign_to_me';
    };

    if (!status && !action) {
      return res.status(400).json({ error: 'NO_UPDATE_SPECIFIED' });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (action === 'assign_to_me') {
      values.push(userId);
      fields.push(`assigned_to = $${values.length}`);
    }

    if (status) {
      const allowed: string[] = ['open', 'in_progress', 'waiting_user', 'resolved', 'closed'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'INVALID_STATUS' });
      }
      values.push(status);
      fields.push(`status = $${values.length}`);
    }

    values.push(new Date().toISOString());
    fields.push(`last_update_at = $${values.length}`);

    values.push(id);
    const idParam = values.length;

    const sql = `
      update public.support_tickets
         set ${fields.join(', ')}
       where id = $${idParam}
       returning id,
                 user_id,
                 subject,
                 category,
                 status,
                 priority,
                 assigned_to,
                 last_update_at,
                 created_at
    `;

    try {
      const { rows } = await pool.query(sql, values);
      if (!rows.length) {
        return res.status(404).json({ error: 'TICKET_NOT_FOUND' });
      }
      return res.json(rows[0]);
    } catch (err) {
      console.error('patchSupportTicket error', err);
      return res.status(500).json({ error: 'TICKET_UPDATE_FAILED' });
    }
  };
