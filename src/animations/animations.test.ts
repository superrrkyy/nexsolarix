import { describe, expect, it } from 'vitest';
import { ALL_ANIMATIONS, ANIMATION_MAP, renderAnimation } from './index';
import { PALETTES, resolveConfig } from '../core/palettes';
import { FREE_TEMPLATES, PREMIUM_TEMPLATES, ALL_TEMPLATES } from '../templates';

function referencedIds(svg: string): string[] {
  const ids: string[] = [];
  const pattern = /url\(#([^)]+)\)/g;
  let match = pattern.exec(svg);
  while (match) {
    ids.push(match[1] as string);
    match = pattern.exec(svg);
  }
  return ids;
}

function definedIds(svg: string): Set<string> {
  const found = new Set<string>();
  const pattern = /\sid="([^"]+)"/g;
  let match = pattern.exec(svg);
  while (match) {
    found.add(match[1] as string);
    match = pattern.exec(svg);
  }
  return found;
}

describe('animation registry', () => {
  it('ships at least 30 animations with unique ids', () => {
    expect(ALL_ANIMATIONS.length).toBeGreaterThanOrEqual(30);
    const ids = ALL_ANIMATIONS.map((animation) => animation.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps a healthy premium split', () => {
    const premium = ALL_ANIMATIONS.filter((animation) => animation.tier === 'premium');
    expect(premium.length).toBeGreaterThanOrEqual(10);
    expect(ALL_ANIMATIONS.length - premium.length).toBeGreaterThanOrEqual(20);
  });

  it.each(ALL_ANIMATIONS.map((animation) => animation.id))('renders a standalone valid SVG: %s', (id) => {
    const animation = ANIMATION_MAP[id];
    expect(animation).toBeDefined();
    const svg = renderAnimation(id, { paletteId: 'midnight-violet' });

    expect(svg.startsWith('<svg ')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('<title>');
    expect(svg).toContain('role="img"');
    // GitHub strips scripts; none may sneak in.
    expect(svg.toLowerCase()).not.toContain('<script');
    expect(svg).not.toContain('javascript:');
    // No unescaped ampersands (would break XML parsing).
    expect(/&(?!(amp|lt|gt|quot|apos|#\d+);)/.test(svg)).toBe(false);
  });

  it.each(ALL_ANIMATIONS.map((animation) => animation.id))('every url(#id) reference resolves: %s', (id) => {
    const svg = renderAnimation(id, { paletteId: 'cyber-cyan' });
    const defined = definedIds(svg);
    const missing = referencedIds(svg).filter((reference) => !defined.has(reference));
    expect(missing).toEqual([]);
  });

  it.each(ALL_ANIMATIONS.map((animation) => animation.id))('respects width/height and transparency: %s', (id) => {
    const svg = renderAnimation(id, { width: 640, height: 200, transparent: true, paletteId: 'paper-ink' });
    expect(svg).toContain('width="640"');
    expect(svg).toContain('height="200"');
    expect(svg).toContain('viewBox="0 0 640 200"');
    expect(svg).not.toContain('url(#ink-bg)');
  });

  it('renders in every palette without breaking', () => {
    for (const palette of PALETTES) {
      const svg = renderAnimation('aurora-banner', { paletteId: palette.id });
      expect(svg.startsWith('<svg ')).toBe(true);
      const defined = definedIds(svg);
      const missing = referencedIds(svg).filter((reference) => !defined.has(reference));
      expect(missing, `palette ${palette.id}`).toEqual([]);
    }
  });

  it('animations declare usable controls and defaults', () => {
    for (const animation of ALL_ANIMATIONS) {
      expect(animation.controls.length).toBeGreaterThan(3);
      expect(animation.name.id.length).toBeGreaterThan(2);
      expect(animation.name.en.length).toBeGreaterThan(2);
      expect(animation.tags.length).toBeGreaterThan(0);
    }
  });

  it('scales density and speed without producing invalid durations', () => {
    const svg = renderAnimation('starfield', resolveConfig({ density: 10, speed: 2.5 }));
    expect(svg).toContain('<svg ');
    const durations = [...svg.matchAll(/dur="([^"]+)"/g)].map((match) => match[1] as string);
    expect(durations.length).toBeGreaterThan(0);
    for (const duration of durations) {
      expect(duration.endsWith('s')).toBe(true);
      const value = Number.parseFloat(duration);
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0.35);
    }
  });
});

describe('template registry', () => {
  it('ships at least 20 templates across both tiers', () => {
    expect(ALL_TEMPLATES.length).toBeGreaterThanOrEqual(20);
    expect(FREE_TEMPLATES.length).toBeGreaterThanOrEqual(10);
    expect(PREMIUM_TEMPLATES.length).toBeGreaterThanOrEqual(8);
  });

  it('every template references animations that exist', () => {
    for (const template of ALL_TEMPLATES) {
      expect(template.animations.length).toBeGreaterThan(0);
      for (const animationId of template.animations) {
        expect(ANIMATION_MAP[animationId], `${template.id} -> ${animationId}`).toBeDefined();
      }
    }
  });

  it('premium templates only ship premium or free assets (no broken links)', () => {
    for (const template of ALL_TEMPLATES) {
      const files = template.buildFiles(resolveConfig(template.defaults), {
        mode: 'relative',
        owner: 'username',
        repo: 'username',
        branch: 'main',
        locale: 'id',
        includeGuide: true,
      });
      const readme = files.find((file) => file.path === 'README.md');
      expect(readme, template.id).toBeDefined();
      const svgFiles = files.filter((file) => file.kind === 'svg');
      expect(svgFiles.length, template.id).toBe(template.animations.length);

      for (const asset of svgFiles) {
        expect(readme?.content).toContain(`./assets/${asset.path.split('/').pop()}`);
        expect(asset.content.startsWith('<svg ')).toBe(true);
      }
      expect(readme?.content).not.toContain('undefined');
      expect(readme?.content).not.toContain('[object Object]');
      expect(files.some((file) => file.path === 'nexsolarix.config.json')).toBe(true);
      expect(files.some((file) => file.path === 'HOW-TO.md')).toBe(true);
    }
  });

  it('raw mode points at raw.githubusercontent.com', () => {
    const template = ALL_TEMPLATES[0]!;
    const files = template.buildFiles(resolveConfig(template.defaults), {
      mode: 'raw',
      owner: 'superrrkyy',
      repo: 'nexsolarix',
      branch: 'main',
      locale: 'en',
      includeGuide: false,
    });
    const readme = files.find((file) => file.path === 'README.md');
    expect(readme?.content).toContain('https://raw.githubusercontent.com/superrrkyy/nexsolarix/main/assets/');
    expect(files.some((file) => file.path === 'HOW-TO.md')).toBe(false);
  });

  it('every template name and blurb is bilingual', () => {
    for (const template of ALL_TEMPLATES) {
      expect(template.name.id.length).toBeGreaterThan(2);
      expect(template.name.en.length).toBeGreaterThan(2);
      expect(template.blurb.id.length).toBeGreaterThan(5);
      expect(template.blurb.en.length).toBeGreaterThan(5);
    }
  });
});
