import type { Request, Response, NextFunction } from 'express';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL || '';
let redis: IORedis | null = null;

function getRedis(): IORedis | null {
  if (!redisUrl) return null;
  if (redis) return redis;
  redis = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  return redis;
}

export function rateLimit(keyFn: (req: Request) => string, limit: number, windowMs: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = keyFn(req);
    const r = getRedis();
    if (!r) {
      return next();
    }
    try {
      const redisKey = `rl:${key}`;
      const count = await r.incr(redisKey);
      if (count === 1) {
        await r.pexpire(redisKey, windowMs);
      }
      if (count > limit) {
        const ttl = await r.pttl(redisKey);
        const retryAfter = Math.max(1, Math.ceil(ttl / 1000));
        res.setHeader('Retry-After', retryAfter.toString());
        return res.status(429).json({ error: 'RATE_LIMITED' });
      }
      next();
    } catch {
      next();
    }
  };
}

export async function checkLimit(key: string, limit: number, windowMs: number) {
  const r = getRedis();
  if (!r) {
    return { allowed: true, ttlSeconds: 0 };
  }
  const redisKey = `rl:${key}`;
  const count = await r.incr(redisKey);
  if (count === 1) {
    await r.pexpire(redisKey, windowMs);
  }
  if (count > limit) {
    const ttl = await r.pttl(redisKey);
    const retryAfter = Math.max(1, Math.ceil(ttl / 1000));
    return { allowed: false, ttlSeconds: retryAfter };
  }
  return { allowed: true, ttlSeconds: 0 };
}
