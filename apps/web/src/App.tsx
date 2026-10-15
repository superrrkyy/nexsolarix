import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { TopNav } from './components/TopNav';
import { SiteFooter } from './components/SiteFooter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CatalogPage } from './pages/CatalogPage';
import { NotFoundPage } from './pages/NotFoundPage';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const ExplorerPage = lazy(() => import('./pages/ExplorerPage').then((module) => ({ default: module.ExplorerPage })));
const ObjectProfilePage = lazy(() => import('./pages/ObjectProfilePage').then((module) => ({ default: module.ObjectProfilePage })));
const ComparePage = lazy(() => import('./pages/ComparePage').then((module) => ({ default: module.ComparePage })));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage').then((module) => ({ default: module.DiscoverPage })));
const SourcesPage = lazy(() => import('./pages/SourcesPage').then((module) => ({ default: module.SourcesPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((module) => ({ default: module.SearchPage })));
const MissionsPage = lazy(() => import('./pages/MissionPages').then((module) => ({ default: module.MissionsPage })));
const MissionDetailPage = lazy(() => import('./pages/MissionPages').then((module) => ({ default: module.MissionDetailPage })));
const EventsPage = lazy(() => import('./pages/EventsPage').then((module) => ({ default: module.EventsPage })));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then((module) => ({ default: module.EventDetailPage })));

function LoadingScreen() {
  return <div className="app-loading" role="status"><span className="loading-orbit"><i /></span><span>Initializing observatory…</span></div>;
}

function RouteFrame() {
  const location = useLocation();
  const immersive = location.pathname === '/explore' || location.pathname === '/solar-system';
  const home = location.pathname === '/';

  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.hash, location.pathname]);

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <TopNav />
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <div id="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorerPage />} />
              <Route path="/solar-system" element={<ExplorerPage solarOnly />} />
              <Route path="/objects/:id" element={<ObjectProfilePage />} />
              <Route path="/planets" element={<CatalogPage title="Planets" eyebrow="THE SOLAR SYSTEM · EIGHT WORLDS" description="Eight planets, one star, and a neighborhood built to explore. Reference values are linked to their sources." kind="planet" path="/planets" />} />
              <Route path="/planets/:id" element={<ObjectProfilePage />} />
              <Route path="/stars" element={<CatalogPage title="Stars" eyebrow="STELLAR CATALOG · LOCAL REFERENCE" description="The first release includes our Sun as a reference star. The wider stellar catalog will only grow with sourced records." kind="star" path="/stars" emptyTitle="The local catalog has one reference star." emptyDescription="The Sun is documented as the central star of our Solar System. No additional stellar catalog entries are included in this snapshot." />} />
              <Route path="/stars/:id" element={<ObjectProfilePage />} />
              <Route path="/galaxies" element={<CatalogPage title="Galaxies" eyebrow="DEEP-SKY CATALOG · PHASE 3" description="A future deep-sky catalog will connect galaxy profiles to verified astronomical references." kind="galaxy" path="/galaxies" />} />
              <Route path="/galaxies/:id" element={<ObjectProfilePage />} />
              <Route path="/moons" element={<CatalogPage title="Moons" eyebrow="NATURAL SATELLITES · SOLAR SYSTEM" description="A curated first set of natural satellites, from Earth’s Moon to the ocean-bearing candidates around the giant planets." kind="moon" path="/moons" />} />
              <Route path="/moons/:id" element={<ObjectProfilePage />} />
              <Route path="/exoplanets" element={<CatalogPage title="Exoplanets" eyebrow="EXOPLANET CATALOG · PHASE 2" description="Search and compare exoplanet records once a verified catalog feed is connected. No candidates are fabricated in this release." kind="exoplanet" path="/exoplanets" />} />
              <Route path="/exoplanets/:id" element={<ObjectProfilePage />} />
              <Route path="/asteroids" element={<CatalogPage title="Asteroids" eyebrow="SMALL BODIES · CATALOG" description="A source-linked catalog of asteroid properties is planned. This first local snapshot does not yet include verified records." kind="asteroid" path="/asteroids" />} />
              <Route path="/comets" element={<CatalogPage title="Comets" eyebrow="SMALL BODIES · CATALOG" description="Comet profiles require dated orbital elements and observation references. No comet records are included in this snapshot." kind="comet" path="/comets" />} />
              <Route path="/small-bodies" element={<CatalogPage title="Small bodies" eyebrow="ASTEROIDS · COMETS · DWARF PLANETS" description="A future catalog will bring small-body orbital data into one searchable view. No unsourced records are shown." collection={[]} path="/small-bodies" />} />
              <Route path="/nebulae" element={<CatalogPage title="Nebulae" eyebrow="DEEP-SKY CATALOG · PHASE 3" description="Nebula records will be added when their catalog identifiers, measurements, and media provenance are ready." kind="nebula" path="/nebulae" />} />
              <Route path="/black-holes" element={<CatalogPage title="Black holes" eyebrow="DEEP-SKY CATALOG · PHASE 3" description="Measurements and candidate classifications deserve careful context. This snapshot does not yet include black-hole records." kind="black hole" path="/black-holes" />} />
              <Route path="/missions" element={<MissionsPage />} />
              <Route path="/missions/:id" element={<MissionDetailPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/sources" element={<SourcesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Suspense>
      </ErrorBoundary>
      {!home && !immersive && <SiteFooter />}
    </div>
  );
}

export function App() {
  return <BrowserRouter><RouteFrame /></BrowserRouter>;
}
