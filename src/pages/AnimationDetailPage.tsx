import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { RenderConfig } from '../core/types';
import { resolveConfig } from '../core/palettes';
import { getAnimation } from '../animations';
import { templatesForAnimation } from '../templates';
import { useI18n } from '../i18n';
import { useLibrary, useLicense, useToast } from '../app/providers';
import { Customizer } from '../components/Customizer';
import { CopyButton, DownloadButton, LockOverlay, Reveal } from '../components/Ui';
import { SvgPreview } from '../components/SvgPreview';
import { TemplateCard } from '../components/AssetCards';
import { downloadSvg } from '../lib/exporter';
import { formatBytes } from '../lib/exporter';
import { IconArrowLeft, IconCrown, IconLock } from '../components/icons';

export function AnimationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, pick } = useI18n();
  const { isPremium } = useLicense();
  const { push } = useToast();
  const { markVisited } = useLibrary();

  const animation = id ? getAnimation(id) : undefined;
  const [config, setConfig] = useState<RenderConfig>(() => resolveConfig(animation?.defaults ?? null));
  const [transparentPreview, setTransparentPreview] = useState(false);

  useEffect(() => {
    if (!animation) return;
    setConfig(resolveConfig(animation.defaults));
    markVisited(`anim:${animation.id}`);
  }, [animation, markVisited]);

  const locked = Boolean(animation && animation.tier === 'premium' && !isPremium);

  const svg = useMemo(
    () => (animation ? animation.render({ ...config, transparent: transparentPreview || config.transparent }) : ''),
    [animation, config, transparentPreview],
  );

  const related = useMemo(() => (animation ? templatesForAnimation(animation.id) : []), [animation]);

  if (!animation) {
    return (
      <div className="page container">
        <div className="empty">
          <h3>{t('notfound.title')}</h3>
          <Link className="btn btn--primary" to="/animations">
            {t('nav.animations')}
          </Link>
        </div>
      </div>
    );
  }

  const patch = (next: Partial<RenderConfig>) => setConfig((current) => ({ ...current, ...next }));
  const requirePremium = (): boolean => {
    if (!locked) return false;
    push(t('toast.locked'), 'warn', { label: t('detail.locked.cta'), onClick: () => navigate('/premium') });
    return true;
  };

  return (
    <div className="page">
      <div className="container detail-layout">
        <div className="detail-main">
          <div className="row-wrap">
            <Link className="btn btn--ghost btn--sm" to="/animations">
              <IconArrowLeft size={15} />
              {t('detail.back')}
            </Link>
            <span className={`pill ${animation.tier === 'premium' ? 'pill--premium' : 'pill--free'}`}>
              {animation.tier === 'premium' ? <IconCrown size={13} /> : null}
              {animation.tier === 'premium' ? t('common.premium') : t('common.free')}
            </span>
            <span className="pill">{animation.group}</span>
          </div>

          <div>
            <h1 style={{ marginBottom: 8 }}>{pick(animation.name)}</h1>
            <p style={{ maxWidth: '64ch' }}>{pick(animation.blurb)}</p>
            <div className="row-wrap">
              {animation.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="preview-shell">
            <div className="preview-toolbar">
              <span className="small muted">
                {config.width} × {config.height} px · {formatBytes(new Blob([svg]).size)}
              </span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTransparentPreview((value) => !value)}>
                {transparentPreview ? t('controls.transparent') + ' ✓' : t('controls.transparent')}
              </button>
            </div>
            {locked ? (
              <LockOverlay
                title={t('detail.locked.title')}
                description={t('detail.locked.desc')}
                ctaLabel={t('detail.locked.cta')}
                onCta={() => navigate('/premium')}
              >
                <div className="svg-frame checkboard">
                  <SvgPreview svg={svg} alt={pick(animation.name)} loading="eager" />
                </div>
              </LockOverlay>
            ) : (
              <div className={`svg-frame ${transparentPreview || config.transparent ? 'checkboard' : ''}`}>
                <SvgPreview svg={svg} alt={pick(animation.name)} loading="eager" />
              </div>
            )}

            <div className="row-wrap" style={{ marginTop: 'var(--space-4)' }}>
              <DownloadButton
                label={t('detail.downloadSvg')}
                onDownload={() => {
                  if (requirePremium()) return;
                  downloadSvg(svg, animation.id);
                  push(t('toast.zipReady'), 'success');
                }}
              />
              <CopyButton
                className="btn btn--ghost"
                text={svg}
                label={t('detail.copySvg')}
                copiedLabel={t('common.copied')}
                toastMessage={t('toast.copiedSvg')}
              />
              {locked ? (
                <span className="pill pill--premium">
                  <IconLock size={13} />
                  {t('detail.locked.title')}
                </span>
              ) : null}
            </div>
          </div>

          {!locked ? (
            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">SVG</span>
                <span className="tiny muted">{t('common.lines', { count: svg.split('\n').length })}</span>
              </div>
              <div className="panel__body" style={{ padding: 'var(--space-3)' }}>
                <pre
                  className="code-view__code"
                  style={{ maxHeight: 340, overflow: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                >
                  {svg}
                </pre>
              </div>
            </div>
          ) : null}

          {related.length > 0 ? (
            <div>
              <h3 style={{ marginBottom: 'var(--space-4)' }}>{t('detail.usedIn')}</h3>
              <div className="grid grid--cards">
                {related.slice(0, 4).map((template) => (
                  <Reveal key={template.id}>
                    <TemplateCard template={template} />
                  </Reveal>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="detail-side">
          <Customizer config={config} controls={animation.controls} onChange={patch} onReset={() => setConfig(resolveConfig(animation.defaults))} />
          <div className="panel">
            <div className="panel__body">
              <div className="tiny muted">
                Animasi ini adalah file <code>.svg</code> tunggal berisi animasi SMIL. Tempel ke README dengan{' '}
                <code>&lt;img src="assets/{animation.id}.svg" width="100%" /&gt;</code>.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
