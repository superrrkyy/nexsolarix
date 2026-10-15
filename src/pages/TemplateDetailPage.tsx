import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { RenderConfig, TemplateBuildOptions } from '../core/types';
import { resolveConfig } from '../core/palettes';
import { getTemplate, resolveTemplateConfig } from '../templates';
import { useI18n } from '../i18n';
import { useLibrary, useLicense, useToast } from '../app/providers';
import { Customizer } from '../components/Customizer';
import { CodeView, CopyButton, DownloadButton, GithubFrame, LockOverlay } from '../components/Ui';
import { ReadmePreview } from '../components/ReadmePreview';
import { SvgPreview } from '../components/SvgPreview';
import {
  downloadSvg,
  downloadTemplateZip,
  downloadText,
  formatBytes,
  svgToDataUri,
  templateFiles,
} from '../lib/exporter';
import { IconArrowLeft, IconCheck, IconCrown, IconDownload, IconFile, IconImage, IconLayers, IconLock } from '../components/icons';

type Tab = 'preview' | 'readme' | 'files' | 'guide';

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, pick } = useI18n();
  const { isPremium } = useLicense();
  const { push } = useToast();
  const { markVisited, isFavourite, toggleFavourite } = useLibrary();

  const template = id ? getTemplate(id) : undefined;
  const [config, setConfig] = useState<RenderConfig>(() =>
    template ? resolveTemplateConfig(template) : resolveConfig(null),
  );
  const [options, setOptions] = useState<TemplateBuildOptions>({
    mode: 'relative',
    owner: 'username',
    repo: 'username',
    branch: 'main',
    locale: 'id',
    includeGuide: true,
  });
  const [tab, setTab] = useState<Tab>('preview');
  const [frameLight, setFrameLight] = useState(false);

  useEffect(() => {
    if (!template) return;
    setConfig(resolveTemplateConfig(template));
    markVisited(template.id);
  }, [template, markVisited]);

  const locked = Boolean(template && template.tier === 'premium' && !isPremium);

  const files = useMemo(
    () => (template ? templateFiles(template, config, options) : []),
    [template, config, options],
  );

  const readme = useMemo(() => files.find((file) => file.path === 'README.md')?.content ?? '', [files]);
  const assets = useMemo(
    () => files.filter((file) => file.kind === 'svg').map((file) => ({ path: file.path, content: file.content })),
    [files],
  );

  /** Rewrites relative asset links to inline data URIs so the preview animates in-app. */
  const previewReadme = useMemo(() => {
    let out = readme;
    for (const asset of assets) {
      const fileName = asset.path.split('/').pop() ?? '';
      const dataUri = svgToDataUri(asset.content);
      out = out.split(`src="./assets/${fileName}"`).join(`src="${dataUri}"`);
      out = out.split(`/assets/${fileName}`).join(dataUri);
    }
    return out;
  }, [readme, assets]);

  if (!template) {
    return (
      <div className="page container">
        <div className="empty">
          <h3>{t('notfound.title')}</h3>
          <p className="small">{t('notfound.desc')}</p>
          <Link className="btn btn--primary" to="/templates">
            {t('gallery.all')}
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

  const totalBytes = files.reduce((sum, file) => sum + new Blob([file.content]).size, 0);

  return (
    <div className="page">
      <div className="container detail-layout">
        <div className="detail-main">
          <div className="row-wrap">
            <Link className="btn btn--ghost btn--sm" to="/templates">
              <IconArrowLeft size={15} />
              {t('detail.back')}
            </Link>
            <span className={`pill ${template.tier === 'premium' ? 'pill--premium' : 'pill--free'}`}>
              {template.tier === 'premium' ? <IconCrown size={13} /> : null}
              {template.tier === 'premium' ? t('common.premium') : t('common.free')}
            </span>
            <span className="pill">{template.animations.length} assets</span>
            {isFavourite(template.id) ? (
              <span className="pill pill--accent">
                <IconCheck size={13} /> {t('card.favorited')}
              </span>
            ) : null}
          </div>

          <div>
            <h1 style={{ marginBottom: 8 }}>{pick(template.name)}</h1>
            <p style={{ maxWidth: '64ch' }}>{pick(template.blurb)}</p>
            <div className="row-wrap">
              {template.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => toggleFavourite(template.id)}>
                {isFavourite(template.id) ? t('card.favorited') : t('card.favorite')}
              </button>
            </div>
          </div>

          <div className="preview-shell">
            <div className="preview-toolbar">
              <div className="tabs" style={{ border: 'none' }}>
                {(['preview', 'readme', 'files', 'guide'] as Tab[]).map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    className={`tab ${tab === entry ? 'is-active' : ''}`}
                    onClick={() => setTab(entry)}
                  >
                    {t(`detail.tabs.${entry}`)}
                  </button>
                ))}
              </div>
              {tab === 'preview' ? (
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setFrameLight((value) => !value)}>
                  {frameLight ? 'Dark' : 'Light'}
                </button>
              ) : null}
            </div>

            {tab === 'preview' ? (
              locked ? (
                <LockOverlay
                  title={t('detail.locked.title')}
                  description={t('detail.locked.desc')}
                  ctaLabel={t('detail.locked.cta')}
                  onCta={() => navigate('/premium')}
                >
                  <GithubFrame light={frameLight} label={`${options.owner}/${options.repo} · README.md`}>
                    <ReadmePreview markdown={previewReadme} />
                  </GithubFrame>
                </LockOverlay>
              ) : (
                <GithubFrame light={frameLight} label={`${options.owner}/${options.repo} · README.md`}>
                  <ReadmePreview markdown={previewReadme} />
                </GithubFrame>
              )
            ) : null}

            {tab === 'readme' ? (
              locked ? (
                <LockOverlay
                  title={t('detail.locked.title')}
                  description={t('detail.locked.desc')}
                  ctaLabel={t('detail.locked.cta')}
                  onCta={() => navigate('/premium')}
                >
                  <CodeView code={readme.slice(0, 900)} language="markdown" maxHeight={320} />
                </LockOverlay>
              ) : (
                <>
                  <div className="spread" style={{ marginBottom: 'var(--space-3)' }}>
                    <span className="small muted">{t('common.lines', { count: readme.split('\n').length })}</span>
                    <div className="row">
                      <CopyButton
                        text={readme}
                        label={t('detail.copyReadme')}
                        copiedLabel={t('common.copied')}
                        toastMessage={t('toast.copiedReadme')}
                      />
                      <DownloadButton
                        className="btn btn--ghost btn--sm"
                        label={t('detail.downloadReadme')}
                        onDownload={() => downloadText(readme, 'README.md', 'text/markdown;charset=utf-8')}
                      />
                    </div>
                  </div>
                  <CodeView code={readme} language="markdown" />
                </>
              )
            ) : null}

            {tab === 'files' ? (
              <div className="stack">
                <div>
                  <h3 style={{ marginBottom: 6 }}>{t('detail.files.title')}</h3>
                  <p className="small muted" style={{ margin: 0 }}>
                    {t('detail.files.desc')}
                  </p>
                </div>
                <div className="asset-list">
                  {assets.map((asset) => {
                    const name = asset.path.split('/').pop() ?? asset.path;
                    const animationId = name.replace('.svg', '');
                    return (
                      <div className="asset-row" key={asset.path}>
                        <span className="asset-row__icon">
                          <IconImage size={15} />
                        </span>
                        <span className="asset-row__name">{asset.path}</span>
                        <span className="asset-row__size">{formatBytes(new Blob([asset.content]).size)}</span>
                        <div className="row" style={{ gap: 6 }}>
                          <CopyButton
                            className="btn btn--ghost btn--sm"
                            text={asset.content}
                            label="SVG"
                            copiedLabel="✓"
                            toastMessage={t('toast.copiedSvg')}
                          />
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => {
                              if (requirePremium()) return;
                              downloadSvg(asset.content, animationId);
                            }}
                          >
                            <IconDownload size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {files
                    .filter((file) => file.kind !== 'svg' && file.path !== 'README.md')
                    .map((file) => (
                      <div className="asset-row" key={file.path}>
                        <span className="asset-row__icon">
                          <IconFile size={15} />
                        </span>
                        <span className="asset-row__name">{file.path}</span>
                        <span className="asset-row__size">{formatBytes(new Blob([file.content]).size)}</span>
                      </div>
                    ))}
                </div>

                <div className="row-wrap">
                  <DownloadButton
                    label={t('detail.downloadZip')}
                    onDownload={async () => {
                      if (requirePremium()) return;
                      push(t('toast.zipBuilding'), 'info');
                      try {
                        await downloadTemplateZip(template, config, options);
                        push(t('toast.zipReady'), 'success');
                      } catch {
                        push(t('toast.error'), 'error');
                      }
                    }}
                  />
                  <span className="small muted">
                    {files.length} file · {formatBytes(totalBytes)}
                  </span>
                </div>
              </div>
            ) : null}

            {tab === 'guide' ? (
              <div className="prose">
                <h2 style={{ marginTop: 0 }}>Upload & pakai</h2>
                <ol className="small">
                  <li>Unduh ZIP, lalu ekstrak isinya.</li>
                  <li>Upload semua file ke repository GitHub kamu (folder <code>assets/</code> harus ikut).</li>
                  <li>
                    Kalau README kamu ada di root repo, biarkan jalurnya relatif seperti sekarang. Kalau kamu memakai repo
                    lain, ubah mode tautan gambar ke <strong>URL mentah GitHub</strong>.
                  </li>
                  <li>Commit, buka halaman repo — animasi langsung berjalan.</li>
                </ol>
                <h3>Mengubah teks di dalam SVG</h3>
                <p className="small">
                  Buka file <code>.svg</code> dengan editor teks, cari teksnya, ubah, dan simpan. Semua warna ada di
                  atribut <code>fill</code> / <code>stroke</code>, dan kecepatan ada di atribut <code>dur</code>.
                </p>
                <h3>Kenapa harus file SVG terpisah?</h3>
                <p className="small">
                  GitHub menghapus <code>&lt;script&gt;</code> dan <code>&lt;style&gt;</code> dari README, tapi gambar{' '}
                  <code>&lt;img&gt;</code> yang menunjuk ke file <code>.svg</code> tetap dirender lengkap — termasuk
                  animasinya.
                </p>
                <h3>Kalau gambar tidak muncul</h3>
                <ul className="small">
                  <li>Pastikan folder <code>assets/</code> benar-benar ter-upload dan jalurnya sesuai huruf besar/kecil.</li>
                  <li>
                    Kalau memakai mode URL mentah, pastikan formatnya{' '}
                    <code>https://raw.githubusercontent.com/&lt;user&gt;/&lt;repo&gt;/&lt;branch&gt;/assets/file.svg</code>.
                  </li>
                  <li>GitHub memakai cache gambar — tunggu beberapa menit atau ubah nama filenya.</li>
                </ul>
              </div>
            ) : null}
          </div>

          <div className="preview-shell">
            <div className="spread" style={{ marginBottom: 'var(--space-4)' }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>{t('detail.customize')}</h3>
                <p className="small muted" style={{ margin: 0 }}>
                  {t('detail.customizeHint')}
                </p>
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              {assets.slice(0, 2).map((asset) => (
                <div className="svg-frame checkboard" key={asset.path}>
                  <SvgPreview svg={asset.content} alt={asset.path} loading="eager" />
                </div>
              ))}
            </div>
          </div>

          <div className="preview-shell">
            <h3>{t('detail.mode')}</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <label className="field">
                <span className="field__label">{t('detail.mode')}</span>
                <select
                  className="select"
                  value={options.mode}
                  onChange={(event) => setOptions((current) => ({ ...current, mode: event.target.value as 'relative' | 'raw' }))}
                >
                  <option value="relative">{t('detail.mode.relative')}</option>
                  <option value="raw">{t('detail.mode.raw')}</option>
                </select>
              </label>
              {options.mode === 'raw' ? (
                <>
                  <label className="field">
                    <span className="field__label">{t('detail.owner')}</span>
                    <input
                      className="input"
                      value={options.owner}
                      onChange={(event) => setOptions((current) => ({ ...current, owner: event.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">{t('detail.repo')}</span>
                    <input
                      className="input"
                      value={options.repo}
                      onChange={(event) => setOptions((current) => ({ ...current, repo: event.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">{t('detail.branch')}</span>
                    <input
                      className="input"
                      value={options.branch}
                      onChange={(event) => setOptions((current) => ({ ...current, branch: event.target.value }))}
                    />
                  </label>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="detail-side">
          <div className="panel">
            <div className="panel__head">
              <span className="panel__title">{t('detail.tabs.preview')}</span>
              <span className="pill tiny">
                <IconLayers size={12} />
                {assets.length}
              </span>
            </div>
            <div className="panel__body" style={{ padding: 'var(--space-3)' }}>
              <div className="svg-frame checkboard" style={{ borderRadius: 'var(--radius-sm)' }}>
                {assets[0] ? <SvgPreview svg={assets[0].content} alt="preview" loading="eager" /> : null}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel__body sticky-actions">
              <DownloadButton
                label={t('detail.downloadZip')}
                className="btn btn--primary btn--block"
                onDownload={async () => {
                  if (requirePremium()) return;
                  push(t('toast.zipBuilding'), 'info');
                  try {
                    await downloadTemplateZip(template, config, options);
                    push(t('toast.zipReady'), 'success');
                  } catch {
                    push(t('toast.error'), 'error');
                  }
                }}
              />
              <CopyButton
                className={`btn btn--ghost btn--block ${locked ? 'is-locked' : ''}`}
                text={readme}
                label={t('detail.copyReadme')}
                copiedLabel={t('common.copied')}
                toastMessage={t('toast.copiedReadme')}
              />
              {locked ? (
                <div className="note note--warn" style={{ padding: 14 }}>
                  <div className="row small" style={{ color: 'var(--warning)', fontWeight: 700 }}>
                    <IconLock size={14} />
                    {t('detail.locked.title')}
                  </div>
                  <p className="tiny" style={{ margin: '6px 0 0', color: 'var(--muted)' }}>
                    {t('detail.locked.desc')}
                  </p>
                  <Link className="btn btn--primary btn--sm btn--block" style={{ marginTop: 10 }} to="/premium">
                    {t('detail.locked.cta')}
                  </Link>
                </div>
              ) : null}
              <div className="tiny muted">
                {files.length} file · {formatBytes(totalBytes)} · ZIP
              </div>
            </div>
          </div>

          <Customizer
            config={config}
            controls={[
              'palette',
              'accent',
              'width',
              'height',
              'speed',
              'radius',
              'density',
              'glow',
              'transparent',
              'font',
              'align',
              'title',
              'subtitle',
              'label',
            ]}
            onChange={patch}
            onReset={() => setConfig(resolveTemplateConfig(template))}
          />
        </aside>
      </div>
    </div>
  );
}
