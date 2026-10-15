import { useEffect, type CSSProperties } from 'react';
import { ArrowLeftRight, ArrowUpRight, Scale } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { OBJECTS, getObject } from '@nexsolarix/astronomy';
import { ConfidenceBadge } from '../components/DataAttribution';
import { Seo } from '../components/Seo';

const comparisonKeys = [
  'mean-radius', 'mass', 'surface-gravity', 'semi-major-axis', 'orbital-period', 'mean-temperature', 'effective-temperature', 'atmosphere', 'rings', 'life-status', 'ocean-evidence'
];

function parseForScale(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.replaceAll(',', '').match(/^~?−?([\d.]+)/);
  if (!match) return undefined;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : undefined;
}

function comparisonBar(value: string | undefined, max: number) {
  const amount = parseForScale(value);
  if (!amount || max <= 0) return '0%';
  return `${Math.max(4, Math.min(100, (amount / max) * 100))}%`;
}

export function ComparePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const firstId = getObject(params.get('a') ?? 'earth') ? (params.get('a') ?? 'earth') : 'earth';
  const secondId = getObject(params.get('b') ?? 'mars') ? (params.get('b') ?? 'mars') : 'mars';
  const first = getObject(firstId)!;
  const second = getObject(secondId)!;
  const keys = comparisonKeys.filter((key) => first.facts.some((fact) => fact.key === key) || second.facts.some((fact) => fact.key === key));

  useEffect(() => { document.title = `NexSolarix — Compare ${first.name} and ${second.name}`; }, [first.name, second.name]);

  const update = (slot: 'a' | 'b', id: string) => {
    const next = new URLSearchParams(params);
    next.set(slot, id);
    if (next.get('a') === next.get('b')) next.set(slot === 'a' ? 'b' : 'a', slot === 'a' ? second.id : first.id);
    navigate(`/compare?${next.toString()}`, { replace: true });
  };

  const firstRadius = parseForScale(first.facts.find((fact) => fact.key === 'mean-radius')?.value);
  const secondRadius = parseForScale(second.facts.find((fact) => fact.key === 'mean-radius')?.value);
  const maxRadius = Math.max(firstRadius ?? 0, secondRadius ?? 0);

  return (
    <main className="compare-page page-shell">
      <Seo title="NexSolarix — Compare worlds" description="Compare measured and estimated properties of Solar System worlds with source-linked scientific context." path="/compare" />
      <div className="page-kicker"><span />SIDE BY SIDE · OBJECT COMPARISON</div>
      <div className="compare-title-row"><div><h1>Worlds, <em>in perspective.</em></h1><p>Compare the values we have. Where a reference is missing, the comparison says so.</p></div><div className="compare-title-icon"><Scale size={21} /></div></div>

      <div className="compare-world-selectors">
        {[{ slot: 'a' as const, object: first, number: '01' }, { slot: 'b' as const, object: second, number: '02' }].map(({ slot, object, number }) => (
          <div className={`compare-world-card compare-world-card--${slot}`} key={slot}>
            <div className="compare-world-meta"><span>WORLD {number}</span><span>{object.kind.toUpperCase()}</span></div>
            <div className="compare-world-details">
              <div className={`compare-object-orb sphere-${object.id}`} style={{ '--object-color': object.color } as CSSProperties}><i /></div>
              <div><span>{object.typeLabel}</span><h2>{object.name}</h2><Link to={`/objects/${object.id}`}>Open profile <ArrowUpRight size={13} /></Link></div>
            </div>
            <label className="compare-select-label"><span className="sr-only">Choose world {number}</span><select value={object.id} onChange={(event) => update(slot, event.target.value)} aria-label={`Choose object ${number}`}>{OBJECTS.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.typeLabel}</option>)}</select></label>
          </div>
        ))}
      </div>

      <section className="compare-visual" aria-label="Relative size comparison">
        <div className="compare-visual-heading"><div><span className="section-kicker"><span>01</span> A SENSE OF SCALE</span><h2>Mean <em>radius.</em></h2></div><span>OBJECT SIZE SHOWN RELATIVELY</span></div>
        <div className="compare-scale-row">
          {[first, second].map((object, index) => {
            const value = object.facts.find((fact) => fact.key === 'mean-radius');
            const bar = comparisonBar(value?.value, maxRadius);
            return (
              <div className={`compare-scale-item compare-scale-item--${index}`} key={object.id}>
                <div className="compare-scale-label"><span>{object.name}</span><strong>{value ? `${value.value} ${value.unit ?? ''}` : 'Data unavailable'}</strong></div>
                <div className="compare-scale-track"><span className={`compare-scale-fill compare-scale-fill--${index}`} style={{ width: bar, background: object.color }} /></div>
              </div>
            );
          })}
        </div>
        <p className="compare-visual-note">The bars compare listed mean radii only. For gas and ice giants, the reference radius definition may differ from a solid surface.</p>
      </section>

      <section className="compare-table-section">
        <div className="compare-table-heading"><div><span className="section-kicker"><span>02</span> REFERENCE VALUES</span><h2>At a <em>glance.</em></h2></div><span>UNITS AND CONFIDENCE INCLUDED</span></div>
        <div className="compare-table" role="table" aria-label={`Scientific comparison of ${first.name} and ${second.name}`}>
          <div className="compare-table-head" role="row"><span role="columnheader">MEASUREMENT</span><span role="columnheader">{first.name}</span><span role="columnheader">{second.name}</span></div>
          {keys.map((key) => {
            const firstFact = first.facts.find((fact) => fact.key === key);
            const secondFact = second.facts.find((fact) => fact.key === key);
            const label = firstFact?.label ?? secondFact?.label ?? key;
            return (
              <div className="compare-table-row" role="row" key={key}>
                <strong role="rowheader">{label}</strong>
                {[{ fact: firstFact, object: first }, { fact: secondFact, object: second }].map(({ fact, object }) => (
                  <div className="compare-value-cell" role="cell" key={object.id}>
                    {fact ? <><span>{fact.value}<small>{fact.unit}</small></span><ConfidenceBadge confidence={fact.confidence} /></> : <span className="compare-unavailable">Data unavailable</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <p className="compare-source-note"><span className="compare-source-mark">i</span> Reference values are shown with their original source confidence. Different physical definitions can make some comparisons context-dependent.</p>
      </section>

      <div className="compare-footer-actions"><Link to="/planets"><ArrowLeftRight size={15} />Browse all worlds</Link><Link to="/sources">See data sources <ArrowUpRight size={14} /></Link></div>
    </main>
  );
}
