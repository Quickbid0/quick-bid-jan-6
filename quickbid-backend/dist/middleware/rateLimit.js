"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const buckets = new Map();
function rateLimit(keyFn, limit, windowMs) {
    return (req, res, next) => {
        const key = keyFn(req);
        const now = Date.now();
        const existing = buckets.get(key);
        if (!existing || existing.resetAt <= now) {
            buckets.set(key, { count: 1, resetAt: now + windowMs });
            next();
            return;
        }
        if (existing.count >= limit) {
            const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
            res.setHeader('Retry-After', retryAfter.toString());
            res.status(429).json({ message: 'Too many requests, please try again later.' });
            return;
        }
        existing.count += 1;
        next();
    };
}
