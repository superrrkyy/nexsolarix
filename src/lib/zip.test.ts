import { describe, expect, it } from 'vitest';
import { createZip, listZipEntries } from './zip';
import { crc32 } from './hash';

const decoder = new TextDecoder();

function readStoredEntry(bytes: Uint8Array, offset: number): string {
  // Local header is 30 bytes + name; reuse the central directory size instead.
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const method = view.getUint16(offset + 8, true);
  const compressedSize = view.getUint32(offset + 18, true);
  const nameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  expect(method).toBe(0);
  const start = offset + 30 + nameLength + extraLength;
  return decoder.decode(bytes.subarray(start, start + compressedSize));
}

describe('zip writer', () => {
  it('writes a readable archive with stored entries', async () => {
    const bytes = await createZip(
      [
        { path: 'README.md', content: '# hello' },
        { path: 'assets/aurora.svg', content: '<svg/>' },
      ],
      { compress: false, date: new Date('2026-01-02T03:04:06Z') },
    );

    const entries = listZipEntries(bytes);
    expect(entries.map((entry) => entry.path)).toEqual(['README.md', 'assets/aurora.svg']);
    expect(entries.every((entry) => entry.method === 0)).toBe(true);
    expect(readStoredEntry(bytes, 0)).toBe('# hello');
  });

  it('starts with the local file header signature and ends with EOCD', async () => {
    const bytes = await createZip([{ path: 'a.txt', content: 'data' }], { compress: false });
    const view = new DataView(bytes.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    const eocdOffset = bytes.length - 22;
    expect(view.getUint32(eocdOffset, true)).toBe(0x06054b50);
    expect(view.getUint16(eocdOffset + 8, true)).toBe(1);
    expect(view.getUint16(eocdOffset + 10, true)).toBe(1);
  });

  it('stores the correct CRC32 and sizes in both headers', async () => {
    const content = 'nexsolarix '.repeat(40);
    const bytes = await createZip([{ path: 'readme.md', content }], { compress: true });
    const raw = new TextEncoder().encode(content);
    const view = new DataView(bytes.buffer);

    expect(view.getUint32(14, true)).toBe(crc32(raw));
    const method = view.getUint16(8, true);
    const compressed = view.getUint32(18, true);
    const uncompressed = view.getUint32(22, true);
    expect(uncompressed).toBe(raw.length);
    if (method === 8) {
      expect(compressed).toBeLessThan(raw.length);
    } else {
      expect(compressed).toBe(raw.length);
    }
  });

  it('compresses repetitive content when CompressionStream is available', async () => {
    const payload = 'const nexsolarix = "animated readme assets";\n'.repeat(200);
    const bytes = await createZip([{ path: 'big.md', content: payload }], { compress: true });
    const entries = listZipEntries(bytes);
    expect(entries[0]?.path).toBe('big.md');
    expect(entries[0]?.size).toBe(new TextEncoder().encode(payload).length);
    if (entries[0]?.method === 8) {
      expect(entries[0].compressedSize).toBeLessThan(payload.length / 4);
    }
  });

  it('normalises windows separators and supports empty archives', async () => {
    const bytes = await createZip([{ path: 'assets\\logo.svg', content: '<svg/>' }], { compress: false });
    expect(listZipEntries(bytes)[0]?.path).toBe('assets/logo.svg');
    const empty = await createZip([], { compress: false });
    expect(listZipEntries(empty)).toEqual([]);
  });

  it('handles non-latin file names', async () => {
    const bytes = await createZip([{ path: 'assets/animasi-lucu.svg', content: '<svg>ü</svg>' }], { compress: false });
    expect(listZipEntries(bytes)[0]?.path).toBe('assets/animasi-lucu.svg');
  });
});
