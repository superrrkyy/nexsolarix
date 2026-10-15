// @vitest-environment jsdom
/**
 * Runtime smoke test.
 *
 * Unlike the SSR tests, this mounts the real <App/> in a DOM: effects run, the
 * router resolves, lazy pages load, providers read storage and generated SVGs
 * are inserted as data URIs. It is the closest thing to "open the site and
 * click around" that runs in CI without a browser.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

/**
 * Warm the module graph before the routes are mounted. `lazy()` resolves its
 * dynamic import through the test runner, which can take an unpredictable
 * number of ticks; importing the pages up front makes every lazy route resolve
 * on the next microtask and keeps these tests deterministic.
 */
import '../pages/GalleryPages';
import '../pages/TemplateDetailPage';
import '../pages/AnimationDetailPage';
import '../pages/PremiumPage';
import '../pages/GuidePage';
import '../pages/OwnerPage';
import '../pages/NotFoundPage';
import { I18nProvider } from '../i18n';
import { LibraryProvider, LicenseProvider, ThemeProvider, ToastProvider } from './providers';

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

let container: HTMLDivElement;
let root: Root;
let errors: string[];

/**
 * Mounts the app and flushes effects, lazy route chunks and the microtask
 * queue they resolve on (the SSR module runner needs a macrotask tick).
 */
async function mount(path: string, node: ReactElement = <App />) {
  await act(async () => {
    root.render(
      <ThemeProvider>
        <I18nProvider>
          <LicenseProvider>
            <LibraryProvider>
              <ToastProvider>
                <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
              </ToastProvider>
            </LibraryProvider>
          </LicenseProvider>
        </I18nProvider>
      </ThemeProvider>,
    );
  });
  for (let i = 0; i < 4; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  // jsdom does not implement scrolling; the shell uses it on navigation.
  window.scrollTo = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;

  errors = [];
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    errors.push(args.map(String).join(' '));
  });

  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

/** Clicks a tab in the detail pages and flushes the resulting render. */
async function clickTab(pattern: RegExp) {
  const tab = [...container.querySelectorAll('button')].find((button) => pattern.test(button.textContent ?? ''));
  expect(tab).toBeDefined();
  await act(async () => tab!.click());
}

const ROUTES = ['/', '/templates', '/animations', '/premium', '/guide', '/owner'];

