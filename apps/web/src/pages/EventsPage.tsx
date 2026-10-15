import { ArrowUpRight, CalendarDays, CircleHelp, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSource } from '@nexsolarix/astronomy';
import { Seo } from '../components/Seo';

export function EventsPage() {
  const source = getSource('nasa-skywatching');
  return (
    <main className="events-page page-shell">
      <Seo title="NexSolarix — Astronomical events" description="A responsible guide to astronomical events. The local catalog shows only events with verified source data." path="/events" />
      <div className="page-kicker"><span />OBSERVING DESK · CELESTIAL EVENTS</div>
      <div className="events-heading-row"><div><h1>Look up.<br /><em>Keep looking.</em></h1><p>From eclipses to conjunctions, every event deserves a date, a visibility region, and a source you can verify.</p></div><div className="event-date-mark"><CalendarDays size={20} /><span>EVENTS<br />CATALOG</span></div></div>
      <section className="events-empty-state">
        <div className="event-empty-orbit"><div /><Radio size={21} /></div>
        <div className="event-empty-copy"><span className="section-kicker"><span>LIVE FEED</span> NOT CONNECTED</span><h2>No verified event dates<br /><em>in this snapshot.</em></h2><p>NexSolarix does not currently ingest a live astronomical event calendar. Rather than show dates that may be stale or unverified, this view stays intentionally empty. Use the official observing resources below for current dates and visibility details.</p>
          <div className="event-source-citation"><span className="event-source-icon"><CircleHelp size={15} /></span><div><strong>{source?.organization}</strong><small>{source?.title}</small></div><a href={source?.url} target="_blank" rel="noreferrer" aria-label="Open NASA skywatching resources"><ArrowUpRight size={16} /></a></div>
          {source && <div className="event-source-meta"><span>REFERENCE SOURCE</span><a href={source.url} target="_blank" rel="noreferrer">{source.url.replace('https://', '')}</a></div>}
        </div>
      </section>
      <div className="events-page-footer"><span><span className="data-status"><i /> EVENT RECORDS · 0</span></span><Link to="/sources">How we use sources <ArrowUpRight size={13} /></Link></div>
    </main>
  );
}
