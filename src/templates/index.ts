import type { RenderConfig, TemplateAsset, TemplateBuildOptions, TemplateCategory, Tier } from '../core/types';
import { DEFAULT_TEMPLATE_OPTIONS } from '../core/types';
import { DEFAULT_RENDER_CONFIG, resolveConfig } from '../core/palettes';
import { FREE_TEMPLATES } from './free';
import { PREMIUM_TEMPLATES } from './premium';
import { buildAssets } from './shared';

export const ALL_TEMPLATES: TemplateAsset[] = [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES];

export const TEMPLATE_MAP: Record<string, TemplateAsset> = Object.fromEntries(
  ALL_TEMPLATES.map((template) => [template.id, template]),
);

export function getTemplate(id: string): TemplateAsset | undefined {
  return TEMPLATE_MAP[id];
}

export function templatesByTier(tier: Tier): TemplateAsset[] {
  return ALL_TEMPLATES.filter((template) => template.tier === tier);
}

export const TEMPLATE_CATEGORIES: { category: TemplateCategory; label: { id: string; en: string } }[] = [
  { category: 'profile', label: { id: 'Profil', en: 'Profile' } },
  { category: 'project', label: { id: 'Proyek', en: 'Project' } },
  { category: 'portfolio', label: { id: 'Portofolio', en: 'Portfolio' } },
  { category: 'creative', label: { id: 'Kreatif', en: 'Creative' } },
  { category: 'minimal', label: { id: 'Minimalis', en: 'Minimal' } },
  { category: 'data', label: { id: 'Data', en: 'Data' } },
];

export function templateCategoryLabel(category: TemplateCategory, locale: 'id' | 'en'): string {
  return TEMPLATE_CATEGORIES.find((entry) => entry.category === category)?.label[locale] ?? category;
}

/** Resolves the effective config for a template (template defaults + animation defaults + user config). */
export function resolveTemplateConfig(template: TemplateAsset, partial?: Partial<RenderConfig> | null): RenderConfig {
  return resolveConfig({ ...template.defaults, ...(partial ?? {}) });
}

export function buildTemplateFiles(
  template: TemplateAsset,
  config: RenderConfig,
  options: Partial<TemplateBuildOptions> = {},
) {
  return template.buildFiles(resolveTemplateConfig(template, config), {
    ...DEFAULT_TEMPLATE_OPTIONS,
    ...options,
  });
}

/** Every asset a template ships, rendered and ready to preview. */
export function buildTemplateAssets(template: TemplateAsset, config: RenderConfig) {
  return buildAssets({
    templateId: template.id,
    animations: template.animations,
    config: resolveTemplateConfig(template, config),
    options: DEFAULT_TEMPLATE_OPTIONS,
    intro: template.blurb,
    markdown: () => '',
  });
}

export function templatesForAnimation(animationId: string): TemplateAsset[] {
  return ALL_TEMPLATES.filter((template) => template.animations.includes(animationId));
}

export function defaultConfigFor(template: TemplateAsset): RenderConfig {
  return resolveTemplateConfig(template, DEFAULT_RENDER_CONFIG);
}

export { FREE_TEMPLATES, PREMIUM_TEMPLATES };
