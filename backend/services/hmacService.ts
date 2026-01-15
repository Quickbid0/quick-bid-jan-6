import * as crypto from 'crypto';

export function computeHmacSha256(secret: string, payload: Buffer | string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

export function verifyHmacSignature(options: {
  secret: string;
  payload: Buffer | string;
  headerValue: string | undefined;
  prefix?: string;
}): boolean {
  const { secret, payload, headerValue, prefix = 'sha256=' } = options;
  if (!headerValue || !headerValue.startsWith(prefix)) {
    return false;
  }

  const expectedHex = computeHmacSha256(secret, payload);
  const providedHex = headerValue.substring(prefix.length);

  const expected = Buffer.from(expectedHex, 'hex');
  const provided = Buffer.from(providedHex, 'hex');

  if (expected.length !== provided.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, provided);
}
