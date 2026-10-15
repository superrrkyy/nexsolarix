import { ArrowUpRight, GitBranch, Scale, Sparkles } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getChildren, getObject, objectRelationshipPath } from '@nexsolarix/astronomy';
import { useExplorerStore } from '../stores/useExplorerStore';
import { ConfidenceBadge, FactSource } from './DataAttribution';

function shortFact(objectId: string, key: string) {
  const object = getObject(objectId);
  return object?.facts.find((fact) => fact.key === key);
}

export function ObjectInfoPanel({ className = '' }: { className?: string }) {
  const selectedId = useExplorerStore((state) => state.selectedObjectId);
  const object = getObject(selectedId) ?? getObject('earth')!;
  const navigate = useNavigate();
  const path = objectRelationshipPath(object.id);
  const children = getChildren(object.id);
  const stats = [
    shortFact(object.id, 'mean-radius'),
    shortFact(object.id, 'mass'),
    shortFact(object.id, 'orbital-period') ?? shortFact(object.id, 'semi-major-axis')
  ].filter((fact) => fact !== undefined);
  const primaryFact = object.facts[0];
  const firstSource = primaryFact?.sourceIds[0];

  return (
    <aside className={`object-info-panel ${className}`} aria-label={`Selected object: ${object.name}`}>
      <div className="panel-eyebrow"><span className="live-dot" />SELECTED OBJECT</div>
      <div className="selected-object-heading">
        <div className={`selected-object-sphere sphere-${object.id}`} style={{ '--object-color': object.color } as CSSProperties} aria-hidden="true">
          <span />
        </div>
        <div>
          <span className="object-type-label">{object.typeLabel}</span>
          <h2>{object.name}</h2>
          {object.designation && <p>{object.designation}</p>}
        </div>
      </div>
      <p className="selected-object-description">{object.description}</p>

      <nav className="relationship-path" aria-label="Object relationship path">
        <span><GitBranch size={13} />SYSTEM PATH</span>
        <div className="relationship-crumbs">
          {path.map((item, index) => (
            <span key={item.id} className="relationship-crumb-wrap">
              {index > 0 && <span className="crumb-separator" aria-hidden="true">/</span>}
              <Link to={`/objects/${item.id}`} onClick={() => useExplorerStore.getState().selectObject(item.id)}>{item.name}</Link>
            </span>
          ))}
        </div>
      </nav>

      <div className="panel-stat-list">
        {stats.slice(0, 3).map((fact) => (
          <div className="panel-stat" key={fact.key}>
            <span>{fact.label}</span>
            <strong>{fact.value}<small>{fact.unit}</small></strong>
          </div>
        ))}
      </div>
      {object.lifeStatus && (
        <div className="life-status-note"><Sparkles size={14} /><span><small>HABITABILITY CONTEXT</small>{object.lifeStatus}</span></div>
      )}
      {children.length > 0 && (
        <div className="related-object-block">
          <div className="related-object-header"><span>{object.kind === 'star' ? 'Planets in this system' : object.kind === 'planet' ? 'Known moons' : 'Related objects'}</span><span>{children.length.toString().padStart(2, '0')}</span></div>
          <div className="related-object-list">
            {children.slice(0, 4).map((child) => (
              <Link to={`/objects/${child.id}`} className={`related-object${child.id === selectedId ? ' is-current' : ''}`} key={child.id} onClick={() => useExplorerStore.getState().selectObject(child.id)}>
                <span className="related-object-dot" style={{ backgroundColor: child.color }} />{child.name}<ArrowUpRight size={13} />
              </Link>
            ))}
            {children.length > 4 && (
              <Link className="related-more" to={object.kind === 'star' ? '/planets' : '/moons'}>
                View all {children.length} {object.kind === 'star' ? 'planets' : 'moons'} <ArrowUpRight size={13} />
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="panel-actions">
        <Link className="button button-primary button-wide" to={`/objects/${object.id}`}>
          Open full profile <ArrowUpRight size={16} />
        </Link>
        <div className="panel-action-row">
          <button className="button button-secondary" type="button" onClick={() => navigate(`/compare?a=${object.id}&b=${object.id === 'earth' ? 'mars' : 'earth'}`)}><Scale size={15} />Compare</button>
          <Link className="button button-secondary" to="/solar-system" onClick={() => useExplorerStore.getState().selectObject(object.kind === 'moon' && object.parentId ? object.parentId : object.id)}><span className="button-orbit-icon" />{object.kind === 'moon' ? 'View parent' : 'View system'}</Link>
        </div>
      </div>
      <div className="panel-source">
        <div className="panel-source-head"><span>DATA PROVENANCE</span><ConfidenceBadge confidence={object.facts[0]?.confidence ?? 'unknown'} /></div>
        {firstSource && <FactSource fact={object.facts[0]} />}
        <Link to="/sources" className="panel-source-all">All sources <ArrowUpRight size={13} /></Link>
      </div>
    </aside>
  );
}
