/**
 * Dev-only: renders the animated SVG artwork embedded in README.md.
 *
 *   npx vite-node tools/readme-assets.ts
 *
 * Writes docs/assets/*.svg — hero, badge row, divider, terminal and a showcase
 * grid. The showcase pieces come straight from the animation registry, so the
 * README previews can never drift from what the site actually renders. The
 * hero/badges/divider are bespoke compositions built from the same svgkit
 * primitives the gallery uses (SMIL only — they animate inside GitHub's
 * `<img>` renderer).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderAnimation } from '../src/animations';
import { resolveConfig } from '../src/core/palettes';
import {
  animate,
  animateTransform,
  buildSvgDocument,
  createRenderCtx,
  estimateTextWidth,
  fitText,
  h,
  shimmerBand,
  softBlob,
  textEl,
} from '../src/lib/svgkit';

const outDir = resolve('docs/assets');
mkdirSync(outDir, { recursive: true });

let count = 0;
function write(name: string, svg: string): void {
  writeFileSync(resolve(outDir, name), `${svg.trim()}\n`, 'utf8');
  count += 1;
  console.log(`  ✓ docs/assets/${name}`);
}

function assertFits(label: string, text: string, size: number, font: 'display' | 'sans' | 'mono', weight: number, max: number): void {
  const width = estimateTextWidth(text, size, font, weight);
  if (width > max) {
    throw new Error(`readme-assets: "${label}" overflows (${Math.round(width)}px > ${Math.round(max)}px)`);
  }
}

/* ------------------------------------------------------------------ *
 * Hero banner — aurora blobs, starfield, gradient title with masked
 * shimmer sweep, animated underline and stat chips.
 * ------------------------------------------------------------------ */
