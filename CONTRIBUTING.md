# Contributing to NexSolarix

Thanks for helping make the atlas clearer, more useful, and more scientifically responsible.

## Development setup

- Node.js 22.12+ and npm 10+
- `npm install`
- `npm run dev`
- `npm run lint`, `npm run typecheck`, and `npm run test` before opening a pull request

For browser tests, install Playwright Chromium with `npx playwright install chromium` if it is not already available.

## Pull requests

1. Keep changes focused and explain the user or scientific need.
2. Keep data separate from presentation. Shared astronomical records belong in `packages/astronomy`; database structure belongs in `prisma/schema.prisma`.
3. Add or update unit/UI tests when behavior changes. Keep routes and all visible controls functional.
4. Do not add large textures, datasets, or generated artifacts without documenting their source, license, compression, and performance impact.
5. Never commit `.env`, secrets, credentials, or private data.

## Scientific-data contributions

Every scientific value or claim must include:

- An authoritative source and stable URL (prefer NASA, JPL, ESA, SIMBAD, Gaia, or the relevant catalog publisher).
- A normalized value and explicit unit; preserve the source's measurement definition.
- A confidence label (`verified`, `estimated`, `modeled`, `candidate`, or `unknown`) and a note for uncertainty or model-dependence.
- A source record with organization, dataset title, use/licensing notes where available, and a snapshot/review date. Do not invent the source's publication date if it is not known.
- A test or validation where appropriate (unit conversion, identifier uniqueness, relationship integrity).

Do not present estimates as exact. Do not claim extraterrestrial life, inhabitants, or discoveries without authoritative confirmation. Empty catalog sections are preferable to fabricated content.

## Design and accessibility

- Preserve keyboard navigation, visible focus, readable contrast, responsive layout, and reduced-motion behavior.
- The WebGL view cannot be the only way to use the product. Keep a clear data/list alternative.
- Use original brand and UI work. Do not copy NASA Eyes code, proprietary assets, or exact interface layouts.
