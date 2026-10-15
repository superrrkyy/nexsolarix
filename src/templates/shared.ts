import type { RenderConfig, TemplateBuildOptions, TemplateFile } from '../core/types';
import { getAnimation } from '../animations';
import { getPalette, resolveConfig } from '../core/palettes';
import { shortHash } from '../lib/hash';
import { escapeXml } from '../lib/svgkit';

export interface SvgAsset {
  id: string;
  fileName: string;
  /** Path used inside README.md (relative or raw URL). */
  reference: string;
  content: string;
}

export interface TemplateComposition {
  templateId: string;
  animations: string[];
  config: RenderConfig;
  /** The template's own defaults, used to tell "visitor changed this" apart from "untouched". */
  base?: Partial<RenderConfig>;
  options: TemplateBuildOptions;
  markdown: (assets: SvgAsset[]) => string;
  intro: { id: string; en: string };
}

/**
 * Fields where an animation's own default keeps priority until the visitor
 * actually edits that field. Sizes are handled separately (see `buildAssets`).
 */
const ANIMATION_OWNED_KEYS = ['title', 'subtitle', 'label', 'paletteId', 'font', 'align'] as const;

function clampSize(value: number, min: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.round(value));
}

export function assetFileName(animationId: string): string {
  return `${animationId}.svg`;
}

export function assetReference(fileName: string, options: TemplateBuildOptions): string {
  if (options.mode === 'raw') {
    const owner = options.owner || 'username';
    const repo = options.repo || 'username';
    const branch = options.branch || 'main';
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/assets/${fileName}`;
  }
  return `./assets/${fileName}`;
}

export function buildAssets(composition: TemplateComposition): SvgAsset[] {
  const config = composition.config;
  // The template's untouched defaults. Anything the visitor edits differs from
  // this, which is how per-asset styling stays designed while edits still win.
  const baseline = resolveConfig(composition.base ?? null);

  return composition.animations
    .map((id) => {
      const animation = getAnimation(id);
      if (!animation) return null;
      const fileName = assetFileName(id);

      // Sizes are proportional: `config.height` is the height of the template's
      // main banner, so dividers stay short and cards stay tall when the
      // visitor drags the sliders.
      const baseHeight = baseline.height || config.height;
      const baseWidth = baseline.width || config.width;
      const height = clampSize(((animation.defaults.height ?? baseHeight) / baseHeight) * config.height, 60);
      const width = clampSize(((animation.defaults.width ?? baseWidth) / baseWidth) * config.width, 240);

      const perAsset: RenderConfig = { ...config, ...animation.defaults, height, width };
      for (const key of ANIMATION_OWNED_KEYS) {
        if (config[key] !== baseline[key]) {
          // Explicit visitor edit: never let the animation's copy override it.
          Object.assign(perAsset, { [key]: config[key] });
        }
      }
      if (config.accent && (animation.defaults.accent ?? null) !== null) {
        Object.assign(perAsset, { accent: config.accent });
      }

      return {
        id,
        fileName,
        reference: assetReference(fileName, composition.options),
        content: animation.render(perAsset),
      } as SvgAsset;
    })
    .filter((asset): asset is SvgAsset => asset !== null);
}

export function buildFiles(composition: TemplateComposition): TemplateFile[] {
  const assets = buildAssets(composition);
  const palette = getPalette(composition.config.paletteId);
  const files: TemplateFile[] = [
    {
      path: 'README.md',
      kind: 'markdown',
      content: composition.markdown(assets),
    },
    ...assets.map<TemplateFile>((asset) => ({
      path: `assets/${asset.fileName}`,
      kind: 'svg',
      content: asset.content,
    })),
    {
      path: 'nexsolarix.config.json',
      kind: 'json',
      content: `${JSON.stringify(
        {
          generator: 'NexSolarix README Studio',
          version: 1,
          template: composition.templateId,
          palette: palette.id,
          paletteName: palette.name.en,
          mode: composition.options.mode,
          config: composition.config,
          animations: composition.animations,
          exportedAt: new Date().toISOString(),
          editHint: 'Change any value in `config`, then re-open the template page and paste this file back in.',
        },
        null,
        2,
      )}\n`,
    },
  ];

  if (composition.options.includeGuide) {
    files.push({
      path: 'HOW-TO.md',
      kind: 'markdown',
      content: howTo(composition, assets),
    });
  }

  return files;
}

function howTo(composition: TemplateComposition, assets: SvgAsset[]): string {
  const list = assets.map((asset) => `- \`assets/${asset.fileName}\` — ${asset.id}`).join('\n');
  const rawNote =
    composition.options.mode === 'raw'
      ? `README ini memakai URL mentah ke \`${composition.options.owner}/${composition.options.repo}\`. Pastikan folder \`assets/\` sudah di-upload ke repo itu, kalau tidak gambarnya akan pecah.`
      : 'README ini memakai jalur relatif (`./assets/...`), jadi folder `assets/` harus berada tepat di samping `README.md`.';
  const rawNoteEn =
    composition.options.mode === 'raw'
      ? `This README links to raw URLs on \`${composition.options.owner}/${composition.options.repo}\`. Upload the \`assets/\` folder to that repo or the images will break.`
      : 'This README uses relative paths (`./assets/...`), so the `assets/` folder must sit next to `README.md`.';

  return `# Cara pakai / How to use

## Bahasa Indonesia

1. Upload semua file dari ZIP ini ke repository GitHub kamu (isi ZIP ini sudah termasuk \`README.md\`).
2. ${rawNote}
3. Buka halaman profil atau repo kamu — animasi langsung berjalan, tidak perlu setting apa pun.
4. Mau ubah warna, ukuran, atau teks? Kembali ke NexSolarix, pilih template ini lagi, ubah di panel kustomisasi, lalu unduh ZIP baru.

### File di dalam paket ini
${list}
- \`nexsolarix.config.json\` — semua nilai yang kamu pilih di NexSolarix.
- \`HOW-TO.md\` — file yang sedang kamu baca.

### Tips
- **Teks di dalam SVG bisa diedit langsung.** Buka file \`.svg\` dengan editor teks, cari tulisannya, ubah, simpan. Jangan ubah nama file kalau tidak ingin mengubah jalur di \`README.md\`.
- GitHub hanya menampilkan animasi kalau gambarnya berupa **file SVG yang di-embed dengan \`<img>\`**, seperti yang sudah dipakai di sini. Kode \`<script>\` dan \`<style>\` di dalam README akan dihapus GitHub, jadi jangan pindahkan CSS ke README.
- Perubahan pada file SVG kadang butuh beberapa menit untuk muncul karena GitHub memakai cache gambar (Camo). Kalau masih terlihat versi lama, tunggu sebentar atau ubah nama filenya.
- Ukuran gambar diatur lewat atribut \`width\` pada tag \`<img>\`. Nilai \`100%\` membuat banner mengikuti lebar kolom README.

## English

1. Upload every file from this ZIP to your GitHub repository (the ZIP already includes \`README.md\`).
2. ${rawNoteEn}
3. Open your profile or repository page — the animations run immediately, no configuration needed.
4. Want different colours, sizes or text? Go back to NexSolarix, open this template again, tweak the customiser and download a fresh ZIP.

### Files in this pack
${list}
- \`nexsolarix.config.json\` — every value you picked on NexSolarix.
- \`HOW-TO.md\` — the file you are reading.

### Tips
- **Text inside an SVG is editable.** Open the \`.svg\` in any text editor, find the wording, change it, save. Keep the file names if you do not want to update the paths in \`README.md\`.
- GitHub only animates images that are **SVG files embedded with \`<img>\`**, exactly as done here. GitHub strips \`<script>\` and \`<style>\` from README markdown, so do not move the CSS into the README.
- SVG changes can take a few minutes to appear because GitHub caches images through Camo. If you still see the old version, wait a moment or rename the file.
- Image size is controlled by the \`width\` attribute on the \`<img>\` tag. \`100%\` makes a banner follow the README column width.
`;
}

