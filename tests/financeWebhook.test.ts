import { computeHmacSha256, verifyHmacSignature } from '../backend/services/hmacService';

describe('HMAC service', () => {
  const secret = 'test-secret';
  const body = JSON.stringify({ hello: 'world' });

  it('computes deterministic HMAC', () => {
    const h1 = computeHmacSha256(secret, body);
    const h2 = computeHmacSha256(secret, body);
    expect(h1).toBe(h2);
    expect(typeof h1).toBe('string');
    expect(h1.length).toBe(64);
  });

  it('verifies valid signatures', () => {
    const hex = computeHmacSha256(secret, body);
    const header = `sha256=${hex}`;
    const ok = verifyHmacSignature({ secret, payload: body, headerValue: header });
    expect(ok).toBe(true);
  });

  it('rejects invalid signatures', () => {
    const header = 'sha256=deadbeef';
    const ok = verifyHmacSignature({ secret, payload: body, headerValue: header });
    expect(ok).toBe(false);
  });
});
