import express from 'express';
import bodyParser from 'body-parser';
import webPush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// In-memory store; replace with a database in production
const subscriptions: any[] = [];

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:you@example.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

// Public endpoint to expose VAPID public key to the client
app.get('/api/push/public-key', (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Subscribe endpoint
app.post('/api/push/subscribe', (req, res) => {
  const sub = req.body;
  if (!sub || !sub.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  if (!subscriptions.find((s) => s.endpoint === sub.endpoint)) {
    subscriptions.push(sub);
  }

  res.status(201).json({ success: true });
});

// Unsubscribe endpoint
app.post('/api/push/unsubscribe', (req, res) => {
  const sub = req.body;
  if (!sub || !sub.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  const idx = subscriptions.findIndex((s) => s.endpoint === sub.endpoint);
  if (idx !== -1) subscriptions.splice(idx, 1);

  res.json({ success: true });
});

// Simple test broadcast endpoint
app.post('/api/push/test', async (_req, res) => {
  const payload = JSON.stringify({
    title: 'Quickmela Test Notification',
    body: 'This is a test push notification.',
    icon: '/icons/icon-192.png',
    data: { url: '/' },
  });

  const results: any[] = [];
  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification(sub, payload);
      results.push({ endpoint: sub.endpoint, success: true });
    } catch (e) {
      console.error('Push send error', e);
      results.push({ endpoint: sub.endpoint, success: false });
    }
  }

  res.json({ results });
});

const PORT = process.env.PUSH_PORT || 4000;
app.listen(PORT, () => {
  console.log(`Push server listening on port ${PORT}`);
});