describe('the app runs in a DOM', () => {
  it.each(ROUTES)('mounts %s without console errors', async (route) => {
    await mount(route);

    expect(errors).toEqual([]);
    expect(container.textContent ?? '').not.toContain('undefined');
    expect(container.innerHTML.length).toBeGreaterThan(1500);
  });

  it('renders the home page with a headline, stats and template links', async () => {
    await mount('/');
    const text = container.textContent ?? '';
    expect(text).toContain('NexSolarix');
    expect(text).toContain('22');
    expect(text).toContain('37');
    expect(container.querySelectorAll('a[href^="/templates/"]').length).toBeGreaterThanOrEqual(6);
  });

  it('renders generated SVG previews as data URIs', async () => {
    await mount('/');
    const dataUris = [...container.querySelectorAll('img')].filter((image) =>
      (image.getAttribute('src') ?? '').startsWith('data:image/svg+xml'),
    );
    expect(dataUris.length).toBeGreaterThan(0);
  });

  it('filters the template gallery as the visitor searches', async () => {
    await mount('/templates');
    const search = container.querySelector<HTMLInputElement>('input[type="search"], input[type="text"]');
    expect(search).not.toBeNull();

    const before = container.querySelectorAll('a[href^="/templates/"]').length;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(search, 'aurora');
      search!.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const after = container.querySelectorAll('a[href^="/templates/"]').length;
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
    expect(container.textContent ?? '').toContain('Aurora');
  });

  it('opens a template and previews the README inside a GitHub frame', async () => {
    await mount('/templates/aurora-profile');
    expect(container.textContent ?? '').toContain('Aurora Profile');

    // Preview tab: the README is rendered as markdown inside the GitHub frame,
    // with every `./assets/*.svg` link rewritten to a data URI so it animates.
    const html = container.innerHTML;
    expect(html).toContain('class="md"');
    expect(html).toContain('class="gh-frame');
    expect(html).not.toContain('src="./assets/aurora-banner.svg"');
    expect(html).toContain('data:image/svg+xml');

    // README tab: the copy payload is markdown text, not the rendered document.
    await clickTab(/readme/i);
    expect(container.innerHTML).toContain('code-view');
    expect(container.innerHTML).toContain('./assets/aurora-banner.svg');
    expect(container.textContent ?? '').toMatch(/copy readme/i);
  });

  it('locks a premium template for a visitor without a key', async () => {
    await mount('/templates/holo-profile');
    expect(container.innerHTML).toContain('lock__overlay');
    // Copy and download are disabled behind the gate.
    expect(container.innerHTML).toContain('is-locked');

    // The README tab only reveals a short teaser.
    await clickTab(/readme/i);
    const code = container.querySelector('.code-view__code')?.textContent ?? '';
    expect(code.length).toBeGreaterThan(200);
    expect(code.length).toBeLessThan(1200);
  });

  it('unlocks premium content with a valid key from storage', async () => {
    const { mintKey } = await import('../lib/license');
    window.localStorage.setItem('nexsolarix.license', JSON.stringify({ key: mintKey('nexsolarix-demo-secret-2026', 'studio') }));
    await mount('/templates/holo-profile');
    expect(container.innerHTML).not.toContain('lock__overlay');
    expect(container.innerHTML).not.toContain('is-locked');

    // The full README is now rendered, not just the 900-character teaser.
    await clickTab(/readme/i);
    const code = container.querySelector('.code-view__code')?.textContent ?? '';
    const { getTemplate } = await import('../templates');
    const { templateReadme } = await import('../lib/exporter');
    const full = templateReadme(getTemplate('holo-profile')!, null);
    expect(full.length).toBeGreaterThan(900);
    // A line from past the teaser window proves the whole file is rendered.
    const beyondTeaser = full.slice(900).split('\n').find((line) => line.trim().length > 20);
    expect(beyondTeaser).toBeDefined();
    expect(code).toContain((beyondTeaser as string).trim().slice(0, 24));
  });

  it('keeps premium locked when the stored key was signed elsewhere', async () => {
    const { mintKey } = await import('../lib/license');
    window.localStorage.setItem('nexsolarix.license', JSON.stringify({ key: mintKey('someone-elses-secret', 'studio') }));
    await mount('/templates/holo-profile');
    expect(container.innerHTML).toContain('lock__overlay');
  });

  it('switches theme from the shell', async () => {
    await mount('/');
    const start = document.documentElement.dataset.theme;
    const button = [...container.querySelectorAll('button')].find((element) =>
      /mode|theme|terang|gelap|dark|light/i.test(element.getAttribute('aria-label') ?? ''),
    );
    expect(button).toBeDefined();
    await act(async () => button!.click());
    expect(document.documentElement.dataset.theme).not.toBe(start);
  });

  it('switches language from the shell', async () => {
    await mount('/');
    const button = [...container.querySelectorAll('button')].find((element) => /bahasa|language/i.test(element.getAttribute('aria-label') ?? ''));
    expect(button).toBeDefined();
    const before = container.textContent ?? '';
    await act(async () => button!.click());
    expect(container.textContent ?? '').not.toBe(before);
    expect(window.localStorage.getItem('nexsolarix.locale')).toMatch(/id|en/);
  });

  it('navigates between routes by clicking the shell navigation', async () => {
    await mount('/');
    const link = container.querySelector<HTMLAnchorElement>('a[href="/templates"]');
    expect(link).not.toBeNull();
    await act(async () => {
      link!.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    });
    expect(container.textContent ?? '').toContain('Template');
  });

  it('opens the command palette with the keyboard shortcut', async () => {
    await mount('/');
    await act(async () => {
      document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
    });
    const palette = container.querySelector('[role="dialog"], .palette');
    expect(palette).not.toBeNull();
    expect(container.textContent ?? '').toMatch(/cari|search/i);
  });
});

describe('routing edge cases', () => {
  it('shows the 404 page for an unknown path', async () => {
    await mount('/definitely-not-a-page');
    expect(container.textContent ?? '').toContain('404');
  });

  it('shows a not-found state for an unknown template id', async () => {
    await mount('/templates/not-a-template');
    expect(container.textContent ?? '').toMatch(/tidak ditemukan|not found/i);
    expect(container.querySelector('.empty')).not.toBeNull();
  });

  it('shows a not-found state for an unknown animation id', async () => {
    await mount('/animations/not-an-animation');
    expect(container.textContent ?? '').toMatch(/tidak ditemukan|not found/i);
  });

  it('renders the owner key generator', async () => {
    await mount('/owner');
    expect(container.textContent ?? '').toContain('VITE_LICENSE_SECRET');
  });
});
