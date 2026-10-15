import { describe, expect, it } from 'vitest';
import { LICENSE_ALPHABET, mintKey, signPayload, validateKey, usingDemoSecret } from './license';

const SECRET = 'unit-test-secret-value';

describe('licence keys', () => {
  it('mints keys in the documented NXS-XXXX-XXXX-YYYY format', () => {
    const key = mintKey(SECRET, 'pro');
    expect(key).toMatch(/^NXS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(key.split('-')).toHaveLength(4);
  });

  it('accepts a minted pro key and reports its tier', () => {
    const key = mintKey(SECRET, 'pro');
    const license = validateKey(key, SECRET);
    expect(license).not.toBeNull();
    expect(license?.tier).toBe('pro');
    expect(license?.key).toBe(key);
  });

  it('accepts a minted studio key and reports its tier', () => {
    const key = mintKey(SECRET, 'studio');
    expect(validateKey(key, SECRET)?.tier).toBe('studio');
  });

  it('normalises lower case and stray spaces', () => {
    const key = mintKey(SECRET, 'pro');
    const messy = `  ${key.toLowerCase()}  `;
    expect(validateKey(messy, SECRET)?.tier).toBe('pro');
  });

  it('rejects tampered payloads, wrong secrets and malformed keys', () => {
    const key = mintKey(SECRET, 'pro');
    const [prefix, block1, block2, signature] = key.split('-') as [string, string, string, string];
    const flipped = block2.startsWith('A') ? `B${block2.slice(1)}` : `A${block2.slice(1)}`;

    expect(validateKey(`${prefix}-${block1}-${flipped}-${signature}`, SECRET)).toBeNull();
    expect(validateKey(key, 'a-different-secret')).toBeNull();
    expect(validateKey('NXS-1111-1111-1111', SECRET)).toBeNull();
    expect(validateKey('NXS-ABCD-ABCD-ABCD-EXTRA', SECRET)).toBeNull();
    expect(validateKey('', SECRET)).toBeNull();
    expect(validateKey('not-a-key', SECRET)).toBeNull();
  });

  it('rejects payloads containing characters outside the alphabet', () => {
    const payload = 'P0000000';
    const signature = signPayload(SECRET, payload);
    expect(validateKey(`NXS-${payload.slice(0, 4)}-${payload.slice(4)}-${signature}`, SECRET)).toBeNull();
  });

  it('signs deterministically', () => {
    expect(signPayload(SECRET, 'PABCDEFG')).toBe(signPayload(SECRET, 'PABCDEFG'));
    expect(signPayload(SECRET, 'PABCDEFG')).not.toBe(signPayload(SECRET, 'PABCDEFH'));
    expect(signPayload(SECRET, 'PABCDEFG')).toHaveLength(4);
    for (const char of signPayload(SECRET, 'PABCDEFG')) {
      expect(LICENSE_ALPHABET).toContain(char);
    }
  });

  it('produces unique keys across many generations', () => {
    const keys = new Set(Array.from({ length: 500 }, () => mintKey(SECRET, 'pro')));
    expect(keys.size).toBeGreaterThan(490);
  });

  it('documents the demo secret fallback', () => {
    expect(usingDemoSecret()).toBe(true);
  });
});
