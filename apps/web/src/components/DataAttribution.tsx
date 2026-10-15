import { useState } from 'react';
import { ArrowUpRight, ChevronDown, ExternalLink } from 'lucide-react';
import { getSource, type Confidence, type ScientificFact } from '@nexsolarix/astronomy';

const confidenceLabels: Record<Confidence, string> = {
  verified: 'Verified',
  estimated: 'Estimated',
  modeled: 'Modeled',
  candidate: 'Candidate',
  unknown: 'Unknown'
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return <span className={`confidence confidence--${confidence}`}><span className="confidence-dot" />{confidenceLabels[confidence]}</span>;
}

export function FactSource({ fact }: { fact: ScientificFact }) {
  const [expanded, setExpanded] = useState(false);
  const sources = fact.sourceIds.map(getSource).filter((source) => source !== undefined);

  return (
    <div className={`fact-source${expanded ? ' is-open' : ''}`}>
      <div className="fact-source-main">
        <span className="fact-source-value">{fact.value}{fact.unit ? <small> {fact.unit}</small> : null}</span>
        <ConfidenceBadge confidence={fact.confidence} />
        {fact.note && <p className="fact-source-note">{fact.note}</p>}
      </div>
      {sources.length > 0 && (
        <button className="source-toggle" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
          <span>Source{sources.length > 1 ? 's' : ''} <span className="source-count">{sources.length}</span></span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      )}
      {expanded && (
        <div className="fact-source-links">
          {sources.map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="source-link">
              <span>{source.organization}<small>{source.title}</small></span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ))}
          <p className="source-reviewed">Reference snapshot · {sources[0]?.lastReviewed ?? 'date unavailable'}</p>
        </div>
      )}
    </div>
  );
}

export function SourceLink({ sourceId }: { sourceId: string }) {
  const source = getSource(sourceId);
  if (!source) return null;
  return <a className="text-link" href={source.url} target="_blank" rel="noreferrer">{source.organization}<ArrowUpRight size={13} aria-hidden="true" /></a>;
}
