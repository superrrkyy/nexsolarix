import { ArrowDown, ArrowRight, ArrowUpRight, Compass, Orbit, Radio, Telescope } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { OBJECTS, PLANETS } from '@nexsolarix/astronomy';
import { UniverseCanvas } from '../components/UniverseCanvas';
import { ObjectCard } from '../components/ObjectCard';
import { useExplorerStore } from '../stores/useExplorerStore';

const collections = [
  { icon: Orbit, number: '01', title: 'Worlds in motion', text: 'Trace the architecture of our planetary neighborhood with an orbital model you can move through.', to: '/solar-system', action: 'Enter the Solar System', accent: 'mint' },
  { icon: Telescope, number: '02', title: 'A closer look', text: 'Meet the planets and moons with compact, source-linked profiles built for curious minds.', to: '/planets', action: 'Browse planets', accent: 'blue' },
  { icon: Radio, number: '03', title: 'Missions & instruments', text: 'Follow the spacecraft and observatories that turn distant light into scientific evidence.', to: '/missions', action: 'Explore missions', accent: 'gold' }
];

const featuredIds = ['earth', 'mars', 'jupiter', 'saturn'];

export function HomePage() {
  const selectedId = useExplorerStore((state) => state.selectedObjectId);
  const selected = OBJECTS.find((object) => object.id === selectedId) ?? OBJECTS[0];

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" />A DIGITAL OBSERVATORY <span className="eyebrow-index">01 / 04</span></div>
          <h1>Explore the universe,<br /><em>one world at a time.</em></h1>
          <p className="hero-description">An interactive astronomical atlas for traveling through our Solar System, meeting the worlds within it, and following the science that reveals them.</p>
          <div className="hero-actions">
            <Link to="/explore" className="button button-primary button-large">Enter the observatory <ArrowUpRight size={17} /></Link>
            <Link to="/solar-system" className="button button-quiet button-large">Solar System <ArrowRight size={16} /></Link>
          </div>
          <div className="hero-proof-row">
            <div className="hero-proof-icon"><Compass size={15} /></div>
            <span>Rooted in public scientific references</span>
            <span className="proof-divider" />
            <span>Made to explore, not just observe</span>
          </div>
        </div>

        <div className="hero-visual" role="group" aria-label="Interactive schematic preview of the Solar System">
          <div className="hero-visual-label"><span><i /> LIVE ORBITAL MODEL</span><span>SCHEMATIC SCALE</span></div>
          <UniverseCanvas className="hero-canvas" focusOnSelect={false} showNote={false} />
          <div className="hero-caption-card">
            <div className="hero-caption-sphere" style={{ '--object-color': selected.color } as CSSProperties}><span /></div>
            <div><span>SELECTED WORLD</span><strong>{selected.name}</strong></div>
            <Link to={`/objects/${selected.id}`} aria-label={`Open ${selected.name} profile`}><ArrowUpRight size={16} /></Link>
          </div>
          <div className="hero-visual-coordinate"><span>01</span> / SOL SYSTEM · LOCAL MODEL</div>
        </div>

        <a href="#atlas" className="scroll-cue"><span>SCROLL TO EXPLORE</span><ArrowDown size={15} /></a>
        <span className="hero-index">01 — 08</span>
      </section>

      <section className="atlas-intro section-shell" id="atlas">
        <div className="section-kicker"><span>01</span> THE NEXSOLARIX ATLAS</div>
        <div className="atlas-intro-row">
          <h2>Make the vast<br />feel <em>navigable.</em></h2>
          <p>Space is more than a collection of distant points. Follow the relationships between stars, planets, moons, missions, and the measurements that connect them.</p>
        </div>
        <div className="orbit-rule" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section className="explore-collections section-shell">
        <div className="section-heading-row">
          <div><div className="section-kicker"><span>02</span> CHOOSE A DESTINATION</div><h2>Start your <em>journey.</em></h2></div>
          <Link className="text-link" to="/discover">Browse the atlas <ArrowUpRight size={15} /></Link>
        </div>
        <div className="collection-grid">
          {collections.map((item) => {
            const Icon = item.icon;
            return (
              <Link to={item.to} className={`collection-card collection-card--${item.accent}`} key={item.number}>
                <div className="collection-card-top"><span>{item.number} / DESTINATION</span><span className="collection-icon"><Icon size={19} /></span></div>
                <div className="collection-card-body"><h3>{item.title}</h3><p>{item.text}</p></div>
                <div className="collection-card-action">{item.action}<ArrowUpRight size={16} /></div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="solar-feature section-shell">
        <div className="solar-feature-copy">
          <div className="section-kicker"><span>03</span> OUR COSMIC NEIGHBORHOOD</div>
          <h2>Eight planets.<br /><em>One remarkable star.</em></h2>
          <p>Set the clock in motion. Select a world, read its measured properties, then follow the sources behind each value.</p>
          <div className="solar-feature-actions"><Link className="button button-primary" to="/solar-system">Explore the Solar System <ArrowUpRight size={16} /></Link><span><span className="tiny-orbit" /> 8 planets · 10 curated moons</span></div>
        </div>
        <nav className="planet-marquee" aria-label="Solar System planet links">
          {PLANETS.map((planet, index) => (
            <Link className={`planet-marquee-item planet-marquee-item--${planet.id}`} to={`/objects/${planet.id}`} key={planet.id}>
              <span className="planet-marquee-number">0{index + 1}</span>
              <span className="planet-marquee-body" style={{ '--object-color': planet.color } as CSSProperties}><i /></span>
              <span className="planet-marquee-name">{planet.name}</span>
              <ArrowUpRight size={14} className="planet-marquee-arrow" />
            </Link>
          ))}
        </nav>
      </section>

      <section className="featured-worlds section-shell">
        <div className="section-heading-row">
          <div><div className="section-kicker"><span>04</span> FIELD NOTES</div><h2>Worlds worth <em>knowing.</em></h2></div>
          <Link className="text-link" to="/planets">All planets <ArrowUpRight size={15} /></Link>
        </div>
        <div className="featured-world-grid">
          {OBJECTS.filter((object) => featuredIds.includes(object.id)).map((object) => <ObjectCard key={object.id} object={object} compact />)}
        </div>
      </section>

      <section className="science-banner section-shell">
        <div className="science-banner-mark"><span /><span /><span /></div>
        <div><div className="section-kicker"><span>05</span> SCIENCE, WITH CONTEXT</div><h2>Every number has<br /><em>a place to come from.</em></h2><p>See what is measured, what is estimated, and where the data comes from. When the science is uncertain, the atlas says so.</p></div>
        <Link className="button button-secondary" to="/sources">How we cite data <ArrowUpRight size={15} /></Link>
      </section>

      <section className="final-cta section-shell">
        <span className="final-cta-orbit" aria-hidden="true" />
        <div className="section-kicker"><span>06</span> THE UNIVERSE IS WAITING</div>
        <h2>Take the <em>long way out.</em></h2>
        <p>Start with the star we call home. See where curiosity takes you next.</p>
        <Link to="/explore" className="button button-primary button-large">Begin exploring <ArrowUpRight size={17} /></Link>
      </section>

      <footer className="site-footer">
        <div className="footer-main"><div><Link to="/" className="footer-brand">NEXSOLARIX<span>SCIENTIFIC EXPLORATION, OPEN TO EVERYONE.</span></Link></div><div className="footer-links"><Link to="/about">About</Link><Link to="/sources">Sources</Link><Link to="/missions">Missions</Link><Link to="/discover">Discover</Link></div><span className="footer-coordinate">INDEPENDENT · EDUCATIONAL · NOT A NASA PRODUCT</span></div>
        <div className="footer-bottom"><span>© 2026 NexSolarix. An independent exploration platform.</span><span>DATA SNAPSHOT · 15 OCT 2026</span></div>
      </footer>
    </main>
  );
}
