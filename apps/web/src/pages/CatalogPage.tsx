import { useMemo, useState } from 'react';
import { ArrowUpRight, Database, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ObjectKind } from '@nexsolarix/astronomy';
import { useCatalogObjects } from '../hooks/useCatalogData';
import { ObjectCard } from '../components/ObjectCard';
import { Seo } from '../components/Seo';

export function CatalogPage({
  title,
  eyebrow,
  description,
  kind,
  collection,
  emptyTitle,
  emptyDescription,
  path
}: {
  title: string;
  eyebrow: string;
  description: string;
  kind?: ObjectKind;
  collection?: string[];
  emptyTitle?: string;
  emptyDescription?: string;
  path?: string;
}) {
  const [query, setQuery] = useState('');
  const { objects, origin } = useCatalogObjects();
  const catalog = useMemo(() => objects.filter((object) => {
    if (collection && !collection.includes(object.id)) return false;
    if (!collection && kind && object.kind !== kind) return false;
    return true;
  }), [collection, kind, objects]);
  const filtered = useMemo(() => catalog.filter((object) => `${object.name} ${object.designation ?? ''} ${object.typeLabel} ${object.description}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [catalog, query]);

  return (
    <main className="catalog-page page-shell">
      <Seo title={`NexSolarix — ${title}`} description={description} path={path ?? `/${title.toLowerCase().replaceAll(' ', '-')}`} />
      <div className="page-kicker"><span />{eyebrow}</div>
      <div className="catalog-heading-row">
        <div><h1>{title}<span className="profile-title-period">.</span></h1><p>{description}</p></div>
        <label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Filter ${title.toLowerCase()}…`} aria-label={`Filter ${title.toLowerCase()} catalog`} /><kbd>⌕</kbd></label>
      </div>
      <div className="catalog-meta-bar"><span><span className="data-status"><i /> {origin === 'api-snapshot' ? 'API CURATED DATA' : 'LOCAL CURATED DATA'}</span></span><span>{filtered.length.toString().padStart(2, '0')} {filtered.length === 1 ? 'OBJECT' : 'OBJECTS'}{query && ` MATCHING “${query}”`}</span></div>
      {filtered.length > 0 ? (
        <div className="catalog-grid">{filtered.map((object) => <ObjectCard key={object.id} object={object} />)}</div>
      ) : query ? (
        <div className="catalog-empty"><div className="catalog-empty-icon"><Search size={22} /></div><h2>No matches in this catalog.</h2><p>Try a different name, designation, or type.</p><button className="button button-secondary" type="button" onClick={() => setQuery('')}>Clear search</button></div>
      ) : (
        <div className="catalog-empty catalog-empty--data">
          <div className="catalog-empty-orbit"><Database size={22} /></div>
          <span className="section-kicker"><span>CATALOG STATUS</span> DATA NOT AVAILABLE</span>
          <h2>{emptyTitle ?? `No ${title.toLowerCase()} records in this snapshot.`}</h2>
          <p>{emptyDescription ?? 'This first release contains a curated Solar System dataset. We do not fill catalog gaps with unverified or invented objects. Follow the source library as the catalog expands.'}</p>
          <div className="catalog-empty-actions"><Link className="button button-primary" to="/solar-system">Explore Solar System <ArrowUpRight size={15} /></Link><Link className="button button-secondary" to="/sources"><Sparkles size={15} />Review data sources</Link></div>
        </div>
      )}
      <div className="catalog-bottom-note"><span>DATA SNAPSHOT · 15 OCT 2026</span><Link to="/about">How NexSolarix handles scientific uncertainty <ArrowUpRight size={13} /></Link></div>
    </main>
  );
}
