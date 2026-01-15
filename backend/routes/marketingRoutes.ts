import express from 'express';
import { Pool } from 'pg';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const EVENTS_RAW_QUEUE = 'events-raw';

export function createMarketingRouter(pool: Pool) {
  const router = express.Router();

  const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });
  const eventsRawQueue = new Queue(EVENTS_RAW_QUEUE, { connection });

  // Pixel / client-side events
  router.post('/pixel', async (req, res) => {
    try {
      const { pixel_id = 'web', event, event_id, user_id, metadata = {}, utm = {}, ts } = req.body || {};
      if (!event) {
        return res.status(400).json({ message: 'event is required' });
      }

      const finalEventId = event_id || `${pixel_id}:${event}:${Date.now()}`;

      const insertSql = `
        insert into pixel_events (pixel_id, event, event_id, user_id, metadata, utm, ts, enriched)
        values ($1,$2,$3,$4,$5,$6,$7,false)
        on conflict (event_id) do nothing
        returning id
      `;

      const { rows } = await pool.query(insertSql, [
        pixel_id,
        event,
        finalEventId,
        user_id || null,
        metadata,
        utm,
        ts ? new Date(ts) : new Date(),
      ]);

      const row = rows[0];
      if (row) {
        await eventsRawQueue.add(
          'pixel_event',
          { pixelEventId: row.id },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
          },
        );
      }

      return res.json({ status: 'ok', event_id: finalEventId });
    } catch (err) {
      console.error('[marketingRoutes] /pixel error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Server-side events
  router.post('/events', async (req, res) => {
    try {
      const { event, event_id, user_id, metadata = {}, utm = {}, ts } = req.body || {};
      if (!event) {
        return res.status(400).json({ message: 'event is required' });
      }

      const pixel_id = 'server';
      const finalEventId = event_id || `${pixel_id}:${event}:${Date.now()}`;

      const insertSql = `
        insert into pixel_events (pixel_id, event, event_id, user_id, metadata, utm, ts, enriched)
        values ($1,$2,$3,$4,$5,$6,$7,false)
        on conflict (event_id) do nothing
        returning id
      `;

      const { rows } = await pool.query(insertSql, [
        pixel_id,
        event,
        finalEventId,
        user_id || null,
        metadata,
        utm,
        ts ? new Date(ts) : new Date(),
      ]);

      const row = rows[0];
      if (row) {
        await eventsRawQueue.add(
          'server_event',
          { pixelEventId: row.id },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
          },
        );
      }

      return res.json({ status: 'ok', event_id: finalEventId });
    } catch (err) {
      console.error('[marketingRoutes] /events error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Basic automations CRUD
  router.post('/automations', async (req, res) => {
    try {
      const { name, trigger, filters = {}, actions = [], active = true } = req.body || {};
      if (!name || !trigger) {
        return res.status(400).json({ message: 'name and trigger are required' });
      }

      const { rows } = await pool.query(
        'insert into automations (name, trigger, filters, actions, active) values ($1,$2,$3,$4,$5) returning *',
        [name, trigger, filters, actions, active],
      );

      return res.status(201).json(rows[0]);
    } catch (err) {
      console.error('[marketingRoutes] create automation error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/automations', async (_req, res) => {
    try {
      const { rows } = await pool.query('select * from automations order by created_at desc');
      return res.json(rows);
    } catch (err) {
      console.error('[marketingRoutes] list automations error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/automations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { rows } = await pool.query('select * from automations where id = $1', [id]);
      if (!rows[0]) return res.status(404).json({ message: 'Not found' });
      return res.json(rows[0]);
    } catch (err) {
      console.error('[marketingRoutes] get automation error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.put('/automations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, trigger, filters, actions, active } = req.body || {};

      const { rows } = await pool.query(
        'update automations set name = $1, trigger = $2, filters = $3, actions = $4, active = $5 where id = $6 returning *',
        [name, trigger, filters, actions, active, id],
      );

      if (!rows[0]) return res.status(404).json({ message: 'Not found' });
      return res.json(rows[0]);
    } catch (err) {
      console.error('[marketingRoutes] update automation error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.delete('/automations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('delete from automations where id = $1', [id]);
      return res.status(204).send();
    } catch (err) {
      console.error('[marketingRoutes] delete automation error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/executions', async (_req, res) => {
    try {
      const sql = `
        select e.id,
               e.automation_id,
               e.event_id,
               e.user_id,
               e.status,
               e.error,
               e.created_at,
               a.name as automation_name
        from automation_executions e
        join automations a on a.id = e.automation_id
        order by e.created_at desc
        limit 100
      `;
      const { rows } = await pool.query(sql);
      return res.json(rows);
    } catch (err) {
      console.error('[marketingRoutes] list executions error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
}