function heroSvg(): string {
  const W = 1200;
  const H = 380;
  const config = resolveConfig({
    paletteId: 'midnight-violet',
    width: W,
    height: H,
    radius: 24,
    density: 5,
    glow: true,
    font: 'display',
    title: 'NEXSOLARIX',
    subtitle: 'Template README.md & animasi SVG premium — satu situs, dua klik.',
    label: 'STUDIO README & ANIMASI SVG',
  });
  const x = createRenderCtx('readme-hero', config);

  const title = 'NEXSOLARIX';
  const titleSize = 104;
  const titleY = 208;
  assertFits('hero title', title, titleSize, 'display', 900, W * 0.82);

  const subtitle = 'Template README.md & animasi SVG premium — satu situs, dua klik.';
  const subtitleSize = 25;
  assertFits('hero subtitle', subtitle, subtitleSize, 'display', 500, W * 0.86);

  const maskId = x.id('titleMask');
  x.addDef(
    h('mask', { id: maskId, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, [
      h('rect', { x: 0, y: 0, width: W, height: H, fill: '#000' }),
      textEl(title, {
        x: W / 2,
        y: titleY,
        size: titleSize,
        fill: '#fff',
        font: x.font,
        weight: 900,
        anchor: 'middle',
        letterSpacing: titleSize * 0.06,
      }),
    ].join('')),
  );

  const underlineId = x.id('underline');
  x.addDef(
    h('linearGradient', { id: underlineId, x1: '0%', y1: '0%', x2: '100%', y2: '0%' }, [
      h('stop', { offset: '0%', 'stop-color': x.g1, 'stop-opacity': 0 }),
      h('stop', { offset: '50%', 'stop-color': x.g2, 'stop-opacity': 1 }),
      h('stop', { offset: '100%', 'stop-color': x.g3, 'stop-opacity': 0 }),
    ].join('')),
  );

  const body = [
    // Drifting aurora blobs.
    softBlob(x, { cx: W * 0.18, cy: H * 0.32, r: H * 0.52, color: x.g1, opacity: 0.5, dur: 11, drift: 30, blur: 'soft-lg' }),
    softBlob(x, { cx: W * 0.52, cy: H * 0.72, r: H * 0.55, color: x.g2, opacity: 0.38, dur: 13, drift: 36, blur: 'soft-lg' }),
    softBlob(x, { cx: W * 0.84, cy: H * 0.36, r: H * 0.5, color: x.g3, opacity: 0.42, dur: 12, drift: 32, blur: 'soft-lg' }),
    x.starField({ count: 60, minR: 0.8, maxR: 2.2, opacity: 0.55, twinkle: true }),
    // Eyebrow label.
    textEl(config.label, {
      x: W / 2,
      y: 74,
      size: 19,
      fill: x.g1,
      font: x.font,
      weight: 700,
      anchor: 'middle',
      letterSpacing: 7,
      opacity: 0.95,
    }),
    // Gradient title + glow.
    textEl(title, {
      x: W / 2,
      y: titleY,
      size: titleSize,
      fill: `url(#${x.id('accent')})`,
      font: x.font,
      weight: 900,
      anchor: 'middle',
      letterSpacing: titleSize * 0.06,
      filter: x.glow ? `url(#${x.id('glow')})` : undefined,
    }),
    // Shimmer visible only inside the letters.
    h('g', { mask: `url(#${maskId})` },
      shimmerBand(x, { y: titleY - titleSize, height: titleSize * 1.5, dur: 5.2, width: W * 0.2, opacity: 0.85 })),
    // Animated underline (scales from the centre).
    h('g', { transform: `translate(${W / 2} 244)` }, [
      h('rect', { x: -220, y: 0, width: 440, height: 5, rx: 2.5, fill: `url(#${underlineId})` }, [
        animateTransform('scale', { dur: x.dur(3.6), values: '0.18 1;1 1;0.18 1', calcMode: 'spline', keyTimes: '0;0.5;1', keySplines: '0.42 0 0.58 1;0.42 0 0.58 1' }),
      ].join('')),
    ].join('')),
    // Subtitle.
    textEl(subtitle, {
      x: W / 2,
      y: 296,
      size: subtitleSize,
      fill: x.text,
      font: x.font,
      weight: 500,
      anchor: 'middle',
      opacity: 0.9,
    }),
    // Stat chips.
    x.chips(['22 Template', '37 Animasi SVG', '18 Palet Warna', '358 Tes', 'MIT License'], {
      y: H - 34,
      align: 'center',
    }),
    x.vignette(0.42),
  ].join('');

  return buildSvgDocument(x, {
    aria: 'NexSolarix — studio template README dan animasi SVG premium',
    body,
  });
}

/* ------------------------------------------------------------------ *
 * Animated badge row.
 * ------------------------------------------------------------------ */
function badgesSvg(): string {
  const badges: { label: string; tone: 'g1' | 'g2' | 'g3' }[] = [
    { label: 'React 19', tone: 'g1' },
    { label: 'Vite 6', tone: 'g2' },
    { label: 'TypeScript', tone: 'g3' },
    { label: '22 Template', tone: 'g1' },
    { label: '37 Animasi', tone: 'g2' },
    { label: 'MIT', tone: 'g3' },
  ];

  const H = 64;
  const padX = 20;
  const size = 15;
  const gap = 14;
  const dotR = 5;
  const textFont = 'sans' as const;

  const pillWidths = badges.map(
    (badge) => padX + dotR * 2 + 10 + estimateTextWidth(badge.label, size, textFont, 700) + padX,
  );
  const total = pillWidths.reduce((sum, width) => sum + width, 0) + gap * (badges.length - 1);
  const W = Math.round(total + 28);

  const config = resolveConfig({
    paletteId: 'midnight-violet',
    width: W,
    height: H,
    radius: 32,
    glow: true,
    font: 'sans',
  });
  const x = createRenderCtx('readme-badges', config);

  let cursor = (W - total) / 2;
  const pills = badges.map((badge, index) => {
    const width = pillWidths[index] as number;
    const tone = x[badge.tone];
    const cy = H / 2;
    const markup = [
      h('rect', {
        x: cursor,
        y: 10,
        width,
        height: H - 20,
        rx: (H - 20) / 2,
        fill: x.surface,
        stroke: tone,
        'stroke-width': 1.4,
        opacity: 0.96,
      }),
      // Pulsing status dot.
      h('circle', { cx: cursor + padX + dotR, cy, r: dotR, fill: tone }, [
        animate('opacity', { dur: x.dur(2.2), values: '1;0.35;1', begin: `${(index * 0.28).toFixed(2)}s` }),
      ].join('')),
      textEl(badge.label, {
        x: cursor + padX + dotR * 2 + 10,
        y: cy + size * 0.36,
        size,
        fill: x.text,
        font: x.font,
        weight: 700,
        anchor: 'start',
        letterSpacing: 0.3,
      }),
    ].join('');
    cursor += width + gap;
    return markup;
  });

  const body = [
    pills.join(''),
    // Glossy sweep across the whole row.
    shimmerBand(x, { y: 0, height: H, dur: 6, width: W * 0.18, opacity: 0.3 }),
    x.vignette(0.18),
  ].join('');

  return buildSvgDocument(x, {
    aria: 'React 19 · Vite 6 · TypeScript · 22 Template · 37 Animasi · MIT',
    body,
  });
}

/* ------------------------------------------------------------------ *
 * Animated divider — gradient rail with travelling glow orbs and a
 * pulsing centre gem.
 * ------------------------------------------------------------------ */
function dividerSvg(): string {
  const W = 1200;
  const H = 72;
  const config = resolveConfig({
    paletteId: 'midnight-violet',
    width: W,
    height: H,
    radius: 0,
    transparent: true,
    glow: true,
    font: 'sans',
  });
  const x = createRenderCtx('readme-divider', config);

  const railId = x.id('rail');
  x.addDef(
    h('linearGradient', { id: railId, x1: '0%', y1: '0%', x2: '100%', y2: '0%' }, [
      h('stop', { offset: '0%', 'stop-color': x.g1, 'stop-opacity': 0 }),
      h('stop', { offset: '18%', 'stop-color': x.g1, 'stop-opacity': 0.85 }),
      h('stop', { offset: '50%', 'stop-color': x.g2, 'stop-opacity': 1 }),
      h('stop', { offset: '82%', 'stop-color': x.g3, 'stop-opacity': 0.85 }),
      h('stop', { offset: '100%', 'stop-color': x.g3, 'stop-opacity': 0 }),
    ].join('')),
  );

  const midY = H / 2;
  const orbs: string[] = [];
  const orbTone = [x.g1, x.g2, x.g3];
  for (let i = 0; i < 3; i += 1) {
    orbs.push(
      h('circle', { cx: 0, cy: midY, r: 5.5 - i, fill: orbTone[i] as string, opacity: 1 - i * 0.28 }, [
        animate('cx', {
          dur: x.dur(7),
          begin: `${(-i * 2.33).toFixed(2)}s`,
          values: `60;${W - 60};60`,
          calcMode: 'spline',
          keyTimes: '0;0.5;1',
          keySplines: '0.42 0 0.58 1;0.42 0 0.58 1',
        }),
        animate('opacity', {
          dur: x.dur(7),
          begin: `${(-i * 2.33).toFixed(2)}s`,
          values: `${1 - i * 0.28};${0.35};${1 - i * 0.28}`,
        }),
      ].join('')),
    );
  }

  const body = [
    h('rect', { x: 0, y: midY - 1.5, width: W, height: 3, rx: 1.5, fill: `url(#${railId})`, opacity: 0.65 }),
    orbs.join(''),
    // Centre gem: rotating diamond with a breathing halo.
    h('g', { transform: `translate(${W / 2} ${midY})` }, [
      h('circle', { cx: 0, cy: 0, r: 14, fill: x.g2, opacity: 0.22, filter: x.glow ? `url(#${x.id('glow')})` : undefined }, [
        animate('r', { dur: x.dur(2.8), values: '11;17;11' }),
        animate('opacity', { dur: x.dur(2.8), values: '0.32;0.12;0.32' }),
      ].join('')),
      h('rect', { x: -7, y: -7, width: 14, height: 14, rx: 2.5, fill: x.g2, transform: 'rotate(45)' }, [
        animateTransform('rotate', {
          type: 'rotate',
          dur: x.dur(9),
          values: '0;360',
          additive: 'sum',
        }),
      ].join('')),
    ].join('')),
    // Side sparkles.
    [0.12, 0.26, 0.74, 0.88].map((pos, index) =>
      h('circle', { cx: W * pos, cy: midY, r: 2.4, fill: index % 2 ? x.g1 : x.g3 }, [
        animate('opacity', { dur: x.dur(2.6), begin: `${index * 0.5}s`, values: '0.15;0.95;0.15' }),
      ].join('')),
    ).join(''),
  ].join('');

  return buildSvgDocument(x, {
    aria: 'Pemisah animasi bergradasi dengan cahaya yang berjalan',
    body,
    background: false,
  });
}

/* ------------------------------------------------------------------ *
 * Showcase pieces — straight from the animation registry.
 * ------------------------------------------------------------------ */
const SHOWCASES: { id: string; file: string; paletteId: string; title: string; subtitle: string; label: string }[] = [
  { id: 'aurora-flow', file: 'showcase-aurora-flow.svg', paletteId: 'midnight-violet', title: 'NexSolarix', subtitle: 'lapisan kabut bergerak', label: 'AURORA FLOW' },
  { id: 'holo-card', file: 'showcase-holo-card.svg', paletteId: 'cyber-cyan', title: 'Holo Card', subtitle: 'kilau iridesen', label: 'PREMIUM' },
  { id: 'kinetic-typo', file: 'showcase-kinetic-typo.svg', paletteId: 'neon-magenta', title: 'NexSolarix', subtitle: 'huruf yang menari', label: 'KINETIC' },
  { id: 'retro-sun', file: 'showcase-retro-sun.svg', paletteId: 'solar-amber', title: 'RETRO SUN', subtitle: 'synthwave', label: 'PREMIUM' },
  { id: 'code-window', file: 'showcase-code-window.svg', paletteId: 'deep-ocean', title: 'NexSolarix', subtitle: 'jendela editor', label: 'IDE WINDOW' },
  { id: 'stat-rings', file: 'showcase-stat-rings.svg', paletteId: 'emerald-lab', title: 'Stats', subtitle: 'cincin statistik', label: 'STAT RINGS' },
];

const TERMINAL = {
  id: 'terminal-type',
  file: 'showcase-terminal.svg',
  paletteId: 'midnight-violet',
  title: 'Instalasi',
  subtitle: 'npm install && npm run dev',
  label: 'NEXSOLARIX',
};

/* ------------------------------------------------------------------ *
 * Emit everything.
 * ------------------------------------------------------------------ */
console.log('rendering README assets → docs/assets/');

write('hero.svg', heroSvg());
write('badges.svg', badgesSvg());
write('divider.svg', dividerSvg());

write(
  TERMINAL.file,
  renderAnimation(TERMINAL.id, {
    paletteId: TERMINAL.paletteId,
    width: 920,
    height: 340,
    title: TERMINAL.title,
    subtitle: TERMINAL.subtitle,
    label: TERMINAL.label,
  }),
);

for (const showcase of SHOWCASES) {
  const svg = renderAnimation(showcase.id, {
    paletteId: showcase.paletteId,
    width: 900,
    title: showcase.title,
    subtitle: showcase.subtitle,
    label: showcase.label,
  });
  if (!svg) throw new Error(`readme-assets: unknown animation "${showcase.id}"`);
  write(showcase.file, svg);
}

// Sanity: every artefact must be a standalone SVG without scripts.
const { readdirSync, readFileSync } = await import('node:fs');
for (const name of readdirSync(outDir)) {
  const svg = readFileSync(resolve(outDir, name), 'utf8');
  if (!svg.startsWith('<svg') || svg.includes('<script')) {
    throw new Error(`readme-assets: ${name} is not a clean standalone SVG`);
  }
}

console.log(`wrote ${count} SVG files to docs/assets/`);
