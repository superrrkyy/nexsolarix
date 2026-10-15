import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { ArrowUpRight, Search, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { MISSIONS, OBJECTS } from '@nexsolarix/astronomy';
import { Seo } from '../components/Seo';
import { fetchSearch } from '../services/catalogService';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') ?? '';
  const [query, setQuery] = useState(initial);
  useEffect(() => setQuery(initial), [initial]);
  const [apiObjects, setApiObjects] = useState<typeof OBJECTS | null>(null);
  const trimmed = query.trim().toLocaleLowerCase();
  useEffect(() => {
    if (trimmed.length < 2) { setApiObjects(null); return; }
    const controller = new AbortController();
    void fetchSearch(trimmed, controller.signal).then((result) => setApiObjects(result.data.data)).catch(() => undefined);
    return () => controller.abort();
  }, [trimmed]);
  const objectResults = useMemo(() => apiObjects ?? (trimmed ? OBJECTS.filter((object) => `${object.name} ${object.designation ?? ''} ${object.kind} ${object.tags.join(' ')}`.toLocaleLowerCase().includes(trimmed)) : OBJECTS), [apiObjects, trimmed]);
  const missionResults = useMemo(() => trimmed ? MISSIONS.filter((mission) => `${mission.name} ${mission.agency} ${mission.destination}`.toLocaleLowerCase().includes(trimmed)) : [], [trimmed]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setParams(query.trim() ? { q: query.trim() } : {});
  };

  return (
    <main className="search-page page-shell">
      <Seo title="NexSolarix — Search the atlas" description="Search the NexSolarix curated astronomical object and mission catalog." path="/search" />
      <div className="page-kicker"><span />CATALOG INDEX · OBJECT SEARCH</div>
      <h1>Find your <em>next world.</em></h1>
      <form className="search-page-form" onSubmit={submit}><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Earth, Europa, Voyager…" aria-label="Search the NexSolarix catalog" /><button type="submit">Search <ArrowUpRight size={15} /></button></form>
      <div className="search-page-summary"><span><span className="data-status"><i /> LOCAL CATALOG</span></span><span>{objectResults.length + missionResults.length} RESULTS</span></div>
      {objectResults.length === 0 && missionResults.length === 0 ? <div className="catalog-empty"><div className="catalog-empty-icon"><Search size={21} /></div><h2>No results in this snapshot.</h2><p>Try another name, designation, or mission. The catalog does not query external services live.</p><Link to="/sources" className="text-link">Read about the data <ArrowUpRight size={13} /></Link></div> : (
        <div className="search-results-list">
          {objectResults.map((object) => <Link to={`/objects/${object.id}`} className="search-page-result" key={object.id}><span className={`search-result-orb orb-${object.id}`} style={{ '--object-color': object.color } as CSSProperties}><i /></span><span className="search-page-result-copy"><small>{object.typeLabel}</small><strong>{object.name}</strong><span>{object.description}</span></span><span className="search-page-result-detail">{object.designation ?? object.system}</span><ArrowUpRight size={16} /></Link>)}
          {missionResults.map((mission) => <Link to={`/missions/${mission.id}`} className="search-page-result" key={mission.id}><span className="search-result-orb orb-mission"><Sparkles size={15} /></span><span className="search-page-result-copy"><small>SPACE MISSION · {mission.agency}</small><strong>{mission.name}</strong><span>{mission.description}</span></span><span className="search-page-result-detail">{mission.destination}</span><ArrowUpRight size={16} /></Link>)}
        </div>
      )}
    </main>
  );
}
