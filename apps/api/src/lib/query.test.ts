import assert from 'node:assert/strict';
import test from 'node:test';
import { paginate, paginationSchema } from './query.js';

test('pagination normalizes numeric query parameters', () => {
  assert.deepEqual(paginationSchema.parse({ page: '2', limit: '10' }), { page: 2, limit: 10 });
});

test('pagination rejects an excessive page size', () => {
  assert.equal(paginationSchema.safeParse({ limit: '500' }).success, false);
});

test('paginate returns a stable page envelope', () => {
  assert.deepEqual(paginate(['a', 'b', 'c'], 2, 2), {
    data: ['c'],
    pagination: { page: 2, limit: 2, total: 3, totalPages: 2 }
  });
});
