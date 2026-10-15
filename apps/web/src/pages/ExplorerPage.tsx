import { useMemo, type CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight, CircleHelp, Compass, Layers3, List, Moon, Orbit, RotateCcw, Sparkles, Telescope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OBJECTS, PLANETS } from '@nexsolarix/astronomy';
import { ObjectInfoPanel } from '../components/ObjectInfoPanel';
import { TimeControls } from '../components/TimeControls';
import { UniverseCanvas } from '../components/UniverseCanvas';
import { useExplorerStore } from '../stores/useExplorerStore';

const navigationItems = [
  { to: '/solar-system', label: 'Solar System', icon: Orbit, detail: '1 star · 8 planets' },
  { to: '/planets', label: 'Planets', icon: Sparkles, detail: 'Eight worlds' },
  { to: '/moons', label: 'Moons', icon: Moon, detail: 'Curated satellites' },
  { to: '/missions', label: 'Missions', icon: Telescope, detail: 'Spacecraft & observatories' }
];

function SceneCatalog() {
  const selectObject = useExplorerStore((state) => state.selectObject);
  const selectedId = useExplorerStore((state) => state.selectedObjectId);
  const list = useMemo(() => [OBJECTS.find((object) => object.id === 'sun')!, ...PLANETS], []);
  return (
    <section className="scene-catalog" aria-label="Solar System object list">
      <div className="scene-catalog-header"><span>LOCAL SOLAR SYSTEM</span><span>09 OBJECTS</span></div>
      <div className="scene-catalog-grid">
        {list.map((object, index) => (
          <button className={`scene-catalog-card${selectedId === object.id ? ' is-selected' : ''}`} type="button" key={object.id} onClick={() => selectObject(object.id)} aria-pressed={selectedId === object.id}>
            <span className={`scene-catalog-orb orb-${object.id}`} style={{ '--object-color': object.color } as CSSProperties}><i /></span>
            <span className="scene-catalog-number">{String(index + 1).padStart(2, '0')}</span>
            <strong>{object.name}</strong>
            <small>{object.typeLabel}</small>
            <ArrowUpRight size={14} />
          </button>
        ))}
      </div>
      <p className="scene-catalog-footnote"><CircleHelp size={14} />Planet size and orbital distances are rescaled for visibility. Each fact links to its scientific source.</p>
    </section>
  );
}

export function ExplorerPage({ solarOnly = false }: { solarOnly?: boolean }) {
  const accessibleMode = useExplorerStore((state) => state.accessibleMode);
  const simulationTime = useExplorerStore((state) => state.simulationTime);
  const orbitYear = new Date(simulationTime).getUTCFullYear();
  const outsideModelRange = orbitYear < 1800 || orbitYear > 2050;
  const toggleAccessibleMode = useExplorerStore((state) => state.toggleAccessibleMode);
  return (
    <main className={`explorer-workspace${solarOnly ? ' explorer-workspace--solar' : ''}`}>
      <div className="explorer-backdrop-grid" aria-hidden="true" />
      {!accessibleMode ? <UniverseCanvas className="explorer-canvas" showNote={false} /> : <div className="explorer-catalog-stage"><SceneCatalog /></div>}

      <div className="explorer-scene-title">
        <span className="scene-title-kicker"><i />{solarOnly ? 'SOLAR SYSTEM / LOCAL MODEL' : 'NEXSOLARIX / INTERACTIVE ATLAS'}</span>
        <h1>{solarOnly ? 'Our planetary system' : 'The nearby cosmos'}</h1>
        <p>{solarOnly ? 'Navigate the planets orbiting our star.' : 'Begin with the Sun, then follow the worlds in its gravitational neighborhood.'}</p>
      </div>

      <aside className="explorer-sidebar" aria-label="Explore sections">
        <div className="explorer-sidebar-heading"><span>OBSERVATORY</span><span>01 / 04</span></div>
        <div className="explorer-nav-label">DESTINATIONS</div>
        <nav className="explorer-links">
          {navigationItems.map(({ to, label, icon: Icon, detail }, index) => (
            <Link key={to} to={to} className={`explorer-link${(solarOnly ? to === '/solar-system' : index === 0) ? ' is-active' : ''}`}>
              <span className="explorer-link-icon"><Icon size={15} /></span>
              <span className="explorer-link-copy"><strong>{label}</strong><small>{detail}</small></span>
              {index === 0 && <span className="explorer-link-active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="explorer-sidebar-rule" />
        <button type="button" className={`view-mode-toggle${accessibleMode ? ' is-active' : ''}`} onClick={toggleAccessibleMode} aria-pressed={accessibleMode}>
          {accessibleMode ? <Compass size={15} /> : <List size={15} />}
          <span><strong>{accessibleMode ? '3D view' : 'Accessible data mode'}</strong><small>{accessibleMode ? 'Return to the model' : 'Explore without 3D'}</small></span>
          <ArrowUpRight size={13} />
        </button>
        <div className="explorer-sidebar-bottom"><span className="data-status"><i /> LOCAL SCIENCE SNAPSHOT</span><Link to="/sources">About the data <ArrowUpRight size={12} /></Link></div>
      </aside>

      <div className="explorer-top-tools">
        <button className="mobile-data-toggle" type="button" onClick={toggleAccessibleMode} aria-pressed={accessibleMode} aria-label={accessibleMode ? 'Switch to 3D view' : 'Accessible data mode'}>{accessibleMode ? <Compass size={14} /> : <List size={14} />}<span>{accessibleMode ? '3D' : 'Data'}</span></button>
        <button className="mobile-reset-view" type="button" onClick={() => useExplorerStore.getState().resetCamera()} aria-label="Reset camera view" title="Reset camera view"><RotateCcw size={14} /></button>
        <div className="explorer-scene-status"><span className="scene-status-icon"><Layers3 size={14} /></span><span><strong>Heliocentric view</strong><small>Positions approximate</small></span></div>
        <div className="explorer-tools-caption"><span>DRAG TO ORBIT</span><span className="caption-divider">·</span><span>SCROLL TO ZOOM</span></div>
      </div>

      <ObjectInfoPanel className="explorer-info-panel" />
      <div className="explorer-time-panel">
        <TimeControls showGraphics />
        <p className={`time-accuracy-note${outsideModelRange ? ' is-outside-range' : ''}`}><span />{outsideModelRange ? `Simulation year ${orbitYear} is outside the approximate model range (1800–2050); positions are extrapolated.` : 'JPL approximate mean elements · month speed = 30 days · display is not to scale.'}</p>
      </div>

      <div className="explorer-mobile-prompt"><ArrowDown size={13} /> Tap a world to inspect it</div>
      <nav className="explorer-mobile-nav" aria-label="Explorer quick links">
        <Link to="/explore" className="is-active"><Orbit size={17} /><span>Explore</span></Link>
        <Link to="/planets"><Sparkles size={17} /><span>Planets</span></Link>
        <Link to="/moons"><Moon size={17} /><span>Moons</span></Link>
        <Link to="/missions"><Telescope size={17} /><span>Missions</span></Link>
      </nav>
    </main>
  );
}
