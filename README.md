# NexSolarix

**Explore the universe, one world at a time.**

NexSolarix is an independent, source-linked astronomical atlas. Its first release focuses on a tactile 3D Solar System, concise world profiles, an accessible catalog mode, and transparent scientific provenance. It is not affiliated with or endorsed by NASA, JPL, ESA, or any other source organization.

## What is included

- Interactive WebGL Solar System with selectable Sun and eight planets, orbital paths, camera orbit/zoom/pan, a reset view, and a time control.
- Planet and major-moon profiles with measured or estimated values, units, confidence labels, related objects, and expandable source links.
- Local search across the curated object and mission set; comparison for records that are present.
- Mission profiles, an explicit no-feed state for astronomical events, and a generated discovery page based on the local catalog.
- Accessible non-3D catalog mode, mobile navigation, reduced-motion styling, local performance preferences, and a small PWA shell cache.
- Express API with validated pagination, search, source and mission routes, rate limiting, secure headers, and friendly errors.
- Shared normalized astronomy package, Prisma/PostgreSQL schema, idempotent seed script, unit tests, E2E coverage, and GitHub Actions CI.

The curated local snapshot contains the Sun, eight planets, ten selected moons, a small set of NASA missions, and public source records. Other catalog routes explain that sourced data is not yet present instead of showing invented entries. The astronomical event catalog intentionally remains empty until a verified event feed is connected.

## Technology

- **Web:** React, TypeScript (strict), Vite, React Router, Tailwind CSS, Three.js, React Three Fiber, Drei, Zustand, Lucide.
- **API:** Node.js, TypeScript, Express 5, Zod, Helmet, CORS, express-rate-limit.
- **Catalog / persistence foundation:** shared `@nexsolarix/astronomy` package, PostgreSQL and Prisma schema + seed.
- **Quality:** ESLint, Vitest, React Testing Library, Playwright.

## Repository layout

```text
apps/
  api/                 Express REST API
  web/                 React / Vite application
packages/
  astronomy/           Shared records, provenance, relationships, orbital inputs
prisma/
  schema.prisma        PostgreSQL catalog and optional user models
  seed.ts              Idempotent catalog/source/mission seed
.github/workflows/     CI checks
```

## Run locally

Requirements: Node.js 22.12+ and npm 10+.

```bash
npm install
cp .env.example .env   # optional for local development; defaults are usable without it
npm run dev
```

The root `dev` command builds the shared astronomy package, starts the API on port `4000`, and starts Vite on port `5173`. The web server proxies `/api` to the API; browser code uses only relative `/api` URLs. Open `http://localhost:5173`.

The application continues to work if the API is unavailable: it falls back to the same small, local scientific snapshot bundled with the web client and does not silently substitute live or stale external responses.

## Commands

```bash
npm run dev          # API + web development servers
npm run build        # shared package, API, and production web build
npm run lint         # ESLint across workspaces
npm run typecheck    # strict TypeScript checks
npm run test         # Vitest / React tests and API unit tests
npm run test:e2e     # Playwright browser flows
```

Playwright requires a browser binary. Install Chromium once with `npx playwright install chromium` (CI installs it automatically). If your environment blocks the Playwright CDN, the E2E suite remains available but cannot launch locally until Chromium is supplied.

## Database foundation (optional)

The initial app is intentionally usable without a database. The Express API currently serves the curated shared snapshot; the Prisma schema and seed establish the normalized persistence boundary for a future database-backed catalog. To prepare PostgreSQL locally:

1. Create a PostgreSQL database and set `DATABASE_URL` in `.env`.
2. Generate Prisma Client and apply the initial migration:

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

The Prisma CLI may need to download its platform engine during generation/migration. A configured database and an environment that permits that download are required. Do not commit database credentials.

## API overview

- `GET /api/health`
- `GET /api/objects?page=1&limit=24&type=planet&q=mars`
- `GET /api/objects/:id`
- `GET /api/planets` and `GET /api/planets/:id`
- `GET /api/search?q=Europa`
- `GET /api/missions` and `GET /api/missions/:id`
- `GET /api/events` — returns an explicit empty-catalog state until verified events are ingested
- `GET /api/sources` and `GET /api/sources/:id`
- `GET /api/compare?a=earth&b=mars`

