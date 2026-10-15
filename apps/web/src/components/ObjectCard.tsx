import { ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { CelestialObject } from '@nexsolarix/astronomy';
import { ConfidenceBadge } from './DataAttribution';

function quickFact(object: CelestialObject) {
  return object.facts.find((item) => item.key === 'semi-major-axis')
    ?? object.facts.find((item) => item.key === 'orbital-period')
    ?? object.facts.find((item) => item.key === 'mean-radius');
}

export function ObjectCard({ object, compact = false }: { object: CelestialObject; compact?: boolean }) {
  const fact = quickFact(object);
  return (
    <Link className={`object-card${compact ? ' object-card--compact' : ''}`} to={`/objects/${object.id}`}>
      <div className="object-card-head">
        <div className={`object-glyph object-glyph--${object.id}`} style={{ '--object-color': object.color } as CSSProperties} aria-hidden="true">
          <span />
        </div>
        <span className="object-card-kind">{object.typeLabel}</span>
        <ArrowUpRight size={17} className="object-card-arrow" aria-hidden="true" />
      </div>
      <div className="object-card-copy">
        <h3>{object.name}</h3>
        <p>{object.description}</p>
      </div>
      <div className="object-card-meta">
        {fact ? <><span>{fact.label}</span><strong>{fact.value}<small>{fact.unit}</small></strong></> : <ConfidenceBadge confidence="unknown" />}
      </div>
    </Link>
  );
}
