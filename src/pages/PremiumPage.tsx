import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useLicense, useToast } from '../app/providers';
import { SITE, SITE_STATS, instagramUrl } from '../core/site';
import { Accordion, CopyButton, Reveal } from '../components/Ui';
import { IconCheck, IconClose, IconCrown, IconInfo, IconInstagram, IconKey, IconSparkles } from '../components/icons';

export function PremiumPage() {
  const { t } = useI18n();
  const { license, isPremium, tier, activate, deactivate } = useLicense();
  const { push } = useToast();
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const handleActivate = () => {
    setBusy(true);
    setError(false);
    // A short delay makes the check feel deliberate; validation itself is instant.
    window.setTimeout(() => {
      const result = activate(key);
      setBusy(false);
      if (result) {
        push(t('toast.activated'), 'success');
        setKey('');
        setError(false);
      } else {
        setError(true);
      }
    }, 220);
  };

  const plans = [
    {
      id: 'free',
      name: t('premium.free.name'),
      price: t('premium.free.price'),
      note: t('premium.free.note'),
      desc: t('premium.free.desc'),
      cta: t('hero.ctaPrimary'),
      to: '/templates',
      featured: false,
      features: [
        { label: t('premium.feature.allFree'), included: true },
        { label: t('premium.feature.copy'), included: true },
        { label: t('premium.feature.zipLimited'), included: true },
        { label: t('premium.feature.premiumTemplates'), included: false },
        { label: t('premium.feature.premiumAnimations'), included: false },
        { label: t('premium.feature.clientUse'), included: false },
      ],
    },
    {
      id: 'pro',
      name: t('premium.pro.name'),
      price: t('premium.pro.price'),
      note: t('premium.pro.note'),
      desc: t('premium.pro.desc'),
      cta: t('premium.cta.instagram'),
      href: instagramUrl(),
      featured: true,
      features: [
        { label: t('premium.feature.premiumTemplates'), included: true },
        { label: t('premium.feature.premiumAnimations'), included: true },
        { label: t('premium.feature.palettes'), included: true },
        { label: t('premium.feature.unlimited'), included: true },
        { label: t('premium.feature.updates'), included: true },
        { label: t('premium.feature.clientUse'), included: false },
      ],
    },
    {
      id: 'studio',
      name: t('premium.studio.name'),
      price: t('premium.studio.price'),
      note: t('premium.studio.note'),
      desc: t('premium.studio.desc'),
      cta: t('premium.cta.instagram'),
      href: instagramUrl(),
      featured: false,
      features: [
        { label: t('premium.feature.premiumTemplates'), included: true },
        { label: t('premium.feature.premiumAnimations'), included: true },
        { label: t('premium.feature.palettes'), included: true },
        { label: t('premium.feature.unlimited'), included: true },
        { label: t('premium.feature.clientUse'), included: true },
        { label: t('premium.feature.priority'), included: true },
      ],
    },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ margin: '0 auto var(--space-7)', textAlign: 'center' }}>
          <span className="pill pill--premium">
            <IconCrown size={14} />
            {SITE_STATS.premiumTemplates} template · {SITE_STATS.premiumAnimations} animasi
          </span>
          <h1 style={{ marginTop: 16 }}>{t('premium.title')}</h1>
          <p style={{ maxWidth: '58ch', margin: '0 auto' }}>{t('premium.subtitle')}</p>
        </div>

        <div className="pricing">
          {plans.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 70}>
              <div className={`price-card ${plan.featured ? 'price-card--featured' : ''}`}>
                {plan.featured ? <span className="price-card__badge">{t('premium.bestValue')}</span> : null}
                <div>
                  <h3 style={{ marginBottom: 6 }}>{plan.name}</h3>
                  <p className="small muted" style={{ margin: 0 }}>
                    {plan.desc}
                  </p>
                </div>
                <div>
                  <div className="price-card__price">{plan.price}</div>
                  <div className="tiny muted">{plan.note}</div>
                </div>
                <ul className="price-list">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className={feature.included ? '' : 'is-muted'}>
                      {feature.included ? <IconCheck size={15} /> : <IconClose size={15} />}
                      <span>{feature.label}</span>
                    </li>
                  ))}
                </ul>
                {plan.to ? (
                  <Link className="btn btn--ghost btn--block" to={plan.to}>
                    {plan.cta}
                  </Link>
                ) : (
                  <a className="btn btn--primary btn--block" href={plan.href} target="_blank" rel="noreferrer noopener">
                    <IconInstagram size={16} />
                    {plan.cta}
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)', marginTop: 'var(--space-7)' }}>
          <Reveal>
            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">{t('premium.redeem.title')}</span>
                <IconKey size={16} />
              </div>
              <div className="panel__body">
                <div className={`license-state ${isPremium ? 'is-premium' : ''}`}>
                  <span className={`pill ${isPremium ? 'pill--premium' : ''}`}>
                    {isPremium ? <IconCheck size={13} /> : <IconInfo size={13} />}
                    {isPremium
                      ? t('premium.active', { tier: tier === 'studio' ? 'Studio' : 'Pro' })
                      : t('premium.active.noKey')}
                  </span>
                  {license ? <span className="tiny muted mono">{license.key}</span> : null}
                </div>

                <div className="redeem">
                  <input
                    className="input"
                    placeholder={t('premium.redeem.placeholder')}
                    value={key}
                    onChange={(event) => {
                      setKey(event.target.value);
                      setError(false);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && key.trim()) handleActivate();
                    }}
                    aria-label={t('premium.redeem.title')}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <button type="button" className="btn btn--primary" disabled={busy || key.trim().length < 8} onClick={handleActivate}>
                    <IconSparkles size={16} />
                    {busy ? t('premium.redeem.checking') : t('premium.redeem.button')}
                  </button>
                </div>

                {error ? <p className="small" style={{ color: 'var(--danger)', margin: 0 }}>{t('premium.redeem.error')}</p> : null}
                {isPremium ? (
                  <p className="small" style={{ color: 'var(--success)', margin: 0 }}>
                    {t('premium.redeem.success', { tier: tier === 'studio' ? 'Studio' : 'Pro' })}
                  </p>
                ) : null}
                <p className="tiny muted" style={{ margin: 0 }}>{t('premium.redeem.hint')}</p>

                {isPremium ? (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => { deactivate(); push(t('toast.deactivated'), 'info'); }}>
                    {t('premium.deactivate')}
                  </button>
                ) : null}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">{t('premium.steps.title')}</span>
                <IconInstagram size={16} />
              </div>
              <div className="panel__body">
                <div className="steps-list">
                  {[1, 2, 3, 4].map((step) => (
                    <div className="step-row" key={step}>
                      <span className="step-row__num">{step}</span>
                      <div>
                        <strong className="small" style={{ display: 'block', color: 'var(--text)' }}>
                          {t(`premium.steps.${step}.title`, { handle: SITE.instagram })}
                        </strong>
                        <span className="small muted">{t(`premium.steps.${step}.desc`, { handle: SITE.instagram })}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <a className="btn btn--primary btn--block" href={instagramUrl()} target="_blank" rel="noreferrer noopener">
                  <IconInstagram size={16} />
                  {t('premium.cta.instagram')}
                </a>
                <p className="tiny muted" style={{ margin: 0 }}>
                  {t('premium.cta.instagramHint', { handle: SITE.instagram })}
                </p>
                <CopyButton
                  className="btn btn--ghost btn--sm"
                  text={`@${SITE.instagram}`}
                  label={`@${SITE.instagram}`}
                  copiedLabel={t('common.copied')}
                  toastMessage={t('toast.copiedLink')}
                />
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="note note--warn" style={{ marginTop: 'var(--space-5)' }}>
            <div className="row" style={{ color: 'var(--warning)', fontWeight: 750 }}>
              <IconInfo size={16} />
              {t('premium.security.title')}
            </div>
            <p className="small" style={{ margin: '8px 0 0' }}>{t('premium.security.desc')}</p>
            <Link className="btn btn--ghost btn--sm" style={{ marginTop: 12 }} to="/owner">
              <IconKey size={14} />
              {t('premium.ownerTool')}
            </Link>
          </div>
        </Reveal>

        <section className="section">
          <div className="section-head">
            <h2>{t('premium.faq.title')}</h2>
          </div>
          <div style={{ maxWidth: 860 }}>
            {[1, 2, 3, 4].map((index) => (
              <Accordion key={index} title={t(`premium.faq.q${index}`)} defaultOpen={index === 1}>
                <p className="small" style={{ margin: 0 }}>
                  {t(`premium.faq.a${index}`)}
                </p>
              </Accordion>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
