/**
 * Dependency-free ZIP writer.
 *
 * Uses the browser `CompressionStream('deflate-raw')` when available and falls
 * back to STORE (no compression) elsewhere — Node test runs, old browsers.
 * Both produce archives that Windows Explorer, macOS Finder, `unzip` and
 * GitHub's web uploader accept.
 */

import { crc32 } from './hash';

export interface ZipEntry {
  path: string;
  content: string | Uint8Array;
}

export interface ZipOptions {
  /** Try DEFLATE (falls back to STORE per entry when unsupported). */
  compress?: boolean;
  /** Fixed timestamp for reproducible archives. Defaults to "now". */
  date?: Date;
}

const SIG_LOCAL = 0x04034b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_EOCD = 0x06054b50;
const FLAG_UTF8 = 0x0800;

interface PreparedEntry {
  nameBytes: Uint8Array;
  data: Uint8Array;
  rawLength: number;
  crc: number;
  method: number;
  offset: number;
}

function dosDateTime(date: Date): { time: number; date: number } {
  const time =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time: time & 0xffff, date: dosDate & 0xffff };
}

async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array | null> {
  const Ctor = (globalThis as { CompressionStream?: typeof CompressionStream }).CompressionStream;
  if (typeof Ctor !== 'function') return null;
  try {
    const stream = new Ctor('deflate-raw');
    const writer = stream.writable.getWriter();
    void writer.write(bytes as unknown as BufferSource);
    void writer.close();
    const buffer = await new Response(stream.readable).arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value >>> 0, true);
}

function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value & 0xffff, true);
}

function concatSize(chunks: Uint8Array[]): number {
  return chunks.reduce((total, chunk) => total + chunk.length, 0);
}

export async function createZip(entries: ZipEntry[], options: ZipOptions = {}): Promise<Uint8Array> {
  const compress = options.compress ?? true;
  const stamp = dosDateTime(options.date ?? new Date());
  const encoder = new TextEncoder();

  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  const prepared: PreparedEntry[] = [];
  let offset = 0;

  for (const entry of entries) {
    const raw = typeof entry.content === 'string' ? encoder.encode(entry.content) : entry.content;
    const nameBytes = encoder.encode(entry.path.replace(/\\/g, '/'));

    let method = 0;
    let stored = raw;
    if (compress && raw.length > 64) {
      const deflated = await deflateRaw(raw);
      if (deflated && deflated.length < raw.length) {
        method = 8;
        stored = deflated;
      }
    }

    const crc = crc32(raw);

    const header = new Uint8Array(30 + nameBytes.length);
    const headerView = new DataView(header.buffer);
    writeUint32(headerView, 0, SIG_LOCAL);
    writeUint16(headerView, 4, 20);
    writeUint16(headerView, 6, FLAG_UTF8);
    writeUint16(headerView, 8, method);
    writeUint16(headerView, 10, stamp.time);
    writeUint16(headerView, 12, stamp.date);
    writeUint32(headerView, 14, crc);
    writeUint32(headerView, 18, stored.length);
    writeUint32(headerView, 22, raw.length);
    writeUint16(headerView, 26, nameBytes.length);
    writeUint16(headerView, 28, 0);
    header.set(nameBytes, 30);

    localChunks.push(header, stored);

    prepared.push({
      nameBytes,
      data: stored,
      rawLength: raw.length,
      crc,
      method,
      offset,
    });

    offset += header.length + stored.length;
  }

  let centralSize = 0;
  for (const item of prepared) {
    const record = new Uint8Array(46 + item.nameBytes.length);
    const view = new DataView(record.buffer);
    writeUint32(view, 0, SIG_CENTRAL);
    writeUint16(view, 4, 20);
    writeUint16(view, 6, 20);
    writeUint16(view, 8, FLAG_UTF8);
    writeUint16(view, 10, item.method);
    writeUint16(view, 12, stamp.time);
    writeUint16(view, 14, stamp.date);
    writeUint32(view, 16, item.crc);
    writeUint32(view, 20, item.data.length);
    writeUint32(view, 24, item.rawLength);
    writeUint16(view, 28, item.nameBytes.length);
    writeUint16(view, 30, 0);
    writeUint16(view, 32, 0);
    writeUint16(view, 34, 0);
    writeUint16(view, 36, 0);
    writeUint32(view, 38, 0o100644 << 16);
    writeUint32(view, 42, item.offset);
    record.set(item.nameBytes, 46);
    centralChunks.push(record);
    centralSize += record.length;
  }

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  writeUint32(endView, 0, SIG_EOCD);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, prepared.length);
  writeUint16(endView, 10, prepared.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);

  const total = concatSize(localChunks) + centralSize + end.length;
  const out = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of localChunks) {
    out.set(chunk, cursor);
    cursor += chunk.length;
  }
  for (const chunk of centralChunks) {
    out.set(chunk, cursor);
    cursor += chunk.length;
  }
  out.set(end, cursor);
  return out;
}

/** Test helper: inspect the central directory of a produced archive. */
export function listZipEntries(
  bytes: Uint8Array,
): { path: string; method: number; size: number; compressedSize: number }[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  const found: { path: string; method: number; size: number; compressedSize: number }[] = [];
  let index = bytes.length - 22;
  while (index >= 0 && view.getUint32(index, true) !== SIG_EOCD) index -= 1;
  if (index < 0) return found;
  const count = view.getUint16(index + 10, true);
  let cursor = view.getUint32(index + 16, true);
  for (let i = 0; i < count; i += 1) {
    if (view.getUint32(cursor, true) !== SIG_CENTRAL) break;
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const size = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
    found.push({ path: name, method, size, compressedSize });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return found;
}
