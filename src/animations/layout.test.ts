import { describe, expect, it } from 'vitest';
import { ALL_ANIMATIONS, renderAnimation } from './index';
import { ALL_TEMPLATES } from '../templates';
import { templateFiles } from '../lib/exporter';

/**
 * Layout guardrails.
 *
 * SVGs have no layout engine, so every line of generated copy is positioned by
 * hand. These tests re-measure that copy with the kit's own (conservative)
 * advance-width model and fail when text would leave its canvas or collide with
 * another piece of text.
 *
 * Animations that intentionally repeat or split their text (glitch copies,
 * marquee loops, kinetic type) are exempt — see INTENTIONAL_OVERLAP.
 */

const INTENTIONAL_OVERLAP = new Set(['cyber-glitch', 'marquee-band', 'kinetic-typo', 'prism-beam', 'liquid-metal']);

const FONT_FACTORS: [string, number][] = [
  ["'JetBrains Mono'", 0.62],
  ['Inter', 0.55],
  ["'Iowan Old Style'", 0.52],
  ["'Arial Black'", 0.68],
  ["'Trebuchet MS'", 0.58],
];

function factorOf(fontFamily: string): number {
  for (const [needle, factor] of FONT_FACTORS) if (fontFamily.includes(needle)) return factor;
  return 0.62;
}

interface Box {
  label: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/** Texts that are not nested inside a transformed group (position owned by a transform). */
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
    } else if (token.startsWith('</g')) {
      transformed = stack.pop() ?? false;
    } else if (token.startsWith('<text') && !transformed) {
      const content = (tokens[i + 1] ?? '').replace(/&amp;/g, '&');
      found.push(`${token.replace(/^<text/, '').replace(/>$/, '')}>${content}`);
    }
  }
  return found;
}

function boxesOf(svg: string): Box[] {
  return layoutTexts(svg).map((entry) => {
    const [attrs = '', text = ''] = entry.split('>');
    const num = (name: string) => Number(new RegExp(`${name}="([^"]+)"`).exec(attrs)?.[1] ?? NaN);
    const x = num('x');
    const y = num('y');
    const size = num('font-size');
    const weight = num('font-weight');
    const anchor = /text-anchor="(\w+)"/.exec(attrs)?.[1] ?? 'start';
    const fontFamily = /font-family="([^"]*)"/.exec(attrs)?.[1] ?? '';
    const advance = text.length * size * factorOf(fontFamily) * (weight >= 700 ? 1.05 : 1);
    const x1 = anchor === 'middle' ? x - advance / 2 : anchor === 'end' ? x - advance : x;
    return { label: text.slice(0, 24), x1, x2: x1 + advance, y1: y - size * 0.82, y2: y + size * 0.24 };
  });
}

const SIZES: [number, number][] = [
  [900, 280],
  [620, 150],
  [1200, 520],
];

const MEASURED = ALL_ANIMATIONS.filter((animation) => !INTENTIONAL_OVERLAP.has(animation.id));

describe('generated text stays inside its canvas', () => {
  it.each(MEASURED.flatMap((animation) => SIZES.map(([w, h]) => [`${animation.id} ${w}x${h}`, animation.id, w, h] as const)))(
    '%s',
    (_name, id, width, height) => {
      const svg = renderAnimation(id, {
        width,
        height,
        title: 'NEXSOLARIX',
        subtitle: 'Explore the universe, one world at a time',
        label: '@superryinz',
      });

      const clipped = boxesOf(svg).filter((box) => box.x1 < -1 || box.x2 > width + 1);
      expect(clipped.map((box) => `${box.label} (${Math.round(box.x1)}..${Math.round(box.x2)})`)).toEqual([]);
    },
  );

  it.each(MEASURED.map((animation) => animation.id))('keeps %s lines from colliding', (id) => {
    const collisions: string[] = [];
    for (const [width, height] of SIZES) {
      const boxes = boxesOf(
        renderAnimation(id, {
          width,
          height,
          title: 'NEXSOLARIX',
          subtitle: 'Explore the universe, one world at a time',
          label: '@superryinz',
        }),
      );
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i] as Box;
          const b = boxes[j] as Box;
          const overlapX = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
          const overlapY = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
          if (overlapX > 4 && overlapY > 4) {
            collisions.push(`${width}x${height}: "${a.label}" ~ "${b.label}" (${Math.round(overlapX)}x${Math.round(overlapY)})`);
          }
        }
      }
    }
    expect(collisions).toEqual([]);
  });
});

describe('templates stay inside their canvas too', () => {
  it('renders every template at a small and a large size without clipping', () => {
    const clipped: string[] = [];
    for (const template of ALL_TEMPLATES) {
      for (const config of [{ height: 150, width: 620 }, { height: 520, width: 1200 }]) {
        for (const file of templateFiles(template, config).filter((entry) => entry.kind === 'svg')) {
          const animationId = file.path.replace(/^assets\//, '').replace(/\.svg$/, '');
          if (INTENTIONAL_OVERLAP.has(animationId)) continue;
          const width = Number(/width="(\d+)"/.exec(file.content)?.[1] ?? 0);
          for (const box of boxesOf(file.content)) {
            if (box.x1 < -1 || box.x2 > width + 1) {
              clipped.push(`${template.id} ${file.path} (${Math.round(box.x1)}..${Math.round(box.x2)} of ${width})`);
            }
          }
        }
      }
    }
    expect(clipped.slice(0, 12)).toEqual([]);
  });
});
