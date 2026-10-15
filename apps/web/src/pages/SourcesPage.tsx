import { ArrowUpRight, BadgeCheck, BookOpenCheck, Database, ExternalLink } from 'lucide-react';
import { DATA_SNAPSHOT_DATE } from '@nexsolarix/astronomy';
import { useSourceRecords } from '../hooks/useCatalogData';
import { Seo } from '../components/Seo';

const confidence = [
  { label: 'Verified', className: 'verified', description: 'A value or statement directly reported by the cited reference. The reference may still define a measurement differently from another source.' },
  { label: 'Estimated', className: 'estimated', description: 'A value inferred, rounded, or dependent on an adopted model or measurement context.' },
  { label: 'Modeled', className: 'modeled', description: 'A calculation produced by an explicitly described scientific model, such as the approximate orbital-position view.' },
  { label: 'Candidate', className: 'candidate', description: 'An object or interpretation under investigation; it is not presented as a confirmed finding.' },
  { label: 'Unknown', className: 'unknown', description: 'A value is not available in the local reference snapshot. NexSolarix leaves it unknown rather than filling the gap.' }
];

export function SourcesPage() {
  const { sources } = useSourceRecords();
  return (
    <main className="sources-page page-shell">
      <Seo title="NexSolarix — Sources & methodology" description="Explore the public scientific references behind NexSolarix data and learn how uncertainty and provenance are communicated." path="/sources" />
      <div className="page-kicker"><span />THE EVIDENCE LEDGER</div>
      <div className="sources-heading-row"><div><h1>Follow the <em>evidence.</em></h1><p>Good exploration starts with knowing where information comes from—and how certain it is.</p></div><div className="source-library-mark"><BookOpenCheck size={22} /></div></div>
      <div className="sources-snapshot-banner"><Database size={17} /><span><strong>Curated local snapshot</strong><small>Reviewed for this release · {new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${DATA_SNAPSHOT_DATE}T12:00:00Z`))} · Not a live scientific feed</small></span><span className="snapshot-status"><i /> STATIC DATA</span></div>

      <section className="source-library-section"><div className="section-heading-row"><div><div className="section-kicker"><span>01</span> REFERENCE LIBRARY</div><h2>Our source <em>catalog.</em></h2></div><span className="section-side-label">{sources.length.toString().padStart(2, '0')} PUBLIC REFERENCES</span></div>
        <div className="source-library-grid">
          {sources.map((source, index) => (
            <article className="source-library-card" key={source.id}>
              <div className="source-library-card-top"><span>REFERENCE / {String(index + 1).padStart(2, '0')}</span><span className="source-verified-icon"><BadgeCheck size={16} /></span></div>
              <span className="source-library-organization">{source.organization}</span>
              <h3>{source.title}</h3><p>{source.description}</p>
              <div className="source-usage"><span>USAGE & LIMITATIONS</span><small>{source.usage}</small></div>
              <div className="source-library-footer"><span>SNAPSHOT NOTE · {source.lastReviewed}</span><a href={source.url} target="_blank" rel="noreferrer">Visit source <ExternalLink size={13} /></a></div>
            </article>
          ))}
        </div>
      </section>

      <section className="confidence-section"><div className="section-heading-row"><div><div className="section-kicker"><span>02</span> CONFIDENCE LABELS</div><h2>How to read a <em>number.</em></h2></div><span className="section-side-label">UNCERTAINTY IS PART OF THE DATA</span></div>
        <div className="confidence-grid">{confidence.map((item) => <article className="confidence-definition" key={item.label}><span className={`confidence confidence--${item.className}`}><i className="confidence-dot" />{item.label}</span><p>{item.description}</p></article>)}</div>
      </section>

      <section className="source-method-note"><div className="source-method-symbol"><span /><span /><span /></div><div><span className="section-kicker"><span>03</span> SCIENTIFIC METHOD</span><h2>Data is not <em>decoration.</em></h2><p>NexSolarix separates the catalog from its interface. Each fact carries a label, unit, confidence category, and one or more references. Orbit motion uses NASA/JPL’s published approximate mean-element model and is intentionally labeled as non-precision. Visual sizes and distances are rescaled to make the system legible.</p><a className="text-link" href="https://ssd.jpl.nasa.gov/planets/approx_pos.html" target="_blank" rel="noreferrer">Read JPL model documentation <ArrowUpRight size={13} /></a></div></section>
    </main>
  );
}
