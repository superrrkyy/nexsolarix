/** Tiny deterministic hash + integrity helpers (no crypto dependency). */

const CRC_TABLE: number[] = (() => {
  const table: number[] = new Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = (CRC_TABLE[(crc ^ bytes[i]) & 0xff] as number) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** 32-bit FNV-1a. Stable across runs and platforms. */
export function fnv1a(input: string, seed = 0x811c9dc5): number {
  let hash = seed >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Base-36-ish short digest used for cache keys and file names. */
export function shortHash(input: string): string {
  return fnv1a(input).toString(36).padStart(7, '0').slice(0, 7);
}

export function obfuscate(text: string, key = 0x5f): string {
  const out: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    out.push((text.charCodeAt(i) ^ ((key + i * 7) & 0xff)) & 0xff);
  }
  return out.map((code) => code.toString(16).padStart(2, '0')).join('');
}

export function deobfuscate(encoded: string, key = 0x5f): string {
  let out = '';
  for (let i = 0; i < encoded.length; i += 2) {
    const code = parseInt(encoded.slice(i, i + 2), 16) ^ ((key + (i / 2) * 7) & 0xff);
    out += String.fromCharCode(code & 0xff);
  }
  return out;
}
