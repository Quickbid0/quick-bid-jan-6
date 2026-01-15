import Razorpay from 'razorpay';
import type { Handler } from '@netlify/functions';
import { checkRateLimit } from './_utils/rateLimit';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const body = JSON.parse(event.body || '{}');
    const { amount, currency = 'INR', receipt, notes } = body || {};
    const userId = notes?.user_id as string | undefined;
    const deviceHash = notes?.device_hash as string | undefined;
    if (!amount || amount <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid amount' }) };
    }

    const key_id = process.env.RAZORPAY_KEY_ID as string;
    const key_secret = process.env.RAZORPAY_KEY_SECRET as string;
    if (!key_id || !key_secret) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Razorpay keys not configured' }) };
    }

    // Rate limit: max 3 orders per minute per identifier
    const xff = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || '';
    const remoteIp = String(xff).split(',')[0]?.trim() || 'unknown';
    const ident = userId || deviceHash || remoteIp;
    const rl = await checkRateLimit({ bucket: 'order_create', identifier: ident, limit: 3, windowSeconds: 60 });
    if (!rl.allowed) {
      return { statusCode: 429, body: JSON.stringify({ error: 'Too Many Requests' }) };
    }

    const rzp = new Razorpay({ key_id, key_secret });

    const order = await rzp.orders.create({
      amount, // in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ order, key_id }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (e: any) {
    console.error('razorpay-create-order error', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message || 'Internal error' }) };
  }
};
