import {
  Component,
  Suspense,
  lazy,
  useEffect,
  type ComponentType,
  type ErrorInfo,
  type LazyExoticComponent,
  type ReactNode,
} from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { SITE } from './core/site';
import { useI18n } from './i18n';

const TemplatesPage = lazy(() => import('./pages/GalleryPages').then((module) => ({ default: module.TemplatesPage })));
const AnimationsPage = lazy(() => import('./pages/GalleryPages').then((module) => ({ default: module.AnimationsPage })));
const TemplateDetailPage = lazy(() => import('./pages/TemplateDetailPage').then((module) => ({ default: module.TemplateDetailPage })));
const AnimationDetailPage = lazy(() => import('./pages/AnimationDetailPage').then((module) => ({ default: module.AnimationDetailPage })));
const PremiumPage = lazy(() => import('./pages/PremiumPage').then((module) => ({ default: module.PremiumPage })));
const GuidePage = lazy(() => import('./pages/GuidePage').then((module) => ({ default: module.GuidePage })));
const OwnerPage = lazy(() => import('./pages/OwnerPage').then((module) => ({ default: module.OwnerPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

const TITLES: Record<string, { id: string; en: string }> = {
  '/': { id: 'NexSolarix — Template README & Animasi SVG Premium', en: 'NexSolarix — Premium README Templates & SVG Animations' },
  '/templates': { id: 'Template README — NexSolarix', en: 'README Templates — NexSolarix' },
  '/animations': { id: 'Animasi SVG — NexSolarix', en: 'SVG Animations — NexSolarix' },
  '/premium': { id: 'Paket Premium — NexSolarix', en: 'Premium Packs — NexSolarix' },
  '/guide': { id: 'Panduan pemakaian — NexSolarix', en: 'Usage guide — NexSolarix' },
  '/owner': { id: 'Generator kode — NexSolarix', en: 'Key generator — NexSolarix' },
};

/**
 * A crashed page must never leave the visitor staring at a skeleton, so every
 * route sits inside this boundary: the shell stays usable and the failure is
 * shown instead of swallowed.
 */
interface BoundaryState {
  message: string | null;
}

class RouteBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { message: null };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    return { message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[NexSolarix] route failed to render', error, info.componentStack);
  }

  render() {
    if (this.state.message === null) return this.props.children;
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 620 }}>
          <span className="eyebrow">Error</span>
          <h1>Something broke on this page</h1>
          <p>The rest of the site still works — pick another page from the navigation, or reload to try again.</p>
          <pre className="code__pre" style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.message}
          </pre>
          <button type="button" className="btn btn--primary" onClick={() => this.setState({ message: null })}>
            Try again
          </button>
        </div>
      </div>
    );
  }
}

function PageFallback() {
  return (
    <div className="page">
      <div className="container stack">
        <div className="skeleton" style={{ height: 46, width: '38%' }} />
        <div className="skeleton" style={{ height: 22, width: '62%' }} />
        <div className="skeleton" style={{ height: 320 }} />
      </div>
    </div>
  );
}

/** Route element for a code-split page: loading skeleton + crash boundary. */
function page(Component: LazyExoticComponent<ComponentType>) {
  return (
    <RouteBoundary>
      <Suspense fallback={<PageFallback />}>
        <Component />
      </Suspense>
    </RouteBoundary>
  );
}

function MetaManager() {
  const location = useLocation();
  const { locale } = useI18n();

  useEffect(() => {
    const base = TITLES[location.pathname];
    const title = base ? base[locale] : `${SITE.brand} — ${locale === 'id' ? 'Studio README' : 'README Studio'}`;
    document.title = title;

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', locale === 'id' ? SITE.description.id : SITE.description.en);
    }
  }, [location.pathname, locale]);

  return null;
}

export default function App() {
  return (
    <>
      <MetaManager />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/templates" element={page(TemplatesPage)} />
          <Route path="/templates/:id" element={page(TemplateDetailPage)} />
          <Route path="/animations" element={page(AnimationsPage)} />
          <Route path="/animations/:id" element={page(AnimationDetailPage)} />
          <Route path="/premium" element={page(PremiumPage)} />
          <Route path="/guide" element={page(GuidePage)} />
          <Route path="/owner" element={page(OwnerPage)} />
          <Route path="*" element={page(NotFoundPage)} />
        </Route>
      </Routes>
    </>
  );
}
