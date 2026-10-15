import { ArrowUpRight, Compass, Orbit, Sparkles, Telescope } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { MOONS, OBJECTS, PLANETS } from '@nexsolarix/astronomy';
import { ObjectCard } from '../components/ObjectCard';
import { Seo } from '../components/Seo';

function numericFact(objectId: string, key: string) {
  const value = OBJECTS.find((object) => object.id === objectId)?.facts.find((fact) => fact.key === key)?.value;
  return value ? Number(value.replaceAll(',', '').match(/[\d.]+/)?.[0] ?? 0) : 0;
}

export function DiscoverPage() {
  const largest = [...PLANETS].sort((a, b) => numericFact(b.id, 'mean-radius') - numericFact(a.id, 'mean-radius')).slice(0, 3);
  const oceanWorlds = MOONS.filter((moon) => moon.facts.some((fact) => fact.key === 'ocean-evidence' || (fact.key === 'life-status' && fact.value.includes('Potentially'))));
  const icyWorlds = oceanWorlds.slice(0, 5);
  const innerWorlds = PLANETS.filter((planet) => planet.tags.includes('inner planet'));
  const outerWorlds = PLANETS.filter((planet) => planet.tags.includes('outer planet'));

  return (
    <main className="discover-page page-shell">
      <Seo title="NexSolarix — Discover" description="Explore scientifically sourced collections from the local Solar System catalog, with transparent limits and source-linked facts." path="/discover" />
      <div className="page-kicker"><span />CURATED COLLECTIONS · LOCAL DATA</div>
      <div className="discover-heading-row"><div><h1>Follow your <em>curiosity.</em></h1><p>Small, source-linked collections built from the catalog we actually have—not from records we wish we had.</p></div><Compass size={23} /></div>

      <section className="discover-feature-row">
        <div className="discover-feature-card discover-feature-card--dark"><div className="discover-feature-top"><span>COLLECTION / 01</span><Orbit size={17} /></div><span className="discover-feature-eyebrow">A STAR & ITS WORLDS</span><h2>Meet the<br /><em>Solar System.</em></h2><p>From our central star to the eight planets in orbit around it.</p><Link to="/solar-system">Open the orbital model <ArrowUpRight size={14} /></Link><span className="discover-feature-orbit" /></div>
        <div className="discover-feature-card discover-feature-card--light"><div className="discover-feature-top"><span>COLLECTION / 02</span><Sparkles size={17} /></div><span className="discover-feature-eyebrow">OCEAN EVIDENCE</span><h2>Worlds under<br /><em>the ice.</em></h2><p>Moons with published evidence for or indications of subsurface oceans—an active area of research, not evidence of life.</p><div className="discover-mini-list">{icyWorlds.map((moon) => <Link to={`/objects/${moon.id}`} key={moon.id}><span style={{ background: moon.color }} />{moon.name}<ArrowUpRight size={13} /></Link>)}</div></div>
      </section>

      <section className="discover-list-section"><div className="section-heading-row"><div><div className="section-kicker"><span>03</span> OUR ROCKY NEIGHBORS</div><h2>Closer to the <em>Sun.</em></h2></div><Link className="text-link" to="/planets">Browse all <ArrowUpRight size={14} /></Link></div><div className="discover-mini-grid">{innerWorlds.map((object) => <ObjectCard object={object} key={object.id} compact />)}</div></section>
      <section className="discover-list-section"><div className="section-heading-row"><div><div className="section-kicker"><span>04</span> GIANTS & ICE GIANTS</div><h2>The <em>outer worlds.</em></h2></div><Link className="text-link" to="/planets">Browse all <ArrowUpRight size={14} /></Link></div><div className="discover-mini-grid">{outerWorlds.map((object) => <ObjectCard object={object} key={object.id} compact />)}</div></section>
      <section className="discover-list-section discover-list-section--small"><div className="section-heading-row"><div><div className="section-kicker"><span>05</span> SCALE & STRUCTURE</div><h2>The largest planets <em>by radius.</em></h2></div><span className="section-side-label">ORDERED BY CURATED MEAN-RADIUS VALUE</span></div><div className="discover-ranking-list">{largest.map((object, index) => <Link to={`/objects/${object.id}`} key={object.id}><span className="discover-ranking-index">0{index + 1}</span><span className="discover-ranking-object" style={{ '--object-color': object.color } as CSSProperties}><i /></span><span className="discover-ranking-name">{object.name}<small>{object.typeLabel}</small></span><span className="discover-ranking-value">{object.facts.find((fact) => fact.key === 'mean-radius')?.value} <small>km mean radius</small></span><ArrowUpRight size={16} /></Link>)}</div></section>

      <div className="discover-limit-note"><Telescope size={18} /><div><strong>A catalog should tell you what it doesn't know.</strong><p>This local release does not yet include verified star, galaxy, exoplanet, nebula, or black-hole records. Those pages stay transparent until sourced data is available.</p></div><Link to="/sources">See source library <ArrowUpRight size={13} /></Link></div>
    </main>
  );
}
