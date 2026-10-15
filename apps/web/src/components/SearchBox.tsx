import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search, Sparkles } from 'lucide-react';
import { MISSIONS, OBJECTS, type CelestialObject, type MissionRecord } from '@nexsolarix/astronomy';

interface SearchEntry {
  id: string;
  name: string;
  kind: string;
  description: string;
  to: string;
  object?: CelestialObject;
  mission?: MissionRecord;
}

function makeEntries(query: string): SearchEntry[] {
  const needle = query.trim().toLocaleLowerCase();
  if (needle.length < 2) return [];
  const objects = OBJECTS.filter((object) => `${object.name} ${object.designation ?? ''} ${object.kind} ${object.tags.join(' ')}`.toLocaleLowerCase().includes(needle))
    .map((object) => ({ id: object.id, name: object.name, kind: object.typeLabel, description: object.description, to: `/objects/${object.id}`, object }));
  const missions = MISSIONS.filter((mission) => `${mission.name} ${mission.agency} ${mission.destination}`.toLocaleLowerCase().includes(needle))
    .map((mission) => ({ id: mission.id, name: mission.name, kind: 'Space mission', description: mission.destination, to: `/missions/${mission.id}`, mission }));
  return [...objects, ...missions].slice(0, 7);
}

export function SearchBox({ className = '' }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const id = useId();
  const listboxId = `${id}-results`;
  const isPopoverOpen = open && query.trim().length > 0;
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const results = useMemo(() => makeEntries(query), [query]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onShortcut);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onShortcut);
    };
  }, []);

  useEffect(() => setActiveIndex(-1), [query]);

  const select = (to: string) => {
    navigate(to);
    setQuery('');
    setOpen(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;
    if (activeIndex >= 0 && results[activeIndex]) select(results[activeIndex].to);
    else navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={`search-wrap ${className}`} ref={wrapperRef}>
      <form className="search-box" role="search" onSubmit={submit}>
        <Search size={16} strokeWidth={1.8} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Search worlds, missions…"
          aria-label="Search astronomical objects and missions"
          aria-autocomplete="list"
          aria-expanded={isPopoverOpen}
          aria-controls={isPopoverOpen ? listboxId : undefined}
          aria-activedescendant={activeIndex >= 0 && activeIndex < results.length ? `${id}-option-${activeIndex}` : undefined}
          onFocus={() => setOpen(true)}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <kbd className="search-shortcut" aria-hidden="true">⌘ K</kbd>
      </form>
      {isPopoverOpen && (
        <div className="search-popover">
          {results.length > 0 && <p className="search-popover-label">Suggested destinations</p>}
          <div id={listboxId} role="listbox" aria-label="Search suggestions">
            {results.map((result, index) => (
              <button
                className={`search-result${index === activeIndex ? ' is-active' : ''}`}
                id={`${id}-option-${index}`}
                key={`${result.kind}-${result.id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(result.to)}
              >
                <span className={`search-result-orb ${result.object ? `orb-${result.object.id}` : 'orb-mission'}`}>
                  {result.mission ? <Sparkles size={15} /> : null}
                </span>
                <span className="search-result-copy">
                  <strong>{result.name}</strong>
                  <small>{result.kind} <span>·</span> {result.description}</small>
                </span>
                <ArrowUpRight size={15} className="search-result-arrow" aria-hidden="true" />
              </button>
            ))}
          </div>
          {results.length === 0 && (
            <div className="search-empty" role="status">
              <span>No local catalog matches yet.</span>
              <small>Try a planet, moon, or mission name.</small>
            </div>
          )}
          <button className="search-all" type="button" onClick={() => select(`/search?q=${encodeURIComponent(query.trim())}`)}>
            View all results <ArrowUpRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
