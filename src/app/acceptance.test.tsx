/**
 * Acceptance tests for the two rules the whole product is built around:
 *
 *  1. "Copy" returns README.md text only — never inline SVG markup.
 *  2. "Download ZIP" returns the README *and* the editable SVG files next to it.
 *
 * Plus the premium gate: locked without a key, open with a valid one.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ALL_TEMPLATES, PREMIUM_TEMPLATES, FREE_TEMPLATES } from '../templates';
import { createZip, listZipEntries } from '../lib/zip';
import { templateFiles, templateReadme, templateSvg, slugify } from '../lib/exporter';
import { LICENSE_ALPHABET, mintKey, validateKey, usingDemoSecret } from '../lib/license';
import { I18nProvider } from '../i18n';
import { LibraryProvider, LicenseProvider, ThemeProvider, ToastProvider } from './providers';
import { TemplateDetailPage } from '../pages/TemplateDetailPage';
import { AnimationDetailPage } from '../pages/AnimationDetailPage';

/* ------------------------------------------------------------------ *
 * 1. Copy produces README.md text
 * ------------------------------------------------------------------ */

describe('copy payload is README.md text only', () => {
  it.each(ALL_TEMPLATES.map((template) => template.id))('%s copies markdown, not SVG', (id) => {
    const template = ALL_TEMPLATES.find((item) => item.id === id)!;
    const readme = templateReadme(template, null, { mode: 'relative' });

    expect(readme.length).toBeGreaterThan(300);
    // Markdown document, not an image document: no inline SVG, no SMIL.
    expect(readme.trimStart().startsWith('<svg')).toBe(false);
    expect(readme).not.toContain('<svg');
    expect(readme).not.toContain('<animate');
    expect(readme).not.toContain('xmlns=');
    expect(readme).toMatch(/^#{1,3} /m);
    // Animations are referenced as files, which is what makes GitHub animate them.
    expect(readme).toContain('./assets/');
    expect(readme).toMatch(/<img[^>]+src="\.\/assets\/[^"]+\.svg"/);
  });

  it('keeps the raw mode usable for cross-repo hosting', () => {
    const template = ALL_TEMPLATES[0]!;
    const readme = templateReadme(template, { paletteId: 'cyber-cyan' }, {
      mode: 'raw',
      owner: 'octocat',
      repo: 'profile',
      branch: 'gh-pages',
    });
    expect(readme).toContain('https://raw.githubusercontent.com/octocat/profile/gh-pages/assets/');
    expect(readme).not.toContain('./assets/');
  });
});

/* ------------------------------------------------------------------ *
 * 2. ZIP carries README.md + editable animation files
 * ------------------------------------------------------------------ */

describe('ZIP download contains the README and every animation file', () => {
  it.each(ALL_TEMPLATES.map((template) => template.id))('%s zips a complete, self-consistent bundle', async (id) => {
    const template = ALL_TEMPLATES.find((item) => item.id === id)!;
    const files = templateFiles(template, null, { mode: 'relative', includeGuide: true, locale: 'id' });
    const bytes = await createZip(files.map((file) => ({ path: file.path, content: file.content })), { compress: true });
    const entries = listZipEntries(bytes);

    // Every file survives the round trip, and nothing extra is invented.
    expect(entries.map((entry) => entry.path)).toEqual(files.map((file) => file.path));
    expect(entries.every((entry) => entry.size > 0)).toBe(true);

    // README.md is present and is the copyable text.
    const readme = files.find((file) => file.path === 'README.md');
    expect(readme?.kind).toBe('markdown');
    expect(readme?.content).toBe(templateReadme(template, null));

    // One SVG per animation, each a standalone editable document.
    const svgFiles = files.filter((file) => file.kind === 'svg');
    expect(svgFiles.length).toBe(template.animations.length);
    for (const animationId of template.animations) {
      const asset = svgFiles.find((file) => file.path === `assets/${animationId}.svg`);
      expect(asset, `${id} -> ${animationId}`).toBeDefined();
      expect(asset?.content.startsWith('<svg ')).toBe(true);
      expect(asset?.content.endsWith('</svg>')).toBe(true);
      // The README links exactly this file.
      expect(readme?.content).toContain(`./assets/${animationId}.svg`);
      // And the preview the visitor saw is the file they get.
      expect(asset?.content).toBe(templateSvg(template, null, animationId));
    }

    // Config + how-to so the bundle is self-explanatory after unzipping.
    expect(files.map((file) => file.path)).toContain('nexsolarix.config.json');
    expect(files.map((file) => file.path)).toContain('HOW-TO.md');
    const config = JSON.parse(files.find((file) => file.path === 'nexsolarix.config.json')!.content) as Record<string, unknown>;
    expect(config.template).toBe(template.id);
    expect(config.animations).toEqual(template.animations);
  });

  it('packages premium bundles identically (same builder, same rules)', async () => {
    expect(PREMIUM_TEMPLATES.length).toBeGreaterThan(0);
    for (const template of PREMIUM_TEMPLATES) {
      const files = templateFiles(template, null);
      const bytes = await createZip(files.map((file) => ({ path: file.path, content: file.content })));
      expect(listZipEntries(bytes).length, template.id).toBe(files.length);
    }
    // Free templates are the same shape, just unlicensed.
    for (const template of FREE_TEMPLATES) {
      expect(templateFiles(template, null).length).toBeGreaterThan(3);
    }
  });

  /**
   * Sizes are the one control a visitor expects to feel: pushing height must
   * scale the whole template, not silently do nothing because the animation
   * ships its own default.
   */
  it('keeps every asset proportional when the visitor changes the size', () => {
    const template = ALL_TEMPLATES.find((item) => item.id === 'aurora-profile')!;
    const assetsOf = (config: Record<string, number> | null) => {
      const files = templateFiles(template, config).filter((file) => file.kind === 'svg');
      const byId = Object.fromEntries(files.map((file) => [file.path.replace(/^assets\//, '').replace(/\.svg$/, ''), file.content]));
      const heightOf = (id: string) => Number(/height="(\d+)"/.exec(byId[id] ?? '')?.[1] ?? 0);
      const widthOf = (id: string) => Number(/width="(\d+)"/.exec(byId[id] ?? '')?.[1] ?? 0);
      return { byId, heightOf, widthOf };
    };

    const base = assetsOf(null);
    const small = assetsOf({ height: 140, width: 600 });
    const large = assetsOf({ height: 520, width: 1200 });

    // Designed rhythm out of the box: divider < banner < card.
    expect(base.heightOf('wave-divider')).toBeLessThan(base.heightOf('aurora-banner'));
    expect(base.heightOf('profile-card')).toBeGreaterThan(base.heightOf('aurora-banner'));

    // Shrinking scales every asset down, growing scales every asset up.
    for (const id of ['aurora-banner', 'profile-card', 'wave-divider']) {
      expect(small.heightOf(id), id).toBeLessThan(base.heightOf(id));
      expect(large.heightOf(id), id).toBeGreaterThan(base.heightOf(id));
    }
    // The rhythm is preserved at both extremes.
    expect(small.heightOf('wave-divider')).toBeLessThan(small.heightOf('aurora-banner'));
    expect(small.heightOf('profile-card')).toBeGreaterThan(small.heightOf('aurora-banner'));
    expect(large.heightOf('wave-divider')).toBeLessThan(large.heightOf('aurora-banner'));
    expect(large.heightOf('profile-card')).toBeGreaterThan(large.heightOf('aurora-banner'));

    // Widths follow the slider as well, and never exceed it.
    expect(large.widthOf('aurora-banner')).toBeGreaterThan(base.widthOf('aurora-banner'));
    expect(small.widthOf('aurora-banner')).toBeLessThanOrEqual(600);
  });

  it('honours the visitor configuration inside the bundle', async () => {
    const template = ALL_TEMPLATES[0]!;
    const custom = { paletteId: 'solar-amber', title: 'Budi Santoso', speed: 2, width: 880, height: 240 };
    const files = templateFiles(template, custom, { includeGuide: false });
    const readme = files.find((file) => file.path === 'README.md')!;
    expect(readme.content).toContain('Budi Santoso');
    const svg = files.find((file) => file.kind === 'svg')!;
    expect(svg.content).toContain('width="880"');
    expect(svg.content).toContain('height="240"');
    expect(files.some((file) => file.path === 'HOW-TO.md')).toBe(false);
    expect(slugify('Aurora Profile ★ Pro')).toBe('aurora-profile-pro');
  });
});

/* ------------------------------------------------------------------ *
 * 3. Premium gate
 * ------------------------------------------------------------------ */

describe('premium gate', () => {
  it('mints keys that validate, and rejects keys from another secret', () => {
    const pro = mintKey('owner-secret-2026', 'pro');
    const studio = mintKey('owner-secret-2026', 'studio');

    expect(pro).toMatch(/^NXS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(validateKey(pro, 'owner-secret-2026')?.tier).toBe('pro');
    expect(validateKey(studio, 'owner-secret-2026')?.tier).toBe('studio');

    // A key minted for a private deploy must not open the public demo build.
    expect(validateKey(pro)).toBeNull();
    // Typed by hand from a chat: lowercase, spaces and a missing dash all work.
    expect(validateKey(pro.toLowerCase().replace(/-/g, ' '), 'owner-secret-2026')?.key).toBe(pro);
    // Characters outside the alphabet are refused instead of silently accepted.
    expect(validateKey('NXS-IIII-OOOO-1111', 'owner-secret-2026')).toBeNull();
    for (const character of 'AB23') expect(LICENSE_ALPHABET).toContain(character);

    expect(usingDemoSecret()).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 4. The gate as the visitor experiences it
 * ------------------------------------------------------------------ */

/** Minimal localStorage so the provider can be exercised without a DOM. */
function withStorage(entries: Record<string, string>): void {
  const store = new Map(Object.entries(entries));
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
    matchMedia: () => ({ matches: false }),
    navigator: { language: 'id-ID' },
  };
}

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window;
});

function renderAt(element: ReactElement, path: string, routePath: string): string {
  return renderToString(
    <ThemeProvider>
      <I18nProvider>
        <LicenseProvider>
          <LibraryProvider>
            <ToastProvider>
              <MemoryRouter initialEntries={[path]}>
                <Routes>
                  <Route path={routePath} element={element} />
                </Routes>
              </MemoryRouter>
            </ToastProvider>
          </LibraryProvider>
        </LicenseProvider>
      </I18nProvider>
    </ThemeProvider>,
  );
}

describe('premium gate as rendered', () => {
  const premiumTemplate = PREMIUM_TEMPLATES[0]!;
  const premiumAnimation = 'holo-card';

  it('hides premium files and shows the lock when no key is stored', () => {
    withStorage({});
    const html = renderAt(<TemplateDetailPage />, `/templates/${premiumTemplate.id}`, '/templates/:id');
    expect(html).toContain('lock__overlay');
    // The downloadable SVG must not be reachable through the markup.
    expect(html).not.toContain(premiumTemplate.animations[0]! + '.svg" download');

    const animation = renderAt(<AnimationDetailPage />, `/animations/${premiumAnimation}`, '/animations/:id');
    expect(animation).toContain('lock__overlay');
  });

  it('unlocks premium content when a valid key is stored', () => {
    withStorage({
      'nexsolarix.license': JSON.stringify({ key: mintKey('nexsolarix-demo-secret-2026', 'studio'), tier: 'studio' }),
    });
    const html = renderAt(<TemplateDetailPage />, `/templates/${premiumTemplate.id}`, '/templates/:id');
    expect(html).not.toContain('lock__overlay');
    expect(html).toContain('README.md');
    expect(html).toContain(premiumTemplate.animations[0]! + '.svg');

    const animation = renderAt(<AnimationDetailPage />, `/animations/${premiumAnimation}`, '/animations/:id');
    expect(animation).not.toContain('lock__overlay');
  });

  it('ignores a stored key that this build did not sign', () => {
    withStorage({ 'nexsolarix.license': JSON.stringify({ key: mintKey('someone-elses-secret', 'studio') }) });
    const html = renderAt(<TemplateDetailPage />, `/templates/${premiumTemplate.id}`, '/templates/:id');
    expect(html).toContain('lock__overlay');
  });

  it('leaves free templates open to everyone', () => {
    withStorage({});
    const html = renderAt(<TemplateDetailPage />, `/templates/${FREE_TEMPLATES[0]!.id}`, '/templates/:id');
    expect(html).not.toContain('lock__overlay');
  });
});
