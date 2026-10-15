/**
 * NexSolarix — shared domain types.
 *
 * Everything the gallery shows is described by three registries:
 *  - palettes   : curated colour systems
 *  - animations : parameterised animated SVG generators
 *  - templates  : README blueprints that bundle one or more animations
 */

export type Locale = 'id' | 'en';
export type Localized = Record<Locale, string>;
export type Tier = 'free' | 'premium';

export type FontKey = 'mono' | 'sans' | 'serif' | 'wide' | 'display';

export type AnimationGroup = 'banner' | 'card' | 'divider' | 'effect' | 'data';

export type TemplateCategory =
  | 'profile'
  | 'project'
  | 'portfolio'
  | 'creative'
  | 'minimal'
  | 'data';

/** Every knob a visitor can turn in the customiser. */
export type ControlKey =
  | 'palette'
  | 'accent'
  | 'width'
  | 'height'
  | 'speed'
  | 'radius'
  | 'density'
  | 'glow'
  | 'transparent'
  | 'font'
  | 'align'
  | 'title'
  | 'subtitle'
  | 'label';

export interface RenderConfig {
  paletteId: string;
  /** Optional custom accent colour (hex) that overrides the palette accent. */
  accent: string | null;
  width: number;
  height: number;
  /** Duration multiplier: 1 = authored speed, 2 = twice as slow. */
  speed: number;
  radius: number;
  /** Element-count multiplier, 1..10. */
  density: number;
  glow: boolean;
  transparent: boolean;
  font: FontKey;
  align: 'left' | 'center' | 'right';
  title: string;
  subtitle: string;
  label: string;
}

export interface Palette {
  id: string;
  name: Localized;
  tier: Tier;
  /** Short vibe description shown in the picker. */
  mood: Localized;
  /** Preview surface used by the swatch. */
  bg: string;
  bgAlt: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  accent3: string;
  /** True for palettes designed against a light background. */
  light: boolean;
}

export interface AnimationAsset {
  id: string;
  name: Localized;
  blurb: Localized;
  tier: Tier;
  group: AnimationGroup;
  tags: string[];
  controls: ControlKey[];
  defaults: Partial<RenderConfig>;
  /** Returns a complete standalone `<svg>` document string. */
  render: (config: RenderConfig) => string;
}

export interface TemplateFile {
  path: string;
  content: string;
  kind: 'markdown' | 'svg' | 'json' | 'text';
}

export interface TemplateBuildOptions {
  /** `relative` = assets sit next to the README; `raw` = absolute raw GitHub URLs. */
  mode: 'relative' | 'raw';
  owner: string;
  repo: string;
  branch: string;
  locale: Locale;
  includeGuide: boolean;
}

export interface TemplateAsset {
  id: string;
  name: Localized;
  blurb: Localized;
  tier: Tier;
  category: TemplateCategory;
  tags: string[];
  /** Animation ids shipped inside the ZIP. */
  animations: string[];
  defaults: Partial<RenderConfig>;
  buildFiles: (config: RenderConfig, options: TemplateBuildOptions) => TemplateFile[];
}

export const DEFAULT_TEMPLATE_OPTIONS: TemplateBuildOptions = {
  mode: 'relative',
  owner: 'username',
  repo: 'username',
  branch: 'main',
  locale: 'id',
  includeGuide: true,
};
