import type { ControlKey, FontKey, RenderConfig } from '../core/types';
import { PALETTES, getPalette } from '../core/palettes';
import { useI18n } from '../i18n';
import { useLicense } from '../app/providers';
import { IconLock, IconRefresh } from './icons';

interface CustomizerProps {
  config: RenderConfig;
  controls: ControlKey[];
  onChange: (patch: Partial<RenderConfig>) => void;
  onReset: () => void;
}

const FONTS: FontKey[] = ['mono', 'sans', 'serif', 'wide', 'display'];

export function Customizer({ config, controls, onChange, onReset }: CustomizerProps) {
  const { t } = useI18n();
  const { isPremium } = useLicense();
  const has = (control: ControlKey) => controls.includes(control);

  return (
    <div className="panel">
      <div className="panel__head">
        <span className="panel__title">{t('detail.customize')}</span>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onReset}>
          <IconRefresh size={14} />
          {t('detail.reset')}
        </button>
      </div>

      <div className="panel__body">
        {has('palette') ? (
          <div className="field">
            <span className="field__label">
              {t('controls.palette')}
              <span className="field__value">{getPalette(config.paletteId).name.en}</span>
            </span>
            <div className="palette-grid">
              {PALETTES.map((palette) => {
                const locked = palette.tier === 'premium' && !isPremium;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    title={`${palette.name.en} — ${locked ? t('detail.premiumOnlyPalette') : palette.mood.id}`}
                    aria-label={palette.name.en}
                    aria-pressed={config.paletteId === palette.id}
                    className={`palette-swatch ${config.paletteId === palette.id ? 'is-active' : ''}`}
                    style={{ background: palette.bg }}
                    onClick={() => {
                      if (locked) return;
                      onChange({ paletteId: palette.id });
                    }}
                  >
                    <span className="palette-swatch__dots" aria-hidden="true">
                      <i style={{ background: palette.accent }} />
                      <i style={{ background: palette.accent2 }} />
                      <i style={{ background: palette.accent3 }} />
                    </span>
                    {locked ? (
                      <span className="palette-swatch__lock">
                        <IconLock size={14} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {has('accent') ? (
          <div className="field">
            <span className="field__label">
              {t('controls.accent')}
              {config.accent ? (
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange({ accent: null })}>
                  {t('controls.resetAccent')}
                </button>
              ) : (
                <span className="field__value">{getPalette(config.paletteId).accent}</span>
              )}
            </span>
            <div className="color-row">
              <input
                type="color"
                className="color-swatch"
                aria-label={t('controls.accent')}
                value={config.accent ?? getPalette(config.paletteId).accent}
                onChange={(event) => onChange({ accent: event.target.value })}
              />
              <input
                className="input mono"
                style={{ textTransform: 'uppercase' }}
                value={config.accent ?? getPalette(config.paletteId).accent}
                onChange={(event) => {
                  const value = event.target.value.trim();
                  onChange({ accent: /^#[0-9a-fA-F]{6}$/.test(value) ? value : value === '' ? null : config.accent });
                }}
              />
            </div>
          </div>
        ) : null}

        {has('width') || has('height') ? (
          <div className="field">
            <span className="field__label">
              {t('controls.width')} & {t('controls.height')}
              <span className="field__value">{t('detail.sizeHint', { w: config.width, h: config.height })}</span>
            </span>
            {has('width') ? (
              <label className="field">
                <span className="tiny muted">{t('controls.width')}</span>
                <input
                  type="range"
                  className="range"
                  min={480}
                  max={1400}
                  step={20}
                  value={config.width}
                  onChange={(event) => onChange({ width: Number(event.target.value) })}
                />
              </label>
            ) : null}
            {has('height') ? (
              <label className="field">
                <span className="tiny muted">{t('controls.height')}</span>
                <input
                  type="range"
                  className="range"
                  min={80}
                  max={520}
                  step={10}
                  value={config.height}
                  onChange={(event) => onChange({ height: Number(event.target.value) })}
                />
              </label>
            ) : null}
          </div>
        ) : null}

        {has('speed') ? (
          <div className="field">
            <span className="field__label">
              {t('controls.speed')}
              <span className="field__value">{config.speed.toFixed(2)}×</span>
            </span>
            <input
              type="range"
              className="range"
              min={0.25}
              max={3}
              step={0.05}
              value={config.speed}
              onChange={(event) => onChange({ speed: Number(event.target.value) })}
            />
          </div>
        ) : null}

        {has('radius') ? (
          <div className="field">
            <span className="field__label">
              {t('controls.radius')}
              <span className="field__value">{config.radius}px</span>
            </span>
            <input
              type="range"
              className="range"
              min={0}
              max={60}
              step={2}
              value={config.radius}
              onChange={(event) => onChange({ radius: Number(event.target.value) })}
            />
          </div>
        ) : null}

        {has('density') ? (
          <div className="field">
            <span className="field__label">
              {t('controls.density')}
              <span className="field__value">
                {config.density} · {t('detail.densityHint')}
              </span>
            </span>
            <input
              type="range"
              className="range"
              min={1}
              max={10}
              step={1}
              value={config.density}
              onChange={(event) => onChange({ density: Number(event.target.value) })}
            />
          </div>
        ) : null}

        {has('title') || has('subtitle') || has('label') ? (
          <>
            {has('title') ? (
              <label className="field">
                <span className="field__label">{t('controls.title')}</span>
                <input className="input" value={config.title} maxLength={60} onChange={(event) => onChange({ title: event.target.value })} />
              </label>
            ) : null}
            {has('subtitle') ? (
              <label className="field">
                <span className="field__label">{t('controls.subtitle')}</span>
                <input
                  className="input"
                  value={config.subtitle}
                  maxLength={90}
                  onChange={(event) => onChange({ subtitle: event.target.value })}
                />
              </label>
            ) : null}
            {has('label') ? (
              <label className="field">
                <span className="field__label">{t('controls.label')}</span>
                <input className="input" value={config.label} maxLength={40} onChange={(event) => onChange({ label: event.target.value })} />
              </label>
            ) : null}
          </>
        ) : null}

        {has('font') ? (
          <label className="field">
            <span className="field__label">{t('controls.font')}</span>
            <select className="select" value={config.font} onChange={(event) => onChange({ font: event.target.value as FontKey })}>
              {FONTS.map((font) => (
                <option key={font} value={font}>
                  {t(`controls.font.${font}`)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {has('align') ? (
          <div className="field">
            <span className="field__label">{t('controls.align')}</span>
            <div className="segmented">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  className={`segmented__item ${config.align === align ? 'is-active' : ''}`}
                  onClick={() => onChange({ align })}
                >
                  {t(`controls.align.${align}`)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {has('glow') || has('transparent') ? (
          <div className="row-wrap" style={{ gap: 'var(--space-5)' }}>
            {has('glow') ? (
              <label className="switch">
                <input type="checkbox" checked={config.glow} onChange={(event) => onChange({ glow: event.target.checked })} />
                <span className="switch__track" />
                <span className="switch__label">{t('controls.glow')}</span>
              </label>
            ) : null}
            {has('transparent') ? (
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.transparent}
                  onChange={(event) => onChange({ transparent: event.target.checked })}
                />
                <span className="switch__track" />
                <span className="switch__label">{t('controls.transparent')}</span>
              </label>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
