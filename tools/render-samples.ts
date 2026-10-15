/**
 * Dev-only helper: writes one SVG per registered animation (default config)
 * plus a few palette variants, so the assets can be eyeballed or diffed.
 *
 *   npx vite-node tools/render-samples.ts -- out
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ALL_ANIMATIONS, renderAnimation } from '../src/animations';
import { getPalette, resolveConfig } from '../src/core/palettes';

const outDir = resolve(process.argv[3] ?? 'samples');
mkdirSync(outDir, { recursive: true });

let count = 0;
for (const animation of ALL_ANIMATIONS) {
  const config = resolveConfig({
    ...animation.defaults,
    title: 'NexSolarix',
    subtitle: 'README that moves',
    label: animation.name.en.toUpperCase(),
  });
  writeFileSync(resolve(outDir, `${animation.id}.svg`), renderAnimation(animation.id, config));
  count += 1;
}

// Palette sweep for one banner + one card so palettes can be compared side by side.
for (const paletteId of ['midnight-violet', 'cyber-cyan', 'solar-amber', 'holo-chrome', 'paper-ink']) {
  const config = resolveConfig({ paletteId, title: 'NexSolarix', subtitle: 'Palette sweep', label: getPalette(paletteId).name.en });
  writeFileSync(resolve(outDir, `sweep-aurora-${paletteId}.svg`), renderAnimation('aurora-banner', config));
  writeFileSync(resolve(outDir, `sweep-holo-${paletteId}.svg`), renderAnimation('holo-card', config));
  count += 2;
}

console.log(`wrote ${count} SVG files to ${outDir}`);
