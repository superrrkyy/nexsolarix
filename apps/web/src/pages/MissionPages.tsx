import { ArrowLeft, ArrowUpRight, Orbit, Rocket, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getSource } from '@nexsolarix/astronomy';
import { useMissionRecords } from '../hooks/useCatalogData';
import { Seo } from '../components/Seo';

export function MissionsPage() {
  const { missions } = useMissionRecords();
  return (
    <main className="missions-page page-shell">
      <Seo title="NexSolarix — Space missions" description="Explore selected spacecraft and observatories that help reveal the Solar System and the wider universe." path="/missions" />
      <div className="page-kicker"><span />FIELD LOG · SPACE MISSIONS</div>
      <div className="missions-heading-row"><div><h1>Machines that <em>made us look.</em></h1><p>Selected missions and observatories from a curated local reference. Operational status can change; follow each agency source for updates.</p></div><div className="mission-heading-mark"><Orbit size={23} /></div></div>
      <div className="mission-filter-strip"><span><span className="data-status"><i /> SOURCE-LINKED RECORDS</span></span><span>{missions.length.toString().padStart(2, '0')} MISSION RECORDS · STATIC SNAPSHOT</span></div>
      <div className="mission-grid">
        {missions.map((mission, index) => (
          <Link className="mission-card" to={`/missions/${mission.id}`} key={mission.id}>
            <div className="mission-card-top"><span>MISSION / {String(index + 1).padStart(2, '0')}</span><span className="mission-card-icon"><Rocket size={15} /></span></div>
            <div className="mission-card-main"><span className="mission-agency">{mission.agency}</span><h2>{mission.name}</h2><p>{mission.description}</p></div>
            <div className="mission-card-meta"><span><small>LAUNCH</small><strong>{new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${mission.launched}T00:00:00Z`))}</strong></span><span><small>DESTINATION</small><strong>{mission.destination}</strong></span></div>
            <div className="mission-card-footer"><span>{mission.status}</span><ArrowUpRight size={15} /></div>
          </Link>
        ))}
      </div>
      <div className="mission-source-callout"><ShieldCheck size={19} /><p><strong>Mission status is time-sensitive.</strong> This static snapshot preserves a curated mission overview. Always consult the linked agency source for current operations.</p><Link to="/sources">Source library <ArrowUpRight size={14} /></Link></div>
    </main>
  );
}

export function MissionDetailPage() {
  const { id } = useParams();
  const { missions } = useMissionRecords();
  const mission = missions.find((item) => item.id === id);
  const source = getSource(mission?.sourceIds[0] ?? 'nasa-missions');
  if (!mission) return <main className="page-shell missing-page"><div className="missing-icon"><Rocket size={25} /></div><span className="section-kicker"><span>MISSION LOG</span> NOT FOUND</span><h1>Record not<br /><em>in this log.</em></h1><p>This mission is not part of the current curated reference set.</p><Link className="button button-primary" to="/missions">Return to missions <ArrowLeft size={15} /></Link></main>;

  return (
    <main className="mission-detail-page page-shell">
      <Seo title={`NexSolarix — ${mission.name}`} description={mission.description} path={`/missions/${mission.id}`} />
      <nav className="profile-breadcrumbs" aria-label="Breadcrumb"><Link to="/missions">Missions</Link><span>/</span><span>{mission.name}</span></nav>
      <section className="mission-detail-hero">
        <div className="mission-detail-symbol"><div className="mission-detail-orbit" /><Rocket size={27} /></div>
        <div className="mission-detail-copy"><div className="page-kicker"><span />MISSION RECORD · {mission.agency.toUpperCase()}</div><h1>{mission.name}<span className="profile-title-period">.</span></h1><p>{mission.description}</p><span className="mission-status-pill"><i />{mission.status}</span></div>
      </section>
      <div className="mission-detail-grid">
        <section className="mission-information-panel">
          <span className="section-kicker"><span>01</span> MISSION PARAMETERS</span>
          <div className="mission-detail-facts"><div><span>Launching agency</span><strong>{mission.agency}</strong></div><div><span>Launch date</span><strong>{new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${mission.launched}T00:00:00Z`))}</strong></div><div><span>Destination / program</span><strong>{mission.destination}</strong></div><div><span>Current status</span><strong>{mission.status}</strong></div></div>
          <p className="mission-status-caveat">Mission operations and status can change. This page is a static reference, not a real-time telemetry feed.</p>
        </section>
        <aside className="mission-source-panel"><span className="section-kicker"><span>02</span> SOURCE</span><div className="mission-source-seal"><ShieldCheck size={18} /></div><h2>Agency information,<br /><em>directly cited.</em></h2><p>{source?.description ?? 'Source description unavailable.'}</p>{source && <a className="mission-source-link" href={source.url} target="_blank" rel="noreferrer">Open NASA mission directory <ArrowUpRight size={14} /></a>}<Link className="mission-source-link" to="/sources">All NexSolarix sources <ArrowUpRight size={14} /></Link></aside>
      </div>
      <div className="mission-detail-back"><Link to="/missions"><ArrowLeft size={15} /> Back to all missions</Link></div>
    </main>
  );
}
