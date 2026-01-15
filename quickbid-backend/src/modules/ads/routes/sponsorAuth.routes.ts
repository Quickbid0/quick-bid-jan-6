import { Router } from 'express';
import crypto from 'crypto';
import { Sponsor } from '../models/Sponsor';
import { rateLimit } from '../../../middleware/rateLimit';

const otpStore = new Map<string, { otp: string; sponsorId: string; expiresAt: number }>();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendEmailStub(to: string, subject: string, text: string) {
  // Stubbed email sender – replace with real provider
  console.log('[SponsorAuth] sendEmail stub', { to, subject, text });
}

const TOKEN_SECRET = process.env.SPONSOR_AUTH_SECRET || 'quickmela-sponsor-secret';

function signToken(payload: { sponsorId: string; exp: number }) {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifyToken(token: string): { sponsorId: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [b64, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(b64).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8')) as {
      sponsorId: string;
      exp: number;
    };
    if (Date.now() > payload.exp) return null;
    return { sponsorId: payload.sponsorId };
  } catch {
    return null;
  }
}

export const sponsorAuthRouter = Router();

const otpLimiter = rateLimit(
  (req) => {
    const email = ((req.body as { email?: string })?.email || '').toLowerCase().trim();
    return `sponsor-otp:${req.ip}:${email}`;
  },
  5,
  15 * 60 * 1000,
);

sponsorAuthRouter.post('/sponsor-auth/request-otp', otpLimiter, async (req, res, next) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const sponsor = await Sponsor.findOne({ authEmail: email }).lean();
    if (!sponsor) {
      res.status(404).json({ message: 'Sponsor not found for this email' });
      return;
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(email, { otp, sponsorId: sponsor.sponsorId, expiresAt });

    sendEmailStub(email, 'Your QuickMela Sponsor Login OTP', `Your OTP is ${otp}. It is valid for 5 minutes.`);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

sponsorAuthRouter.post('/sponsor-auth/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };
    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP are required' });
      return;
    }

    const entry = otpStore.get(email);
    if (!entry || entry.otp !== otp || Date.now() > entry.expiresAt) {
      res.status(401).json({ message: 'Invalid or expired OTP' });
      return;
    }

    otpStore.delete(email);

    const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const token = signToken({ sponsorId: entry.sponsorId, exp });

    res.json({ token, sponsorId: entry.sponsorId });
  } catch (err) {
    next(err);
  }
});
