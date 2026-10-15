/**
 * Dev-only helper: rasterising helper input — writes a single animation SVG.
 *   npx vite-node tools/render-one.ts -- profile-card 760 300 /tmp/out.svg
 */
import { writeFileSync } from 'node:fs';
import { renderAnimation } from '../src/animations';

const [id, w, h, out] = [process.argv[2] ?? 'profile-card', Number(process.argv[3] ?? 900), Number(process.argv[4] ?? 280), process.argv[5] ?? '/tmp/one.svg'];
const svg = renderAnimation(id, { width: w, height: h, paletteId: 'midnight-violet', title: 'NEXSOLARIX', subtitle: 'Explore the universe, one world at a time', label: '@superryinz' });
writeFileSync(out, svg);
console.log(`wrote ${out} (${w}x${h})`);
