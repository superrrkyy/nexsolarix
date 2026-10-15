/**
 * Dev-only layout audit.
 *
 * Walks every registered animation at a few sizes and reports text that either
 * leaves the viewport or collides with another text, measured with the same
 * (conservative) advance-width model the kit uses for manual layout.
 *
 * Texts inside a transformed group are skipped: their position is owned by the
 * transform, so a static read of `x`/`y` says nothing.
 *
 *   npx vite-node tools/audit-layout.ts
 */

import { ALL_ANIMATIONS, renderAnimation } from '../src/animations';

const FONT_KEYS: [string, number][] = [
  ["'JetBrains Mono'", 0.62],
  ['Inter', 0.55],
  ["'Iowan Old Style'", 0.52],
  ["'Arial Black'", 0.68],
  ["'Trebuchet MS'", 0.58],
];

function factorOf(fontFamily: string): number {
  for (const [needle, factor] of FONT_KEYS) if (fontFamily.includes(needle)) return factor;
  return 0.62;
}

interface Box {
  label: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/**
 * Animations whose design deliberately repeats, splits or scrolls its own text
 * (RGB-split glitch copies, marquee loops, kinetic type). Static measurement
 * cannot tell those apart from real collisions, so they are skipped.
 */
const INTENTIONAL_OVERLAP = new Set(['cyber-glitch', 'marquee-band', 'kinetic-typo', 'prism-beam', 'liquid-metal']);

const SIZES: [number, number][] = [
  [900, 280],
  [620, 150],
  [1200, 520],
];

/** Every `<text>` that is not nested inside a transformed group. */
function layoutTexts(svg: string): string[] {
  const found: string[] = [];
  const stack: boolean[] = [];
  let transformed = false;

  const tokens = svg.split(/(<[^>]*>)/g);
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i] as string;
    if (token.startsWith('<g ') || token === '<g>') {
      stack.push(transformed);
      if (/\stransform="/.test(token)) transformed = true;
      continue;
    }
    if (token.startsWith('</g')) {
      transformed = stack.pop() ?? false;
      continue;
    }
    if (token.startsWith('<text') && !transformed) {
      const content = (tokens[i + 1] ?? '').replace(/&amp;/g, '&');
      found.push(`${token.replace(/^<text/, '').replace(/>$/, '')}>${content}`);
    }
  }
  return found;
}

function boxesOf(svg: string, width: number): Box[] {
  return layoutTexts(svg).map((entry) => {
    const [attrs = '', text = ''] = entry.split('>');
    const num = (name: string) => Number(new RegExp(`${name}="([^"]+)"`).exec(attrs)?.[1] ?? NaN);
    const x = num('x');
    const y = num('y');
    const size = num('font-size');
    // SVG default is `start`; only an explicit attribute changes that.
    const anchor = /text-anchor="(\w+)"/.exec(attrs)?.[1] ?? 'start';
    const weight = num('font-weight');
    const fontFamily = /font-family="([^"]*)"/.exec(attrs)?.[1] ?? '';
    const advance = text.length * size * factorOf(fontFamily) * (weight >= 700 ? 1.05 : 1);
    const x1 = anchor === 'middle' ? x - advance / 2 : anchor === 'end' ? x - advance : x;
    void width;
    return { label: text.slice(0, 24), x1, x2: x1 + advance, y1: y - size * 0.82, y2: y + size * 0.24 };
  });
}

let problems = 0;
const flagged = new Set<string>();

for (const animation of ALL_ANIMATIONS) {
  if (INTENTIONAL_OVERLAP.has(animation.id)) continue;
  for (const [width, height] of SIZES) {
    const svg = renderAnimation(animation.id, {
      width,
      height,
      title: 'NEXSOLARIX',
      subtitle: 'Explore the universe, one world at a time',
      label: '@superryinz',
    });
    const boxes = boxesOf(svg, width);

    for (const box of boxes) {
      if (box.x1 < -1 || box.x2 > width + 1) {
        problems += 1;
        flagged.add(animation.id);
        console.log(`[${animation.id} ${width}x${height}] clips "${box.label}" (${box.x1.toFixed(0)}..${box.x2.toFixed(0)} in ${width})`);
      }
    }

    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i] as Box;
        const b = boxes[j] as Box;
        const overlapX = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
        const overlapY = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
        if (overlapX > 4 && overlapY > 4) {
          problems += 1;
          flagged.add(animation.id);
          console.log(`[${animation.id} ${width}x${height}] overlap "${a.label}" ~ "${b.label}" (${overlapX.toFixed(0)}x${overlapY.toFixed(0)})`);
        }
      }
    }
  }
}

console.log(problems === 0 ? 'layout audit: clean' : `layout audit: ${problems} findings in ${[...flagged].join(', ')}`);
