import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { EVENTS, MISSIONS, OBJECTS, SOURCES, getObject, getSource, searchObjects } from '@nexsolarix/astronomy';
import { objectFilterSchema, paginate } from './lib/query.js';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

export const app = express();
const origin = process.env.WEB_ORIGIN ?? 'http://localhost:5173';

app.disable('x-powered-by');
app.use((request, response, next) => {
  const startedAt = Date.now();
  response.on('finish', () => {
    console.log(JSON.stringify({ level: 'info', message: 'HTTP request', method: request.method, path: request.path, statusCode: response.statusCode, durationMs: Date.now() - startedAt }));
  });
  next();
});
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin, credentials: false, methods: ['GET', 'OPTIONS'] }));
app.use(express.json({ limit: '32kb' }));
app.use('/api', rateLimit({
  windowMs: 60_000,
  limit: 180,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a moment and try again.' } }
}));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'nexsolarix-api', dataMode: 'curated-static-snapshot' });
});

app.get('/api/objects', (request, response) => {
  const parsed = objectFilterSchema.safeParse(request.query);
  if (!parsed.success) {
    response.status(400).json({ error: { code: 'INVALID_QUERY', message: 'The catalog query is invalid.', details: parsed.error.flatten().fieldErrors } });
    return;
  }
  const { page, limit, type, q } = parsed.data;
  let objects = [...OBJECTS];
  if (type) objects = objects.filter((object) => object.kind === type.toLowerCase() || object.family === type.toLowerCase());
  if (q) objects = objects.filter((object) => `${object.name} ${object.designation ?? ''} ${object.tags.join(' ')}`.toLocaleLowerCase().includes(q.toLocaleLowerCase()));
  response.json({ ...paginate(objects, page, limit), sourceMode: 'curated-static-snapshot' });
});

app.get('/api/objects/:id', (request, response) => {
  const object = getObject(request.params.id ?? '');
  if (!object) {
    response.status(404).json({ error: { code: 'OBJECT_NOT_FOUND', message: 'No catalog object matches that identifier.' } });
    return;
  }
  response.json({ data: object, sourceMode: 'curated-static-snapshot' });
});

app.get('/api/planets', (_request, response) => {
  response.json({ data: OBJECTS.filter((object) => object.kind === 'planet'), sourceMode: 'curated-static-snapshot' });
});

app.get('/api/planets/:id', (request, response) => {
  const object = getObject(request.params.id ?? '');
  if (!object || object.kind !== 'planet') {
    response.status(404).json({ error: { code: 'PLANET_NOT_FOUND', message: 'No planet matches that identifier.' } });
    return;
  }
  response.json({ data: object, sourceMode: 'curated-static-snapshot' });
});

app.get('/api/search', (request, response) => {
  const query = typeof request.query.q === 'string' ? request.query.q.trim().slice(0, 120) : '';
  if (!query) {
    response.status(400).json({ error: { code: 'QUERY_REQUIRED', message: 'Enter a name, designation, or object type to search.' } });
    return;
  }
  response.json({ data: searchObjects(query).slice(0, 20), query, sourceMode: 'curated-static-snapshot' });
});

app.get('/api/sources', (_request, response) => response.json({ data: SOURCES }));
app.get('/api/sources/:id', (request, response) => {
  const source = getSource(request.params.id ?? '');
  if (!source) {
    response.status(404).json({ error: { code: 'SOURCE_NOT_FOUND', message: 'No source matches that identifier.' } });
    return;
  }
  response.json({ data: source });
});
app.get('/api/missions', (_request, response) => response.json({ data: MISSIONS }));
app.get('/api/missions/:id', (request, response) => {
  const mission = MISSIONS.find((item) => item.id === request.params.id);
  if (!mission) {
    response.status(404).json({ error: { code: 'MISSION_NOT_FOUND', message: 'No mission matches that identifier.' } });
    return;
  }
  response.json({ data: mission });
});
app.get('/api/events', (_request, response) => response.json({ data: EVENTS, status: 'no-local-events', message: 'A verified event feed is not configured. No event data is being substituted.' }));

app.get('/api/compare', (request, response) => {
  const firstId = typeof request.query.a === 'string' ? request.query.a.toLowerCase() : '';
  const secondId = typeof request.query.b === 'string' ? request.query.b.toLowerCase() : '';
  const first = getObject(firstId);
  const second = getObject(secondId);
  if (!first || !second) {
    response.status(400).json({ error: { code: 'INVALID_COMPARISON', message: 'Provide two valid catalog object identifiers.' } });
    return;
  }
  response.json({ data: [first, second] });
});

app.use((_request, response) => {
  response.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', message: 'This API route does not exist.' } });
});

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  console.error(JSON.stringify({ level: 'error', message: 'Unhandled API error', error: error instanceof Error ? error.message : 'unknown' }));
  if (response.headersSent) return;
  response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed. Please try again.' } });
};
app.use(errorHandler);
