import rateLimit from 'express-rate-limit';

export const rateLimitBids = rateLimit({
  windowMs: 10 * 1000,
  max: 10,
  message: { error: 'Too many bid attempts, please slow down' },
  keyGenerator: (req) => {
    const userId = (req as any).user?.id as string | undefined;
    return userId || req.ip || 'unknown';
  },
});