/* ------------------------------------------------------------------ *
 * Markdown building blocks
 * ------------------------------------------------------------------ */

export function img(asset: SvgAsset | undefined, alt: string, width = '100%'): string {
  if (!asset) return '';
  return `<img src="${asset.reference}" alt="${escapeXml(alt)}" width="${width}" />`;
}

export function heroCenter(asset: SvgAsset | undefined, alt: string, width = '100%'): string {
  return [img(asset, alt, width), '', '<div align="center">', '', '</div>'].join('\n');
}

export function centered(lines: string[]): string {
  return ['<div align="center">', '', ...lines, '', '</div>'].join('\n');
}

export function badges(items: { label: string; message: string; color: string; logo?: string }[]): string {
  return items
    .map((item) => {
      const logo = item.logo ? `&logo=${item.logo}&logoColor=white` : '';
      return `![${item.label}](https://img.shields.io/badge/${encodeURIComponent(item.label)}-${encodeURIComponent(item.message)}-${item.color.replace('#', '')}?style=for-the-badge${logo})`;
    })
    .join(' ');
}

export function socialRow(handle: string, extra: { label: string; url: string }[] = []): string {
  const links = [
    { label: 'Instagram', url: `https://instagram.com/${handle.replace(/^@/, '')}` },
    ...extra,
  ];
  return links.map((link) => `[**${link.label}**](${link.url})`).join(' · ');
}

export function techStackTable(items: { area: string; tools: string }[]): string {
  const rows = items.map((item) => `| **${item.area}** | ${item.tools} |`).join('\n');
  return ['| Area | Tools |', '| --- | --- |', rows].join('\n');
}

export function detailsBlock(summary: string, body: string): string {
  return ['<details>', `<summary><b>${summary}</b></summary>`, '', body, '', '</details>'].join('\n');
}

export function checklist(items: { label: string; done: boolean }[]): string {
  return items.map((item) => `- [${item.done ? 'x' : ' '}] ${item.label}`).join('\n');
}

export function projectCards(items: { name: string; description: string; url: string; tag: string }[]): string {
  return items
    .map((item) => `### [${item.name}](${item.url}) · \`${item.tag}\`\n\n${item.description}`)
    .join('\n\n');
}

export function profileHeaderNote(config: RenderConfig): string {
  return `<!-- Dibuat dengan NexSolarix README Studio · template hash ${shortHash(config.paletteId + config.title)} -->\n<!-- Generated with NexSolarix README Studio. Free to edit and ship. -->`;
}

export function guidelineBlock(config: RenderConfig): string {
  return `> **Palette:** \`${getPalette(config.paletteId).name.en}\` · **Font:** \`${config.font}\` · **Generated:** ${new Date().toISOString().slice(0, 10)}`;
}

export function spacer(): string {
  return '<br />';
}

export function sectionHeading(title: string, asset?: SvgAsset): string {
  if (!asset) return `## ${title}`;
  return [`<img src="${asset.reference}" alt="${escapeXml(title)} divider" width="100%" />`, '', `## ${title}`].join('\n');
}
