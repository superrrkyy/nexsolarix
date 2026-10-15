import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { I18nProvider } from './i18n';
import { LibraryProvider, LicenseProvider, ThemeProvider, ToastProvider } from './app/providers';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';

/**
 * Static hosts (GitHub Pages) hand unknown deep links to `404.html`, which
 * bounces back to the shell with the original path in `?p=`. Restore it here
 * before the router mounts so the URL the visitor typed is the URL they see.
 */
function restoreDeepLink(): void {
  const params = new URLSearchParams(window.location.search);
  const stored = params.get('p');
  if (!stored) return;

  params.delete('p');
  const extra = params.toString();
  const base = import.meta.env.BASE_URL;
  const target = `${base}${stored.replace(/^\/+/, '')}`;

  window.history.replaceState(null, '', extra ? `${target}?${extra}` : target);
}

restoreDeepLink();

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <LicenseProvider>
          <LibraryProvider>
            <ToastProvider>
              <BrowserRouter basename={basename}>
                <App />
              </BrowserRouter>
            </ToastProvider>
          </LibraryProvider>
        </LicenseProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);

// Offline shell. Registered only in production so the dev server never caches modules.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* offline support is a bonus, never a requirement */
    });
  });
}
