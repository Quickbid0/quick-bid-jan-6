import { Request, Response, NextFunction } from 'express';

interface Counter {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Counter>();

export function rateLimit(
  keyFn: (req: Request) => string,
  limit: number,
  windowMs: number,
) {
  return (req: Request, res: Response, next: NextFunction) => {
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
