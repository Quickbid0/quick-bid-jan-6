type LimitConfig = { bucket: string; identifier: string; limit: number; windowSeconds: number };

const memCounters: Record<string, { count: number; windowStart: number }> = {};

export async function checkRateLimit(cfg: LimitConfig): Promise<{ allowed: boolean; remaining: number }>{
  const key = `${cfg.bucket}:${cfg.identifier}:${cfg.windowSeconds}`;
  const now = Date.now();
  const winStart = Math.floor(now / (cfg.windowSeconds * 1000)) * cfg.windowSeconds * 1000;
  const entry = memCounters[key];
  if (!entry || entry.windowStart !== winStart) {
    memCounters[key] = { count: 0, windowStart: winStart };
  }
  if (memCounters[key].count + 1 > cfg.limit) {
    return { allowed: false, remaining: 0 };
  }
  memCounters[key].count += 1;

  // Best-effort persist to Supabase for global throttling
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL as string;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const window_start = new Date(winStart).toISOString();
      await fetch(`${SUPABASE_URL}/rest/v1/rate_limits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify([{ bucket: cfg.bucket, identifier: cfg.identifier, window_start, count: 1 }])
      });
    }
  } catch {}

  return { allowed: true, remaining: Math.max(0, cfg.limit - memCounters[key].count) };
}
