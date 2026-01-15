const express = require('express');
const bodyParser = require('body-parser');
const webPush = require('web-push');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
app.use(bodyParser.json());

// In-memory store; replace with a database for production
const subscriptions = [];

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

  const results = [];
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

// AI endpoint: generate artist bio from short prompt
app.post('/api/ai/artist-bio', async (req, res) => {
  try {
    const { prompt, artistName } = req.body || {};
    if (!prompt && !artistName) {
      return res.status(400).json({ error: 'Missing prompt or artistName' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    const bioPrompt = `You are a copywriter for an art and handmade marketplace.
Write a concise, warm, professional artist bio in 2-3 short paragraphs.
Speak about the artist in third person. Avoid emojis, keep it simple and clear.

Artist name: ${artistName || 'The artist'}
Artist notes: ${prompt || ''}`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You write short, clear bios for artists and makers.' },
          { role: 'user', content: bioPrompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      console.error('OpenAI artist-bio error:', text);
      return res.status(500).json({ error: 'AI service error' });
    }

    const completion = await openaiRes.json();
    const content = completion.choices?.[0]?.message?.content || '';

    return res.json({ bio: content.trim() });
  } catch (e) {
    console.error('artist-bio route error', e);
    return res.status(500).json({ error: 'Failed to generate artist bio' });
  }
});

// AI endpoint: suggest banner ideas for ad slots
app.post('/api/ai/banner-ideas', async (req, res) => {
  try {
    const { slot, context } = req.body || {};
    if (!slot) {
      return res.status(400).json({ error: 'Missing slot' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    const userContext = context ? JSON.stringify(context).slice(0, 1000) : 'No additional context.';

    const prompt = `You are a performance marketer for an online auction marketplace.
Given the slot name and recent context, suggest 3 concise banner concepts tailored to that slot.
For each idea, return a short JSON list with objects like:
[{"title":"...","subtitle":"...","theme":"vehicles|art|crafts|antiques|mixed","mediaType":"image|video"}]

The slot is: ${slot}
Context (JSON): ${userContext}

Respond ONLY with JSON for the "ideas" array, no extra text.`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You write high-converting but concise banner copy for an auction marketplace.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      console.error('OpenAI banner-ideas error:', text);
      return res.status(500).json({ error: 'AI service error' });
    }

    const completion = await openaiRes.json();
    const raw = completion.choices?.[0]?.message?.content || '[]';

    let ideas;
    try {
      // The model may return either the array itself or an object with ideas
      const parsed = JSON.parse(raw.trim());
      if (Array.isArray(parsed)) {
        ideas = parsed;
      } else if (Array.isArray(parsed.ideas)) {
        ideas = parsed.ideas;
      } else {
        ideas = [];
      }
    } catch (e) {
      console.error('Failed to parse banner ideas JSON', e, 'raw:', raw);
      ideas = [];
    }

    return res.json({ ideas });
  } catch (e) {
    console.error('banner-ideas route error', e);
    return res.status(500).json({ error: 'Failed to generate banner ideas' });
  }
});

// AI endpoint: suggest deposit percentage range for policies (advisory only)
app.post('/api/ai/deposit-suggest', async (req, res) => {
  try {
    const { price, category, riskLevel, refundable } = req.body || {};
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Missing or invalid price' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    const cat = category || 'general';
    const risk = riskLevel || 'medium';
    const isRefundable = refundable !== false;

    const prompt = `You are a risk-aware product manager for an online auction marketplace.
We need a recommended security deposit percentage RANGE for bidders.

Input:
- Product category: ${cat}
- Price (local currency): ${price}
- Risk segment: ${risk}
- Refundable deposit: ${isRefundable ? 'yes' : 'no'}

Respond as JSON only, with a single object:
{
  "recommendedPercentMin": number,  // e.g. 5
  "recommendedPercentMax": number,  // e.g. 15
  "recommendedPercentDefault": number, // e.g. 10
  "reason": "Short explanation in 1-2 sentences."
}`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You suggest conservative, risk-aware deposit ranges for auction security deposits.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      console.error('OpenAI deposit-suggest error:', text);
      return res.status(500).json({ error: 'AI service error' });
    }

    const completion = await openaiRes.json();
    const raw = completion.choices?.[0]?.message?.content || '{}';

    let suggestion;
    try {
      suggestion = JSON.parse(raw.trim());
    } catch (e) {
      console.error('Failed to parse deposit suggestion JSON', e, 'raw:', raw);
      suggestion = null;
    }

    if (!suggestion || typeof suggestion !== 'object') {
      return res.json({ suggestion: null });
    }

    return res.json({ suggestion });
  } catch (e) {
    console.error('deposit-suggest route error', e);
    return res.status(500).json({ error: 'Failed to generate deposit suggestion' });
  }
});

// AI endpoint: verify listing media (photos/videos) quality & correctness
app.post('/api/ai/verify-media', async (req, res) => {
  try {
    const { mediaUrl, mediaType, productType, shotType } = req.body || {};
    if (!mediaUrl || !mediaType || !productType || !shotType) {
      return res.status(400).json({ error: 'Missing mediaUrl, mediaType, productType or shotType' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    const prompt = `You review listing photos/videos for an online auction marketplace (similar to insurance photo verification).
Product type: ${productType}
Required shot: ${shotType}
Media type: ${mediaType}
Media URL: ${mediaUrl}

Check:
- Does this media clearly show the correct object and angle for this shot?
- Is it bright enough and not blurry?
- Is the full subject visible (front/side/interior/etc.) when required?
- Does it look like a real capture (not a screenshot or unrelated image)?

Respond ONLY as JSON, no extra text, with this shape:
{
  "ok": true | false,
  "score": number, // 0-1 confidence
  "reasons": string[],
  "suggestion": string
}`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are careful but concise at validating listing photos/videos.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      console.error('OpenAI verify-media error:', text);
      return res.status(500).json({ error: 'AI service error' });
    }

    const completion = await openaiRes.json();
    const raw = completion.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(raw.trim());
    } catch (e) {
      console.error('Failed to parse verify-media JSON', e, 'raw:', raw);
      parsed = {
        ok: false,
        score: 0,
        reasons: ['AI could not parse response'],
        suggestion: 'Please retake a clear, well-lit photo that matches the requested angle.',
      };
    }

    return res.json(parsed);
  } catch (e) {
    console.error('verify-media route error', e);
    return res.status(500).json({ error: 'Failed to verify media' });
  }
});

const PORT = process.env.PUSH_PORT || 4000;
app.listen(PORT, () => {
  console.log(`Push server listening on port ${PORT}`);
});
