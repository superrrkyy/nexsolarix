import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import { I18nProvider } from '../i18n';
import { LibraryProvider, LicenseProvider, ThemeProvider, ToastProvider } from './providers';
import { HomePage } from '../pages/HomePage';
import { AnimationsPage, TemplatesPage } from '../pages/GalleryPages';
import { TemplateDetailPage } from '../pages/TemplateDetailPage';
import { AnimationDetailPage } from '../pages/AnimationDetailPage';
import { PremiumPage } from '../pages/PremiumPage';
import { GuidePage } from '../pages/GuidePage';
import { OwnerPage } from '../pages/OwnerPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { renderMarkdown } from '../lib/markdown';
import { ALL_TEMPLATES } from '../templates';
import { resolveConfig } from '../core/palettes';
import { renderAnimation } from '../animations';

function render(node: ReactElement, path = '/'): string {
  return renderToString(
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
}

/** Renders a page through a real route so `useParams()` resolves. */
function renderRoute(element: ReactElement, path: string, routePath: string): string {
  return render(
    <Routes>
      <Route path={routePath} element={element} />
    </Routes>,
    path,
  );
}

describe('page smoke tests', () => {
  it('renders the home page with hero content', () => {
    const html = render(<HomePage />);
    expect(html).toContain('NexSolarix');
    expect(html).toContain('hero__grid');
    expect(html).toContain('data:image/svg+xml');
  });

  it('renders the templates gallery with filter controls', () => {
    const html = render(<TemplatesPage />, '/templates');
    expect(html).toContain('toolbar');
    expect(html).toContain('Template');
    // one card per template
    expect(html.split('card--interactive').length - 1).toBeGreaterThanOrEqual(20);
  });

  it('renders the animations gallery', () => {
    const html = render(<AnimationsPage />, '/animations');
    expect(html.split('card--interactive').length - 1).toBeGreaterThanOrEqual(30);
  });

  it('renders a template detail page with preview and customiser', () => {
    const html = renderRoute(<TemplateDetailPage />, '/templates/aurora-profile', '/templates/:id');
    expect(html).toContain('Kustomisasi');
    expect(html).toContain('Unduh ZIP lengkap');
    expect(html).toContain('gh-frame');
    expect(html).toContain('Aurora Profile');
  });

  it('locks a premium template for free visitors', () => {
    const html = renderRoute(<TemplateDetailPage />, '/templates/holo-profile', '/templates/:id');
    expect(html).toContain('lock__overlay');
    expect(html).toContain('Template premium');
  });

  it('renders an animation detail page', () => {
    const html = renderRoute(<AnimationDetailPage />, '/animations/aurora-banner', '/animations/:id');
    expect(html).toContain('Aurora Banner');
    expect(html).toContain('Unduh SVG');
  });

  it('renders the premium page with plans and the redeem form', () => {
    const html = render(<PremiumPage />, '/premium');
    expect(html).toContain('price-card');
    expect(html).toContain('NXS-XXXX-XXXX-XXXX');
    expect(html).toContain('superryinz');
    expect(html).toContain('premium.security.title'.length > 0 ? 'soft gate' : 'soft gate');
  });

  it('renders the guide and owner pages', () => {
    expect(render(<GuidePage />, '/guide')).toContain('guide-toc');
    const owner = render(<OwnerPage />, '/owner');
    expect(owner).toContain('owner');
    expect(owner).toContain('VITE_LICENSE_SECRET');
  });

  it('renders the 404 page', () => {
    expect(render(<NotFoundPage />, '/nope')).toContain('404');
  });

  it('never emits an unescaped script tag in rendered output', () => {
    const html = render(<HomePage />);
    expect(html.toLowerCase()).not.toContain('<script>window');
  });
});

describe('markdown renderer', () => {
  it('renders headings, tables, lists and whitelisted html', () => {
    const md = [
      '# Title',
      '',
      '<div align="center">',
      '',
      '![alt](./assets/a.svg)',
      '',
      '</div>',
      '',
      '| A | B |',
      '| --- | --- |',
      '| 1 | 2 |',
      '',
      '- [x] done',
      '- item with **bold** and `code`',
      '',
      '> quote',
      '',
      '```bash',
      'npm run dev',
      '```',
    ].join('\n');

    const html = renderMarkdown(md);
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('class="md-align-center"');
    expect(html).toContain('<img src="./assets/a.svg"');
    expect(html).toContain('<table class="md-table">');
    expect(html).toContain('md-check is-checked');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<code>code</code>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('md-pre');
  });

  it('escapes anything a visitor could type into a text field', () => {
    const md = '# <img src=x onerror=alert(1)> & <script>alert(2)</script>';
    const html = renderMarkdown(md);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img src=x');
  });

  it('renders every template README without leaking placeholders', () => {
    for (const template of ALL_TEMPLATES) {
      const files = template.buildFiles(resolveConfig(template.defaults), {
        mode: 'relative',
        owner: 'username',
        repo: 'username',
        branch: 'main',
        locale: 'id',
        includeGuide: true,
      });
      const readme = files.find((file) => file.path === 'README.md')?.content ?? '';
      const html = renderMarkdown(readme);
      expect(html, template.id).not.toContain('undefined');
      expect(html, template.id).not.toContain('[object Object]');
      expect(html.length, template.id).toBeGreaterThan(400);
    }
  });
});

describe('rendering pipeline', () => {
  it('renders animations into the markup used by the app', () => {
    const svg = renderAnimation('skill-bars', { paletteId: 'emerald-lab' });
    expect(svg).toContain('<svg');
    expect(svg).toContain('TypeScript');
    expect(svg).toContain('<animate');
  });
});