List endpoints return typed JSON envelopes, with bounded pagination on `/api/objects`. API responses are sourced from the curated local snapshot in this release.

## Scientific methodology

- Scientific values are defined in `packages/astronomy`, not embedded in interface components. Each fact carries a key, display label, value, unit, confidence classification, source IDs, and optional context.
- Source records include organization, title, URL, local snapshot review date, and use/limitation notes. Source links remain visible from profiles and the Sources page.
- Confidence labels distinguish **Verified**, **Estimated**, **Modeled**, **Candidate**, and **Unknown**. The UI does not infer extraterrestrial life; Earth is the only world marked as hosting confirmed life. “Potentially habitable” and past habitability are clearly distinguished from evidence of life.
- The 3D orbital view implements NASA/JPL’s published approximate mean orbital elements and secular rates. It is an educational visualization, not an ephemeris, navigation aid, or observation planner. Model accuracy is described as approximate for roughly 1800–2050; out-of-range dates are marked as extrapolated.
- Orbital distances and object sizes are rescaled for legibility. The scene is labeled schematic and not to scale. The one-month simulation speed uses a 30-day approximation.
- The bundled data is a static snapshot, not a live NASA/ESA API feed. Source publication update dates are not asserted when unavailable; users should consult the authoritative reference for current revisions and measurement definitions.

## Data sources

The release cites NASA / NSSDC’s Planetary Fact Sheet, NASA JPL Solar System Dynamics’ approximate planet-position model, NASA Science’s moons and Sun reference pages, NASA’s mission directory, and NASA skywatching resources. See the in-product [Sources page](/sources) for URLs, intended use, and limitations.

No NASA Eyes implementation, proprietary code, branding, or assets are used. NexSolarix visuals are original procedural 3D and CSS renderings.

## Accessibility and performance

- Keyboard-operable links, forms, and scene object labels; visible focus styling; semantic controls; screen-reader labels; reduced-motion support.
- A non-3D catalog mode offers an alternative to the WebGL scene. The mobile experience uses a compact bottom sheet and touch-friendly navigation.
- Starfield density and device pixel ratio are capped according to the selected graphics mode. The UI and core catalog remain available when WebGL is unavailable.
- PWA shell caching is deliberately small. `/api` responses are not cached; the bundled local snapshot is the offline fallback.

## Production deployment

1. Set `DATABASE_URL`, `PORT`, and `WEB_ORIGIN` for the API. Keep secrets outside source control.
2. Build from the repository root with `npm ci && npm run build`.
3. Deploy `apps/web/dist` to a static host with SPA history fallback, and deploy `apps/api/dist/server.js` to a Node 22-compatible host. Route `/api/*` to the API or use a same-origin reverse proxy.
4. If enabling PostgreSQL persistence, generate Prisma Client and apply migrations before starting the API. The current API continues to use the curated snapshot; database-backed reads are a documented next integration step, not represented as active functionality.
5. Configure HTTPS, a restrictive `WEB_ORIGIN`, request logging/monitoring, database backups, and an explicit data refresh/validation process.

No hosting provider is assumed.

## Known limitations

- The live astronomy APIs and ingestion jobs described as future architecture are not connected in this first release.
- PostgreSQL schema/seed are present; the current Express read routes use the curated shared data module and do not yet query PostgreSQL.
- Exoplanet, star, galaxy, nebula, black-hole, asteroid, comet, and event catalogs remain empty except for the Sun as a local reference star. Their routes are transparent about that limitation.
- The local mission list is selective and static; current operational status can change.
- No login, user collections, telemetry, spacecraft trajectory service, precision time model, image catalog, or observation planner is implemented.
- Browser E2E tests require a Playwright Chromium binary; restricted environments may be unable to download it.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Scientific data changes must include authoritative sources, units, confidence/uncertainty, and a clear snapshot/update note.

## License

MIT. See [LICENSE](LICENSE).
