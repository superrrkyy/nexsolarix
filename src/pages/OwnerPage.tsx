import { useState } from 'react';
import { useI18n } from '../i18n';
import { useToast } from '../app/providers';
import { CopyButton, Reveal } from '../components/Ui';
import { downloadKeysCsv, downloadText } from '../lib/exporter';
import { mintKey, usingDemoSecret, type LicenseTier } from '../lib/license';
import { IconInfo, IconKey, IconLock } from '../components/icons';

interface GeneratedKey {
  key: string;
  tier: LicenseTier;
  issuedAt: string;
}

export function OwnerPage() {
  const { t } = useI18n();
  const { push } = useToast();
  const [secret, setSecret] = useState('');
  const [tier, setTier] = useState<LicenseTier>('pro');
  const [count, setCount] = useState(5);
  const [keys, setKeys] = useState<GeneratedKey[]>([]);

  const canGenerate = secret.trim().length >= 8 && count > 0;

  const generate = () => {
    const issuedAt = new Date().toISOString();
    const next: GeneratedKey[] = Array.from({ length: Math.min(count, 200) }, () => ({
      key: mintKey(secret.trim(), tier),
      tier,
      issuedAt,
    }));
    setKeys((current) => [...next, ...current].slice(0, 200));
    push(t('toast.ownerKeys', { count: next.length }), 'success');
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 880 }}>
        <div className="page-head">
          <span className="eyebrow">
            <IconKey size={14} />
            owner
          </span>
          <h1>{t('owner.title')}</h1>
          <p>{t('owner.subtitle')}</p>
        </div>

        <div className="note note--warn" style={{ marginBottom: 'var(--space-5)' }}>
          <div className="row" style={{ color: 'var(--warning)', fontWeight: 750 }}>
            <IconLock size={16} />
            {t('owner.warning')}
          </div>
          <p className="small" style={{ margin: '8px 0 0' }}>
            {t('owner.mismatch')}
          </p>
        </div>

        {usingDemoSecret() ? (
          <div className="note" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="row small" style={{ fontWeight: 700 }}>
              <IconInfo size={15} />
              Build ini memakai demo secret.
            </div>
            <p className="small muted" style={{ margin: '6px 0 0' }}>
              Siapa pun yang membaca bundle bisa membuat kode sendiri. Untuk deploy publik, set{' '}
              <code>VITE_LICENSE_SECRET</code> saat build, lalu buat kode di halaman ini dengan mengetikkan secret yang sama.
            </p>
          </div>
        ) : null}

        <Reveal>
          <div className="panel owner-card">
            <div className="panel__head">
              <span className="panel__title">{t('owner.title')}</span>
              <IconKey size={16} />
            </div>
            <div className="panel__body">
              <label className="field">
                <span className="field__label">
                  {t('owner.passphrase')}
                  <span className="field__value">{secret.length} chars</span>
                </span>
                <input
                  className="input mono"
                  type="password"
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="off"
                  spellCheck={false}
                />
                <span className="tiny muted">{t('owner.passphraseHint')}</span>
                {secret.length > 0 && secret.trim().length < 8 ? (
                  <span className="tiny" style={{ color: 'var(--danger)' }}>
                    {t('owner.strength')}
                  </span>
                ) : null}
              </label>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
                <label className="field">
                  <span className="field__label">{t('owner.tier')}</span>
                  <select className="select" value={tier} onChange={(event) => setTier(event.target.value as LicenseTier)}>
                    <option value="pro">Pro</option>
                    <option value="studio">Studio</option>
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">{t('owner.count')}</span>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={200}
                    value={count}
                    onChange={(event) => setCount(Math.max(1, Math.min(200, Number(event.target.value) || 1)))}
                  />
                </label>
              </div>

              <button type="button" className="btn btn--primary" disabled={!canGenerate} onClick={generate}>
                <IconKey size={16} />
                {t('owner.generate')}
              </button>
            </div>
          </div>
        </Reveal>

        {keys.length > 0 ? (
          <Reveal>
            <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
              <div className="panel__head">
                <span className="panel__title">
                  {t('owner.results')} · {keys.length}
                </span>
                <div className="row" style={{ gap: 6 }}>
                  <CopyButton
                    className="btn btn--ghost btn--sm"
                    text={keys.map((entry) => entry.key).join('\n')}
                    label={t('owner.copyAll')}
                    copiedLabel={t('common.copied')}
                  />
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => downloadKeysCsv(keys)}>
                    {t('owner.downloadCsv')}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() =>
                      downloadText(
                        keys.map((entry) => `${entry.key}\t${entry.tier}\t${entry.issuedAt}`).join('\n'),
                        'nexsolarix-keys.txt',
                      )
                    }
                  >
                    TXT
                  </button>
                </div>
              </div>
              <div className="panel__body">
                <div className="key-list">
                  {keys.map((entry, index) => (
                    <div className="key-row" key={`${entry.key}-${index}`}>
                      <span>{entry.key}</span>
                      <span className="pill tiny" style={{ marginLeft: 'auto' }}>
                        {entry.tier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}
