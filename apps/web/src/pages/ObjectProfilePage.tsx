import { useEffect, type CSSProperties } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Compass, Orbit, Scale, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MISSIONS, SOURCES, getChildren, getObject, getSource, objectRelationshipPath, type CelestialObject } from '@nexsolarix/astronomy';
import { ConfidenceBadge, FactSource } from '../components/DataAttribution';
import { useCatalogObject } from '../hooks/useCatalogData';
import { Seo } from '../components/Seo';
import { useExplorerStore } from '../stores/useExplorerStore';

const relatedMissionIds: Record<string, string[]> = {
  sun: ['parker-solar-probe'],
  mars: ['perseverance'],
  jupiter: ['juno'],
  saturn: ['cassini'],
  neptune: ['voyager-2'],
  europa: ['europa-clipper']
};

function ObjectOrb({ object, large = false }: { object: CelestialObject; large?: boolean }) {
  return <div className={`profile-object-orb${large ? ' profile-object-orb--large' : ''} profile-object-orb--${object.id}`} style={{ '--object-color': object.color } as CSSProperties} aria-hidden="true"><span /><i /></div>;
}

export function ObjectProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { object } = useCatalogObject(id ?? '');
  const setSelectedObject = useExplorerStore((state) => state.selectObject);

  useEffect(() => {
    if (object) setSelectedObject(object.id);
  }, [object, setSelectedObject]);

  if (!object) {
    return (
      <main className="page-shell missing-page">
        <div className="missing-icon"><Compass size={28} /></div>
        <span className="section-kicker"><span>404</span> OBJECT NOT IN LOCAL CATALOG</span>
        <h1>That world is<br /><em>still out there.</em></h1>
        <p>This curated first-release catalog does not include that identifier. Search another object or return to the Solar System.</p>
        <div className="missing-actions"><Link className="button button-primary" to="/explore">Back to the atlas <ArrowUpRight size={16} /></Link><button className="button button-secondary" type="button" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Go back</button></div>
      </main>
    );
  }

  const path = objectRelationshipPath(object.id);
  const parent = object.parentId ? getObject(object.parentId) : undefined;
  const children = getChildren(object.id);
  const missionItems = (relatedMissionIds[object.id] ?? []).map((missionId) => MISSIONS.find((mission) => mission.id === missionId)).filter((mission) => mission !== undefined);
  const primaryFact = object.facts.find((fact) => fact.key === 'mean-radius') ?? object.facts[0];
  const source = primaryFact?.sourceIds[0] ? getSource(primaryFact.sourceIds[0]) : undefined;
  const habitabilityFact = object.facts.find((fact) => fact.key === 'life-status')
    ?? object.facts.find((fact) => fact.key === 'ocean-evidence');
  const habitabilitySourceId = habitabilityFact?.sourceIds[0];
  const habitabilitySource = habitabilitySourceId ? getSource(habitabilitySourceId) : undefined;
  const habitabilityStatus = object.lifeStatus ?? habitabilityFact?.value ?? 'Unknown';
  const quickKeys = ['mean-radius', 'mass', 'semi-major-axis', 'orbital-period'];
  const facts = quickKeys.map((key) => object.facts.find((fact) => fact.key === key)).filter((fact) => fact !== undefined);
  const profileDescription = `${object.name} — ${object.typeLabel}. ${object.description}`;

  return (
    <main className="profile-page">
      <Seo title={`NexSolarix — ${object.name}`} description={profileDescription} path={`/objects/${object.id}`} />
      <div className="profile-topbar">
        <nav className="profile-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/explore">Atlas</Link><span>/</span>
          {path.map((item, index) => <span className="breadcrumb-item" key={item.id}>{index > 0 && <span>/</span>}<Link to={`/objects/${item.id}`}>{item.name}</Link></span>)}
        </nav>
        <div className="profile-top-actions">
          <Link className="profile-scene-link" to="/solar-system" onClick={() => setSelectedObject(object.kind === 'moon' && parent ? parent.id : object.id)}><Orbit size={15} />{object.kind === 'moon' ? 'View parent world' : 'Open 3D scene'}</Link>
          <button className="profile-compare-button" type="button" onClick={() => navigate(`/compare?a=${object.id}&b=${object.id === 'earth' ? 'mars' : 'earth'}`)}><Scale size={15} /> Compare</button>
        </div>
      </div>

      <section className="profile-hero">
        <div className="profile-hero-copy">
          <div className="profile-type-line"><span className="type-dot" style={{ backgroundColor: object.color }} />{object.typeLabel.toUpperCase()}<span className="profile-type-divider">/</span>{object.designation ?? object.system.toUpperCase()}</div>
          <h1>{object.name}<span className="profile-title-period">.</span></h1>
          <p className="profile-lead">{object.description}</p>
          <div className="profile-path-visual">
            <div className="profile-path-label"><Sparkles size={13} />OBJECT RELATIONSHIPS</div>
            <div className="profile-path-links">
              {path.map((item, index) => (
                <span key={item.id} className="profile-path-step">
                  {index > 0 && <span className="profile-path-line" />}
                  <Link to={`/objects/${item.id}`} onClick={() => setSelectedObject(item.id)} className={item.id === object.id ? 'is-current' : ''}><span style={{ backgroundColor: item.color }} />{item.name}</Link>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="profile-hero-art">
          <div className="profile-art-orbit profile-art-orbit--one" /><div className="profile-art-orbit profile-art-orbit--two" />
          <div className="profile-art-grid" />
          <ObjectOrb object={object} large />
          <div className="profile-art-annotation"><span>OBJECT / {object.id.toUpperCase()}</span><span>REFERENCE MODEL</span></div>
          {parent && <div className="profile-art-parent"><span className="parent-line" /><span>ORBITING</span><Link to={`/objects/${parent.id}`} onClick={() => setSelectedObject(parent.id)}>{parent.name}<ArrowUpRight size={12} /></Link></div>}
        </div>
      </section>

      <section className="profile-metrics" aria-label="Quick scientific facts">
        {facts.map((fact, index) => (
          <div className="profile-metric" key={fact.key}>
            <span className="metric-index">0{index + 1}</span><span className="metric-label">{fact.label}</span>
            <strong>{fact.value}<small>{fact.unit}</small></strong>
            <ConfidenceBadge confidence={fact.confidence} />
          </div>
        ))}
        {facts.length < 4 && Array.from({ length: 4 - facts.length }).map((_, index) => (
          <div className="profile-metric profile-metric--empty" key={`unknown-${index}`}><span className="metric-index">—</span><span className="metric-label">Additional measurement</span><strong>Data unavailable</strong><ConfidenceBadge confidence="unknown" /></div>
        ))}
      </section>

      <div className="profile-content-grid">
        <div className="profile-main-column">
          <section className="profile-section">
            <div className="profile-section-heading"><div><span className="section-kicker"><span>01</span> REFERENCE DATA</span><h2>Numbers, with <em>context.</em></h2></div><span className="section-side-label">VALUES LINK TO THEIR SOURCE</span></div>
            <div className="facts-table">
              {object.facts.map((fact, index) => (
                <div className="fact-row" key={fact.key}>
                  <div className="fact-row-label"><span className="fact-row-index">{String(index + 1).padStart(2, '0')}</span><strong>{fact.label}</strong></div>
                  <div className="fact-row-data"><div className="fact-row-value">{fact.value}{fact.unit ? <small> {fact.unit}</small> : null}</div>{fact.note && <p>{fact.note}</p>}<FactSource fact={fact} /></div>
                </div>
              ))}
            </div>
            <div className="profile-data-footnote"><span className="data-footnote-mark">i</span><span>Values are a curated local snapshot. Definitions, uncertainty, and reference source may differ between published datasets. NexSolarix is not a live ephemeris.</span></div>
          </section>

          <section className="profile-section context-section">
            <div className="profile-section-heading"><div><span className="section-kicker"><span>02</span> SCIENTIFIC CONTEXT</span><h2>What we <em>know.</em></h2></div></div>
            <div className="context-card-grid">
              <article className="context-card context-card--habitability">
                <div className="context-card-icon"><Sparkles size={17} /></div><span className="context-card-label">HABITABILITY</span>
                <h3>{habitabilityStatus}</h3>
                <p>{object.kind === 'star' ? 'Habitability is not assessed for stars. Life-related labels apply to planetary environments, and no extraterrestrial life has been confirmed.' : habitabilityStatus === 'Confirmed life' ? 'Earth is the only world currently known to host life. No extraterrestrial life has been confirmed.' : habitabilityStatus.includes('Potentially') ? 'Potential habitability refers to conditions of scientific interest. It is not evidence that life exists or existed.' : habitabilityStatus.includes('Evidence') ? 'Past habitability is different from evidence for past life. No life has been confirmed on this world.' : 'No confirmed evidence of life is recorded for this world. Scientific knowledge may be incomplete.'}</p>
                {habitabilitySource && <a href={habitabilitySource.url} target="_blank" rel="noreferrer" className="text-link">Read source <ArrowUpRight size={13} /></a>}
              </article>
              <article className="context-card">
                <div className="context-card-icon"><Orbit size={17} /></div><span className="context-card-label">ORBITAL CONTEXT</span>
                <h3>{parent ? `In orbit around ${parent.name}` : 'Central star of our system'}</h3>
                <p>{object.orbitalElements ? 'Position is calculated from an approximate published orbital-elements model. The scene rescales size and distance so the full system remains visible.' : 'Explore how this object relates to its neighboring worlds and the larger Solar System.'}</p>
                <Link to="/solar-system" className="text-link" onClick={() => setSelectedObject(parent?.id ?? object.id)}>Open orbital model <ArrowUpRight size={13} /></Link>
              </article>
            </div>
          </section>

          {missionItems.length > 0 && (
            <section className="profile-section profile-missions-section">
              <div className="profile-section-heading"><div><span className="section-kicker"><span>03</span> MISSIONS & OBSERVATIONS</span><h2>How we <em>got here.</em></h2></div><Link to="/missions" className="text-link">All missions <ArrowUpRight size={14} /></Link></div>
              <div className="profile-mission-list">
                {missionItems.map((mission) => <Link to={`/missions/${mission.id}`} key={mission.id} className="profile-mission-card"><span className="mission-card-symbol"><Orbit size={17} /></span><div><span>{mission.agency} · LAUNCHED {new Date(`${mission.launched}T00:00:00Z`).getUTCFullYear()}</span><strong>{mission.name}</strong><small>{mission.destination}</small></div><ArrowUpRight size={16} /></Link>)}
              </div>
            </section>
          )}
        </div>

        <aside className="profile-aside">
          <section className="aside-card aside-source-card">
            <div className="aside-card-kicker"><span>DATA LINEAGE</span><span className="verified-mark"><Check size={11} /></span></div>
            <h3>Science, traced<br />back to source.</h3>
            <p>Each available value is tagged by confidence and linked to its reference. Unavailable values are left empty—not guessed.</p>
            <div className="aside-source-main"><span className="aside-source-dot" /><div><strong>{source?.organization ?? 'Source unavailable'}</strong><small>{source?.title ?? 'No source record attached'}</small></div></div>
            <Link className="aside-source-cta" to="/sources">Review source library <ArrowUpRight size={14} /></Link>
          </section>

          <section className="aside-card relationships-card">
            <div className="aside-card-kicker"><span>IN THIS NEIGHBORHOOD</span><span>{String(children.length + (parent ? 1 : 0)).padStart(2, '0')}</span></div>
            {parent && <Link className="relationship-object-link" to={`/objects/${parent.id}`} onClick={() => setSelectedObject(parent.id)}><span className="relationship-object-orb" style={{ background: parent.color }} /> <span><small>PARENT BODY</small><strong>{parent.name}</strong></span><ArrowUpRight size={15} /></Link>}
            {children.length > 0 ? children.map((child) => <Link className="relationship-object-link" to={`/objects/${child.id}`} onClick={() => setSelectedObject(child.id)} key={child.id}><span className="relationship-object-orb" style={{ background: child.color }} /> <span><small>{child.kind === 'planet' ? 'PLANET' : 'NATURAL SATELLITE'}</small><strong>{child.name}</strong></span><ArrowUpRight size={15} /></Link>) : !parent && <p className="relationship-empty">No parent relationship is listed for this object.</p>}
            {children.length === 0 && parent && <p className="relationship-empty">No child objects are included in this curated view.</p>}
          </section>

          <section className="aside-note-card"><div className="aside-note-orbit" /><span>HOW TO READ THIS PAGE</span><p>“Verified” means a published reference value. “Estimated” means derived or context-dependent. See each source for definitions and uncertainty.</p><Link to="/about">Our scientific method <ArrowUpRight size={13} /></Link></section>
        </aside>
      </div>
      <div className="profile-bottom-nav"><Link to="/planets"><ArrowLeft size={14} /> Back to catalog</Link><span>{SOURCES.length} source organizations and datasets in the local library</span></div>
    </main>
  );
}
