import { ArrowLeft, ArrowUpRight, CalendarDays, CircleHelp } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getSource } from '@nexsolarix/astronomy';
import { Seo } from '../components/Seo';

export function EventDetailPage() {
  const { id } = useParams();
  const source = getSource('nasa-skywatching');
  return (
    <main className="event-detail-page page-shell">
      <Seo title="NexSolarix — Event record unavailable" description="No verified local astronomical event record matches this identifier." path={`/events/${id ?? ''}`} />
      <div className="profile-breadcrumbs"><Link to="/events">Events</Link><span>/</span><span>{id ?? 'Unknown event'}</span></div>
      <section className="event-detail-empty">
        <div className="event-detail-icon"><CalendarDays size={21} /><span /></div>
        <span className="section-kicker"><span>EVENT RECORD</span> NOT IN LOCAL SNAPSHOT</span>
        <h1>No verified record<br /><em>for this event.</em></h1>
        <p>This release does not contain a verified event feed. Dates, visibility regions, and event descriptions are never guessed or carried forward silently.</p>
        {source && <a href={source.url} target="_blank" rel="noreferrer" className="event-source-citation event-detail-source"><span className="event-source-icon"><CircleHelp size={15} /></span><span><strong>{source.organization}</strong><small>{source.title}</small></span><ArrowUpRight size={15} /></a>}
        <Link to="/events" className="event-detail-back"><ArrowLeft size={14} /> Back to the events desk</Link>
      </section>
    </main>
  );
}
