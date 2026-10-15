import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { AnimationAsset, RenderConfig, TemplateAsset } from '../core/types';
import { getPalette, resolveConfig } from '../core/palettes';
import { useI18n } from '../i18n';
import { useLibrary, useLicense } from '../app/providers';
import { useSpotlight } from '../hooks';
import { getAnimation, renderAnimation } from '../animations';
import { SvgPreview } from './SvgPreview';
import { IconChevronRight, IconCrown, IconHeart, IconLayers, IconLock } from './icons';

function TierBadge({ tier }: { tier: 'free' | 'premium' }) {
  const { t } = useI18n();
  return (
    <span className={`pill ${tier === 'premium' ? 'pill--premium' : 'pill--free'}`}>
      {tier === 'premium' ? <IconCrown size={13} /> : null}
      {tier === 'premium' ? t('common.premium') : t('common.free')}
    </span>
  );
}

function FavouriteButton({ id }: { id: string }) {
  const { isFavourite, toggleFavourite } = useLibrary();
  const { t } = useI18n();
  const active = isFavourite(id);
  return (
    <button
      type="button"
      className={`fav-btn ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      aria-label={active ? t('card.favorited') : t('card.favorite')}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavourite(id);
      }}
    >
      <IconHeart size={16} filled={active} />
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Template card
 * ------------------------------------------------------------------ */

interface TemplateCardProps {
  template: TemplateAsset;
  configOverride?: Partial<RenderConfig>;
}

export function TemplateCard({ template, configOverride }: TemplateCardProps) {
  const { t, pick } = useI18n();
  const { isPremium } = useLicense();
  const spotlight = useSpotlight<HTMLElement>();
  const locked = template.tier === 'premium' && !isPremium;

  const svg = useMemo(() => {
    const hero = template.animations[0];
    if (!hero) return '';
    const config = resolveConfig({ ...template.defaults, ...configOverride });
    const animation = getAnimation(hero);
    return animation ? animation.render({ ...config, ...animation.defaults }) : '';
  }, [template, configOverride]);

  const palette = getPalette(resolveConfig({ ...template.defaults, ...configOverride }).paletteId);

  return (
    <article className="card card--interactive" ref={spotlight as never}>
      <div className="card__media" style={{ background: palette.bg }}>
        <div className="card__badges">
          <TierBadge tier={template.tier} />
        </div>
        <div className="card__fav">
          <FavouriteButton id={template.id} />
        </div>
        <div className={locked ? 'lock__blur' : undefined}>
          <SvgPreview svg={svg} alt={`${template.name.en} preview`} />
        </div>
        {locked ? (
          <div className="lock__overlay" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(5,6,12,.65), rgba(5,6,12,.9))' }}>
            <div className="row small" style={{ color: '#fff' }}>
              <IconLock size={15} />
              {t('detail.locked.title')}
            </div>
          </div>
        ) : null}
      </div>
      <div className="card__body">
        <div className="card__title">
          {pick(template.name)}
          <span className="pill tiny">{t('card.animations', { count: template.animations.length })}</span>
        </div>
        <p className="card__desc">{pick(template.blurb)}</p>
      </div>
      <div className="card__footer">
        <div className="row-wrap small muted">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <Link className="btn btn--sm btn--primary" to={`/templates/${template.id}`}>
          {t('card.open')}
          <IconChevronRight size={15} />
        </Link>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Animation card
 * ------------------------------------------------------------------ */

interface AnimationCardProps {
  animation: AnimationAsset;
  configOverride?: Partial<RenderConfig>;
}

export function AnimationCard({ animation, configOverride }: AnimationCardProps) {
  const { pick } = useI18n();
  const { isPremium } = useLicense();
  const spotlight = useSpotlight<HTMLElement>();
  const locked = animation.tier === 'premium' && !isPremium;

  const svg = useMemo(() => {
    const config = resolveConfig({ ...animation.defaults, ...configOverride });
    return animation.render(config);
  }, [animation, configOverride]);

  return (
    <article className="card card--interactive" ref={spotlight as never}>
      <div className="card__media" style={{ background: getPalette(resolveConfig({ ...animation.defaults, ...configOverride }).paletteId).bg }}>
        <div className="card__badges">
          <TierBadge tier={animation.tier} />
        </div>
        <div className="card__fav">
          <FavouriteButton id={`anim:${animation.id}`} />
        </div>
        <div className={locked ? 'lock__blur' : undefined}>
          <SvgPreview svg={svg} alt={`${animation.name.en} animation`} />
        </div>
        {locked ? (
          <div className="lock__overlay" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(5,6,12,.6), rgba(5,6,12,.88))' }}>
            <div className="row small" style={{ color: '#fff' }}>
              <IconLock size={15} />
              Premium
            </div>
          </div>
        ) : null}
      </div>
      <div className="card__body">
        <div className="card__title">{pick(animation.name)}</div>
        <p className="card__desc">{pick(animation.blurb)}</p>
      </div>
      <div className="card__footer">
        <div className="row-wrap small muted">
          <IconLayers size={14} />
          {animation.tags.slice(0, 2).join(' · ')}
        </div>
        <Link className="btn btn--sm" to={`/animations/${animation.id}`}>
          Open
          <IconChevronRight size={15} />
        </Link>
      </div>
    </article>
  );
}

/** Compact tile used inside marquees and "more animations" strips. */
export function AnimationTile({ animationId, config, width = 380 }: { animationId: string; config?: RenderConfig; width?: number }) {
  const { pick } = useI18n();
  const animation = getAnimation(animationId);
  const svg = useMemo(() => renderAnimation(animationId, { width, height: Math.round(width * 0.32), ...config }), [animationId, config, width]);

  if (!animation) return null;

  return (
    <Link to={`/animations/${animation.id}`} className="marquee__item animation-tile">
      <SvgPreview svg={svg} alt={`${animation.name.en} animation`} />
      <div className="animation-tile__meta">
        <span className="small" style={{ fontWeight: 650 }}>
          {pick(animation.name)}
        </span>
        <span className={`pill tiny ${animation.tier === 'premium' ? 'pill--premium' : 'pill--free'}`}>
          {animation.tier === 'premium' ? 'Premium' : 'Free'}
        </span>
      </div>
    </Link>
  );
}
