"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sponsorAuthRouter = void 0;
exports.verifyToken = verifyToken;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const Sponsor_1 = require("../models/Sponsor");
const rateLimit_1 = require("../../../middleware/rateLimit");
const otpStore = new Map();
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function sendEmailStub(to, subject, text) {
    // Stubbed email sender – replace with real provider
    console.log('[SponsorAuth] sendEmail stub', { to, subject, text });
}
const TOKEN_SECRET = process.env.SPONSOR_AUTH_SECRET || 'quickmela-sponsor-secret';
function signToken(payload) {
    const json = JSON.stringify(payload);
    const b64 = Buffer.from(json).toString('base64url');
    const sig = crypto_1.default.createHmac('sha256', TOKEN_SECRET).update(b64).digest('base64url');
    return `${b64}.${sig}`;
}
function verifyToken(token) {
    const parts = token.split('.');
    if (parts.length !== 2)
        return null;
    const [b64, sig] = parts;
    const expectedSig = crypto_1.default.createHmac('sha256', TOKEN_SECRET).update(b64).digest('base64url');
    if (sig !== expectedSig)
        return null;
    try {
        const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
        if (Date.now() > payload.exp)
            return null;
        return { sponsorId: payload.sponsorId };
    }
    catch {
        return null;
    }
}
exports.sponsorAuthRouter = (0, express_1.Router)();
const otpLimiter = (0, rateLimit_1.rateLimit)((req) => {
    const email = (req.body?.email || '').toLowerCase().trim();
    return `sponsor-otp:${req.ip}:${email}`;
}, 5, 15 * 60 * 1000);
exports.sponsorAuthRouter.post('/sponsor-auth/request-otp', otpLimiter, async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        const sponsor = await Sponsor_1.Sponsor.findOne({ authEmail: email }).lean();
        if (!sponsor) {
            res.status(404).json({ message: 'Sponsor not found for this email' });
            return;
        }
        const otp = generateOtp();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        otpStore.set(email, { otp, sponsorId: sponsor.sponsorId, expiresAt });
        sendEmailStub(email, 'Your QuickMela Sponsor Login OTP', `Your OTP is ${otp}. It is valid for 5 minutes.`);
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
exports.sponsorAuthRouter.post('/sponsor-auth/verify-otp', async (req, res, next) => {
    try {
        const { email, otp } = req.body;
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
    }
    catch (err) {
        next(err);
    }
});
