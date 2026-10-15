import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ALL_ANIMATIONS, FREE_ANIMATIONS, renderAnimation } from '../animations';
import { ALL_TEMPLATES } from '../templates';
import { useI18n } from '../i18n';
import { useLicense } from '../app/providers';
import { SITE, SITE_STATS, instagramUrl } from '../core/site';
import { Accordion, Reveal } from '../components/Ui';
import { AnimationTile, TemplateCard } from '../components/AssetCards';
import { SvgPreview } from '../components/SvgPreview';
import {
  IconArrowRight,
  IconCrown,
  IconDownload,
  IconImage,
  IconInstagram,
  IconPalette,
  IconSparkles,
  IconTerminal,
  IconWand,
} from '../components/icons';

const SHOWCASE = ['aurora-banner', 'terminal-type', 'holo-card'];

export function HomePage() {
  const { t, pick } = useI18n();
  const { isPremium } = useLicense();

  const featured = useMemo(() => {
    const preferred = ['aurora-profile', 'terminal-dev', 'neon-cyber', 'glass-portfolio', 'hud-tech', 'project-launch'];
    return preferred
      .map((id) => ALL_TEMPLATES.find((template) => template.id === id))
      .filter((template): template is (typeof ALL_TEMPLATES)[number] => Boolean(template));
  }, []);

  const showcaseSvgs = useMemo(
    () => SHOWCASE.map((id) => renderAnimation(id, { width: 900, height: id === 'holo-card' ? 320 : 260 })),
    [],
  );

  const marqueeAnimations = useMemo(() => {
    const free = FREE_ANIMATIONS.map((animation) => animation.id);
    const premiumTeasers = ALL_ANIMATIONS.filter((animation) => animation.tier === 'premium')
      .slice(0, 6)
      .map((animation) => animation.id);
    return [...free, ...premiumTeasers];
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <Reveal>
              <span className="pill pill--accent pill--live">{t('hero.badge')}</span>
            </Reveal>
            <Reveal delay={60}>
              <h1 style={{ marginTop: 18 }}>
                {t('hero.title1')} <span className="gradient-text">{t('hero.title2')}</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="hero__lead">{t('hero.subtitle')}</p>
            </Reveal>
            <Reveal delay={180}>
              <div className="hero__actions">
                <Link className="btn btn--primary btn--lg" to="/templates">
                  <IconWand size={18} />
                  {t('hero.ctaPrimary')}
                </Link>
                <Link className="btn btn--ghost btn--lg" to="/animations">
                  <IconImage size={18} />
                  {t('hero.ctaSecondary')}
                </Link>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="hero__stats">
                {[
                  { value: SITE_STATS.templates, label: t('hero.stat.templates') },
                  { value: SITE_STATS.animations, label: t('hero.stat.animations') },
                  { value: SITE_STATS.palettes, label: t('hero.stat.palettes') },
                  { value: 0, label: t('hero.stat.zero') },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="stat__value">{stat.value}</div>
                    <div className="stat__label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="hero__showcase">
            {showcaseSvgs.map((svg, index) => (
              <div className="showcase-card" key={SHOWCASE[index]}>
                <SvgPreview svg={svg} alt={`${SHOWCASE[index]} demo`} loading="eager" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>{t('home.featured.title')}</h2>
              <p>{t('home.featured.subtitle')}</p>
            </div>
            <Link className="btn btn--ghost" to="/templates">
              {t('home.featured.all')}
              <IconArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid--cards">
            {featured.map((template, index) => (
              <Reveal key={template.id} delay={index * 60}>
                <TemplateCard template={template} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container section-head">
          <div>
            <h2>{t('home.animations.title')}</h2>
            <p>{t('home.animations.subtitle')}</p>
          </div>
          <Link className="btn btn--ghost" to="/animations">
            {t('nav.animations')}
            <IconArrowRight size={16} />
          </Link>
        </div>
        <div className="marquee" aria-hidden="false">
          <div className="marquee__track">
            {[...marqueeAnimations, ...marqueeAnimations].map((id, index) => (
              <AnimationTile key={`${id}-${index}`} animationId={id} width={380} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>{t('home.how.title')}</h2>
              <p>{t('home.how.subtitle')}</p>
            </div>
          </div>
          <div className="grid grid--three">
            {[
              { icon: <IconPalette size={20} />, title: t('home.how.step1.title'), desc: t('home.how.step1.desc') },
              { icon: <IconDownload size={20} />, title: t('home.how.step2.title'), desc: t('home.how.step2.desc') },
              { icon: <IconTerminal size={20} />, title: t('home.how.step3.title'), desc: t('home.how.step3.desc') },
            ].map((step, index) => (
              <Reveal key={step.title} delay={index * 80}>
                <div className="step">
                  <div className="step__index">{index + 1}</div>
                  <div className="feature-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p className="small" style={{ margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="note note--accent" style={{ marginTop: 'var(--space-5)' }}>
              <h3 style={{ marginBottom: 8 }}>{t('home.why.title')}</h3>
              <p className="small" style={{ margin: 0 }}>
                {t('home.why.desc')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div
              className="card"
              style={{
                padding: 'clamp(24px, 4vw, 44px)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
                gap: 'var(--space-6)',
                alignItems: 'center',
              }}
            >
              <div>
                <span className="pill pill--premium">
                  <IconCrown size={14} />
                  {SITE_STATS.premiumTemplates} template · {SITE_STATS.premiumAnimations} animasi premium
                </span>
                <h2 style={{ marginTop: 16 }}>{t('home.premium.title')}</h2>
                <p>{t('home.premium.desc')}</p>
                <div className="btn-group">
                  <Link className="btn btn--primary" to="/premium">
                    {t('home.premium.cta')}
                    <IconArrowRight size={16} />
                  </Link>
                  <a className="btn btn--ghost" href={instagramUrl()} target="_blank" rel="noreferrer noopener">
                    <IconInstagram size={16} />
                    @{SITE.instagram}
                  </a>
                </div>
                {isPremium ? <p className="small muted" style={{ marginTop: 14 }}>{t('premium.active', { tier: 'Pro' })}</p> : null}
              </div>
              <div className="svg-frame" style={{ background: '#05060c', borderRadius: 'var(--radius-md)' }}>
                <SvgPreview svg={renderAnimation('holo-card', { width: 820, height: 320, paletteId: 'holo-chrome' })} alt="Premium holographic card" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="section-head">
            <div>
              <h2>{t('home.faq.title')}</h2>
            </div>
          </div>
          <Reveal>
            <div>
              {[1, 2, 3, 4, 5].map((index, position) => (
                <Accordion key={index} title={t(`faq.q${index}`)} defaultOpen={position === 0}>
                  <p className="small" style={{ margin: 0 }}>
                    {t(`faq.a${index}`, { handle: SITE.instagram })}
                  </p>
                </Accordion>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="note" style={{ textAlign: 'center', padding: 'var(--space-7) var(--space-5)' }}>
              <span className="pill pill--accent">
                <IconSparkles size={14} />
                {SITE.brand}
              </span>
              <h2 style={{ marginTop: 16 }}>{t('hero.title1')} {t('hero.title2')}</h2>
              <p className="small" style={{ maxWidth: 520, margin: '0 auto var(--space-5)' }}>
                {pick(SITE.description)}
              </p>
              <div className="btn-group" style={{ justifyContent: 'center' }}>
                <Link className="btn btn--primary btn--lg" to="/templates">
                  {t('hero.ctaPrimary')}
                </Link>
                <Link className="btn btn--ghost btn--lg" to="/guide">
                  {t('nav.guide')}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
