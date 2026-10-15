import type { RenderConfig, TemplateAsset, TemplateBuildOptions, TemplateFile } from '../core/types';
import { DEFAULT_TEMPLATE_OPTIONS } from '../core/types';
import { resolveTemplateConfig } from '../templates';
import { createZip } from './zip';

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'nexsolarix';
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadText(content: string, filename: string, mime = 'text/plain;charset=utf-8'): void {
  triggerDownload(new Blob([content], { type: mime }), filename);
}

/** Builds every file a template ships with, using the visitor's configuration. */
export function templateFiles(
  template: TemplateAsset,
  config: Partial<RenderConfig> | null,
  options: Partial<TemplateBuildOptions> = {},
): TemplateFile[] {
  const resolved = resolveTemplateConfig(template, config);
  return template.buildFiles(resolved, { ...DEFAULT_TEMPLATE_OPTIONS, ...options });
}

export function templateReadme(
  template: TemplateAsset,
  config: Partial<RenderConfig> | null,
  options: Partial<TemplateBuildOptions> = {},
): string {
  const files = templateFiles(template, config, options);
  return files.find((file) => file.path === 'README.md')?.content ?? '';
}

export function templateSvg(
  template: TemplateAsset,
  config: Partial<RenderConfig> | null,
  animationId: string,
): string {
  const files = templateFiles(template, config);
  const match = files.find((file) => file.path === `assets/${animationId}.svg`);
  return match?.content ?? '';
}

export async function downloadTemplateZip(
  template: TemplateAsset,
  config: Partial<RenderConfig> | null,
  options: Partial<TemplateBuildOptions> = {},
): Promise<string> {
  const files = templateFiles(template, config, options);
  const bytes = await createZip(
    files.map((file) => ({ path: file.path, content: file.content })),
    { compress: true },
  );
  const filename = `nexsolarix-${slugify(template.name.en)}.zip`;
  triggerDownload(new Blob([bytes as unknown as BlobPart], { type: 'application/zip' }), filename);
  return filename;
}

export async function downloadAnimationZip(
  entries: { path: string; content: string }[],
  name: string,
): Promise<string> {
  const bytes = await createZip(entries, { compress: true });
  const filename = `nexsolarix-${slugify(name)}.zip`;
  triggerDownload(new Blob([bytes as unknown as BlobPart], { type: 'application/zip' }), filename);
  return filename;
}

export function downloadSvg(svg: string, name: string, tierLabel?: string): void {
  const suffix = tierLabel ? `-${slugify(tierLabel)}` : '';
  downloadText(svg, `nexsolarix-${slugify(name)}${suffix}.svg`, 'image/svg+xml;charset=utf-8');
}

export function downloadKeysCsv(keys: { key: string; tier: string; issuedAt: string }[]): void {
  const header = 'key,tier,issued_at';
  const rows = keys.map((entry) => `${entry.key},${entry.tier},${entry.issuedAt}`);
  downloadText([header, ...rows].join('\n'), 'nexsolarix-licence-keys.csv', 'text/csv;charset=utf-8');
}

export function svgToDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/%20/g, ' ')
    .replace(/%3D/g, '=')
    .replace(/%3A/g, ':')
    .replace(/%2F/g, '/');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export { triggerDownload };
