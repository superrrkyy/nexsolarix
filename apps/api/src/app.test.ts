import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import { app } from './app.js';

let baseUrl = '';
let server: ReturnType<typeof app.listen>;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('health endpoint identifies the local data mode', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('x-content-type-options') ?? '', /nosniff/);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'nexsolarix-api', dataMode: 'curated-static-snapshot' });
});

test('object endpoint applies validated pagination and type filters', async () => {
  const response = await fetch(`${baseUrl}/api/objects?page=2&limit=3&type=planet`);
  assert.equal(response.status, 200);
  const payload = await response.json() as { data: Array<{ kind: string }>; pagination: { total: number; page: number } };
  assert.equal(payload.data.length, 3);
  assert.equal(payload.data.every((object) => object.kind === 'planet'), true);
  assert.equal(payload.pagination.total, 8);
  assert.equal(payload.pagination.page, 2);
});

test('search endpoint returns a source-backed catalog match', async () => {
  const response = await fetch(`${baseUrl}/api/search?q=Europa`);
  assert.equal(response.status, 200);
  const payload = await response.json() as { data: Array<{ id: string }> };
  assert.equal(payload.data.some((object) => object.id === 'europa'), true);
});

test('missing object returns a safe 404 response', async () => {
  const response = await fetch(`${baseUrl}/api/objects/not-a-real-object`);
  assert.equal(response.status, 404);
  const payload = await response.json() as { error: { code: string; message: string } };
  assert.equal(payload.error.code, 'OBJECT_NOT_FOUND');
  assert.equal(payload.error.message.includes('not-a-real-object'), false);
});
