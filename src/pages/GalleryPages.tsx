import { useMemo, useState } from 'react';
import { ALL_ANIMATIONS, ANIMATION_GROUPS, FREE_ANIMATIONS } from '../animations';
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES } from '../templates';
import type { AnimationGroup, TemplateCategory, Tier } from '../core/types';
import { useI18n } from '../i18n';
import { useLibrary } from '../app/providers';
import { AnimationCard, TemplateCard } from '../components/AssetCards';
import { Reveal } from '../components/Ui';
import { mulberry32 } from '../lib/svgkit';
import { IconGrid, IconHeart, IconSearch, IconShuffle } from '../components/icons';

type TierFilter = 'all' | Tier;
type SortKey = 'featured' | 'az' | 'za' | 'free';

function Toolbar({
  search,
  onSearch,
  placeholder,
  children,
}: {
  search: string;
  onSearch: (value: string) => void;
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <IconSearch size={16} />
        <input
          className="input"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          type="search"
        />
      </div>
      {children}
    </div>
  );
}

function TierChips({ value, onChange }: { value: TierFilter; onChange: (tier: TierFilter) => void }) {
  const { t } = useI18n();
  return (
    <div className="filter-chips">
      {(['all', 'free', 'premium'] as TierFilter[]).map((tier) => (
        <button
          key={tier}
          type="button"
          className={`chip ${value === tier ? 'is-active' : ''}`}
          onClick={() => onChange(tier)}
        >
          {tier === 'all' ? t('gallery.all') : tier === 'free' ? t('gallery.free') : t('gallery.premium')}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Templates gallery
 * ------------------------------------------------------------------ */

export function TemplatesPage() {
  const { t, pick, locale } = useI18n();
  const { favourites } = useLibrary();
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState<TierFilter>('all');
  const [category, setCategory] = useState<'all' | TemplateCategory>('all');
  const [sort, setSort] = useState<SortKey>('featured');
  const [seed, setSeed] = useState(0);
  const [onlyFavourites, setOnlyFavourites] = useState(false);

  const results = useMemo(() => {
    const needle = search.trim().toLowerCase();
    let list = ALL_TEMPLATES.filter((template) => {
      if (tier !== 'all' && template.tier !== tier) return false;
      if (category !== 'all' && template.category !== category) return false;
      if (onlyFavourites && !favourites.includes(template.id)) return false;
      if (!needle) return true;
      const haystack = [
        template.name.id,
        template.name.en,
        template.blurb.id,
        template.blurb.en,
        template.tags.join(' '),
        template.animations.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });

    if (sort === 'featured' && seed > 0) {
      // Deterministic shuffle so the "shuffle" button gives a stable new order.
      const random = mulberry32(seed * 2654435761);
      list = [...list]
        .map((item) => ({ item, key: random() }))
        .sort((a, b) => a.key - b.key)
        .map((entry) => entry.item);
    } else if (sort === 'az') {
      list = [...list].sort((a, b) => pick(a.name).localeCompare(pick(b.name), locale));
    } else if (sort === 'za') {
      list = [...list].sort((a, b) => pick(b.name).localeCompare(pick(a.name), locale));
    } else if (sort === 'free') {
      list = [...list].sort((a, b) => (a.tier === b.tier ? 0 : a.tier === 'free' ? -1 : 1));
    }

    return list;
  }, [search, tier, category, sort, seed, onlyFavourites, favourites, pick, locale]);

  const hasFilters = search !== '' || tier !== 'all' || category !== 'all' || onlyFavourites;

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">
            <IconGrid size={14} />
            {ALL_TEMPLATES.length} template
          </span>
          <h1>{t('nav.templates')}</h1>
          <p>{t('home.featured.subtitle')}</p>
        </div>

        <Toolbar search={search} onSearch={setSearch} placeholder={t('gallery.search')}>
          <TierChips value={tier} onChange={setTier} />
          <select className="select" style={{ width: 'auto' }} value={category} onChange={(event) => setCategory(event.target.value as 'all' | TemplateCategory)}>
            <option value="all">{t('gallery.category')}: {t('gallery.all')}</option>
            {TEMPLATE_CATEGORIES.map((entry) => (
              <option key={entry.category} value={entry.category}>
                {entry.label[locale]}
              </option>
            ))}
          </select>
          <select className="select" style={{ width: 'auto' }} value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="featured">{t('gallery.sort.featured')}</option>
            <option value="free">{t('gallery.sort.free')}</option>
            <option value="az">{t('gallery.sort.az')}</option>
            <option value="za">{t('gallery.sort.za')}</option>
          </select>
          <button type="button" className="btn btn--icon btn--ghost" aria-label={t('gallery.shuffle')} onClick={() => setSeed((value) => value + 1)}>
            <IconShuffle size={16} />
          </button>
          <button
            type="button"
            className={`btn btn--icon btn--ghost ${onlyFavourites ? 'is-active' : ''}`}
            aria-label={t('card.favorite')}
            aria-pressed={onlyFavourites}
            onClick={() => setOnlyFavourites((value) => !value)}
            style={onlyFavourites ? { color: 'var(--warning)' } : undefined}
          >
            <IconHeart size={16} filled={onlyFavourites} />
          </button>
        </Toolbar>

        <div className="results-line">
          <span>{t('gallery.results', { count: results.length })}</span>
          {hasFilters ? (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setSearch('');
                setTier('all');
                setCategory('all');
                setOnlyFavourites(false);
                setSort('featured');
              }}
            >
              {t('gallery.reset')}
            </button>
          ) : null}
        </div>

        {results.length === 0 ? (
          <div className="empty">
            <h3>{t('gallery.empty.title')}</h3>
            <p className="small">{t('gallery.empty.desc')}</p>
          </div>
        ) : (
          <div className="grid grid--cards">
            {results.map((template, index) => (
              <Reveal key={template.id} delay={Math.min(index, 8) * 45}>
                <TemplateCard template={template} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Animations gallery
 * ------------------------------------------------------------------ */

export function AnimationsPage() {
  const { t, pick, locale } = useI18n();
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState<TierFilter>('all');
  const [group, setGroup] = useState<'all' | AnimationGroup>('all');

  const results = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return ALL_ANIMATIONS.filter((animation) => {
      if (tier !== 'all' && animation.tier !== tier) return false;
      if (group !== 'all' && animation.group !== group) return false;
      if (!needle) return true;
      const haystack = [animation.name.id, animation.name.en, animation.blurb.id, animation.blurb.en, animation.tags.join(' ')]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    }).sort((a, b) => pick(a.name).localeCompare(pick(b.name), locale));
  }, [search, tier, group, pick, locale]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">{FREE_ANIMATIONS.length} gratis · {ALL_ANIMATIONS.length - FREE_ANIMATIONS.length} premium</span>
          <h1>{t('nav.animations')}</h1>
          <p>{t('home.animations.subtitle')}</p>
        </div>

        <Toolbar search={search} onSearch={setSearch} placeholder={t('gallery.searchAnimations')}>
          <TierChips value={tier} onChange={setTier} />
        </Toolbar>

        <div className="filter-chips" style={{ marginBottom: 'var(--space-5)' }}>
          <button type="button" className={`chip ${group === 'all' ? 'is-active' : ''}`} onClick={() => setGroup('all')}>
            {t('gallery.all')}
          </button>
          {ANIMATION_GROUPS.map((entry) => (
            <button
              key={entry.group}
              type="button"
              className={`chip ${group === entry.group ? 'is-active' : ''}`}
              onClick={() => setGroup(entry.group)}
            >
              {entry.label[locale]}
            </button>
          ))}
        </div>

        <div className="results-line">
          <span>{t('gallery.results', { count: results.length })}</span>
        </div>

        {results.length === 0 ? (
          <div className="empty">
            <h3>{t('gallery.empty.title')}</h3>
            <p className="small">{t('gallery.empty.desc')}</p>
          </div>
        ) : (
          <div className="grid grid--cards">
            {results.map((animation, index) => (
              <Reveal key={animation.id} delay={Math.min(index, 8) * 40}>
                <AnimationCard animation={animation} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
