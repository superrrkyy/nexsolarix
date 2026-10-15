import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useHotkey, useRevealOnScroll, useScrollProgress } from '../hooks';
import { useLicense, useTheme } from '../app/providers';
import { SITE, instagramUrl } from '../core/site';
import { CommandPalette } from './CommandPalette';
import { ToastStack } from './Ui';
import {
  IconClose,
  IconGlobe,
  IconInstagram,
  IconKey,
  IconMenu,
  IconMoon,
  IconSearch,
  IconSparkles,
  IconSun,
} from './icons';

const NAV = [
  { to: '/templates', key: 'nav.templates' },
  { to: '/animations', key: 'nav.animations' },
  { to: '/premium', key: 'nav.premium' },
  { to: '/guide', key: 'nav.guide' },
];

export function AppShell() {
  const { t, locale, toggleLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { isPremium, tier } = useLicense();
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useScrollProgress();
  useRevealOnScroll(location.pathname);

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  useHotkey({ key: 'k', meta: true, allowInInputs: true }, openPalette);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand">
            <span className="brand__mark" aria-hidden="true">
              <IconSparkles size={18} />
            </span>
            <span className="brand__text">
              <strong>{SITE.brand}</strong>
              <span>{t('brand.tagline')}</span>
            </span>
          </Link>

          <nav className="nav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={openPalette} aria-label={t('nav.command')}>
              <IconSearch size={15} />
              <span className="tiny" style={{ opacity: 0.7 }}>
                ⌘K
              </span>
            </button>

            <button
              type="button"
              className="btn btn--icon btn--ghost"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}
            >
              {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>

            <button type="button" className="btn btn--icon btn--ghost" onClick={toggleLocale} aria-label={t('nav.language')}>
              <IconGlobe size={16} />
              <span className="tiny" style={{ marginLeft: -2, fontWeight: 700 }}>
                {locale.toUpperCase()}
              </span>
            </button>

            {isPremium ? (
              <Link to="/premium" className="pill pill--premium" style={{ textDecoration: 'none' }}>
                <IconKey size={13} />
                {t('premium.active', { tier: tier === 'studio' ? 'Studio' : 'Pro' })}
              </Link>
            ) : (
              <Link to="/premium" className="btn btn--primary btn--sm">
                {t('nav.premium')}
              </Link>
            )}

            <button type="button" className="btn btn--icon btn--ghost menu-btn" onClick={() => setDrawerOpen(true)} aria-label={t('nav.menu')}>
              <IconMenu size={18} />
            </button>
          </div>
        </div>
        <div className="scroll-progress" aria-hidden="true" />
      </header>

      <main id="main" style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <div style={{ maxWidth: 420 }}>
            <div className="brand" style={{ marginBottom: 10 }}>
              <span className="brand__mark" aria-hidden="true">
                <IconSparkles size={16} />
              </span>
              <span className="brand__text">
                <strong>{SITE.brand}</strong>
                <span>v{SITE.version}</span>
              </span>
            </div>
            <p className="small" style={{ margin: 0 }}>
              {t('footer.rights')} {t('footer.legal')}
            </p>
          </div>

          <div className="footer__links">
            <a href={instagramUrl()} target="_blank" rel="noreferrer noopener">
              <IconInstagram size={15} style={{ verticalAlign: '-3px', marginRight: 6 }} />
              {t('footer.instagram')} @{SITE.instagram}
            </a>
            <Link to="/guide">{t('nav.guide')}</Link>
            <Link to="/premium">{t('nav.premium')}</Link>
            <a href={SITE.repository} target="_blank" rel="noreferrer noopener">
              {t('footer.source')}
            </a>
          </div>
        </div>
      </footer>

      <CommandPalette open={paletteOpen} onClose={closePalette} />
      <ToastStack />

      {drawerOpen ? (
        <div className="drawer" onClick={() => setDrawerOpen(false)} role="presentation">
          <div className="drawer__panel" onClick={(event) => event.stopPropagation()}>
            <div className="spread">
              <strong>{t('nav.menu')}</strong>
              <button type="button" className="btn btn--icon btn--ghost" onClick={() => setDrawerOpen(false)} aria-label={t('common.close')}>
                <IconClose size={18} />
              </button>
            </div>
            <Link to="/" className={`drawer__link ${location.pathname === '/' ? 'is-active' : ''}`}>
              Home
            </Link>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `drawer__link ${isActive ? 'is-active' : ''}`}
              >
                {t(item.key)}
              </NavLink>
            ))}
            <div className="divider" />
            <button type="button" className="btn btn--ghost btn--block" onClick={openPalette}>
              <IconSearch size={15} />
              {t('nav.command')}
            </button>
            <a className="btn btn--ghost btn--block" href={instagramUrl()} target="_blank" rel="noreferrer noopener">
              <IconInstagram size={15} />
              @{SITE.instagram}
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
