export type RetryOptions = {
  retries?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  onRetry?: (error: any, attempt: number) => void;
};

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const {
    retries = 3,
    minDelayMs = 300,
    maxDelayMs = 3000,
    factor = 2,
    jitter = true,
    onRetry,
  } = opts;

  let attempt = 0;
  const delay = minDelayMs;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (e: any) {
      attempt++;
      if (attempt > retries) throw e;
      onRetry?.(e, attempt);
      const base = Math.min(delay * Math.pow(factor, attempt - 1), maxDelayMs);
      const wait = jitter ? base * (0.5 + Math.random()) : base;
      await sleep(wait);
    }
  }
}
