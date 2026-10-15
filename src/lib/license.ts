import { deobfuscate, fnv1a } from './hash';
import type { Tier } from '../core/types';

/**
 * Premium licence keys.
 *
 * Format: `NXS-XXXX-XXXX-YYYY`
 *   chars 1-2 : payload. First character encodes the tier (`P` = Pro, `S` = Studio).
 *   chars 3-8 : random payload characters.
 *   chars 9-12: signature derived from `secret + payload`.
 *
 * The alphabet omits I, O, 0 and 1 so keys survive being retyped from a chat.
 *
 * Security note (documented openly in the README and on the premium page):
 * validation runs in the browser, so this is a soft gate. Anyone who extracts
 * the bundle can recover the secret and mint keys. Deploy with
 * `VITE_LICENSE_SECRET` set to make the shipped secret private, and use the
 * `/owner` page (which never ships the secret) to mint keys for supporters.
 */

export const LICENSE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ALPHABET_SIZE = LICENSE_ALPHABET.length;
const KEY_PATTERN = /^NXS-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/;

const DEMO_SECRET = deobfuscate(
  '3103150714eee8e2fee688c8d6d7aee5bcb3be968e86d432373c23',
);

export type LicenseTier = 'pro' | 'studio';

export interface License {
  key: string;
  tier: LicenseTier;
  issuedAt: string;
  /** Always true — the licence is bound to this browser profile. */
  local: true;
}

export const LICENSE_TIER_CODE: Record<LicenseTier, string> = {
  pro: 'P',
  studio: 'S',
};

const TIER_BY_CODE: Record<string, LicenseTier> = {
  P: 'pro',
  S: 'studio',
};

function indexToChar(index: number): string {
  return LICENSE_ALPHABET[(index >>> 0) % ALPHABET_SIZE] as string;
}

/** Deterministic 4-character signature for a payload. */
export function signPayload(secret: string, payload: string): string {
  let out = '';
  for (let i = 0; i < 4; i += 1) {
    const digest = fnv1a(`${secret}:${payload}:${i}`, 0x811c9dc5 ^ (i * 0x9e3779b9));
    out += indexToChar(digest);
  }
  return out;
}

export function activeSecret(): string {
  const fromEnv = (import.meta.env?.VITE_LICENSE_SECRET as string | undefined) ?? '';
  const trimmed = fromEnv.trim();
  return trimmed.length >= 8 ? trimmed : DEMO_SECRET;
}

/** True when the build ships the public demo secret instead of a private one. */
export function usingDemoSecret(): boolean {
  return activeSecret() === DEMO_SECRET;
}

function randomPayload(length: number): string {
  const bytes = new Uint32Array(length);
  const webCrypto = (globalThis as { crypto?: Crypto }).crypto;
  if (webCrypto && typeof webCrypto.getRandomValues === 'function') {
    webCrypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 0xffffffff);
    }
  }
  // 32 divides 2^32 evenly, so the modulo keeps every value uniform.
  return Array.from(bytes, (value) => indexToChar(value)).join('');
}

/** Mint a key. Only the owner needs this — exposed through the /owner page. */
export function mintKey(secret: string, tier: LicenseTier, payload?: string): string {
  const tierCode = LICENSE_TIER_CODE[tier];
  const body = (payload ?? randomPayload(7))
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7);
  const padded = `${tierCode}${body}`
    .padEnd(8, 'X')
    .slice(0, 8)
    .split('')
    .map((char) => (LICENSE_ALPHABET.includes(char) ? char : indexToChar(char.charCodeAt(0))))
    .join('');
  const signature = signPayload(secret, padded);
  return `NXS-${padded.slice(0, 4)}-${padded.slice(4, 8)}-${signature}`;
}

/**
 * Accepts the canonical `NXS-XXXX-XXXX-XXXX` form plus the shapes people
 * actually paste or retype: lowercase, missing dashes, spaces instead of
 * dashes, and stray punctuation from a chat message.
 */
export function normalizeKey(rawKey: string): string {
  const upper = rawKey.trim().toUpperCase();
  if (KEY_PATTERN.test(upper)) return upper;

  // "NXS" + 12 payload characters, with any separator (or none) in between.
  const compact = upper.replace(/[^A-Z0-9]/g, '');
  if (compact.length === 15 && compact.startsWith('NXS')) {
    return `NXS-${compact.slice(3, 7)}-${compact.slice(7, 11)}-${compact.slice(11, 15)}`;
  }
  return upper.replace(/\s+/g, '');
}

export function validateKey(rawKey: string, secret = activeSecret()): License | null {
  const key = normalizeKey(rawKey);
  const match = KEY_PATTERN.exec(key);
  if (!match) return null;
  const payload = `${match[1]}${match[2]}`;
  const signature = match[3] as string;
  if (signPayload(secret, payload) !== signature) return null;
  const tier = TIER_BY_CODE[payload[0] as string];
  if (!tier) return null;
  for (const char of payload) {
    if (!LICENSE_ALPHABET.includes(char)) return null;
  }
  return { key, tier, issuedAt: new Date().toISOString(), local: true };
}

export function tierLabel(tier: Tier | LicenseTier): string {
  if (tier === 'studio') return 'Studio';
  if (tier === 'pro') return 'Pro';
  return 'Free';
}
