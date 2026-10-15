/**
 * SVG toolkit.
 *
 * Every animated asset in NexSolarix is generated from these primitives so the
 * whole library shares one visual language: SMIL animation (works inside
 * `<img>` tags on GitHub), no scripts, no external references, and ids namespaced
 * per render so assets never collide.
 */

import { getPalette } from '../core/palettes';
import type { AnimationAsset, AnimationGroup, ControlKey, FontKey, Localized, Palette, RenderConfig, Tier } from '../core/types';
import { fnv1a } from './hash';

export const FONT_STACKS: Record<FontKey, string> = {
  mono: "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace",
  sans: "Inter,'Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif: "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif",
  wide: "'Arial Black','Helvetica Neue',Impact,'Segoe UI',sans-serif",
  display: "'Trebuchet MS','Segoe UI',system-ui,-apple-system,sans-serif",
};

export const FONT_WEIGHTS = { regular: 400, medium: 500, bold: 700, black: 900 } as const;

type AttrValue = string | number | boolean | undefined | null;

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function attrs(values: Record<string, AttrValue>): string {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => ` ${key}="${typeof value === 'boolean' ? (value ? 'true' : 'false') : escapeXml(String(value))}"`)
    .join('');
}

export function h(tag: string, values: Record<string, AttrValue> = {}, kids: string | string[] = ''): string {
  const body = Array.isArray(kids) ? kids.join('') : kids;
  if (!body) return `<${tag}${attrs(values)}/>`;
  return `<${tag}${attrs(values)}>${body}</${tag}>`;
}

export const el = h;

export interface GradientStop {
  offset: string | number;
  color: string;
  opacity?: number;
}

export function linearGradient(
  id: string,
  stops: GradientStop[],
  options: { x1?: string | number; y1?: string | number; x2?: string | number; y2?: string | number; spread?: string; gradientUnits?: string } = {},
): string {
  const body = stops
    .map((item) => h('stop', { offset: item.offset, 'stop-color': item.color, 'stop-opacity': item.opacity }))
    .join('');
  return h(
    'linearGradient',
    {
      id,
      x1: options.x1 ?? '0%',
      y1: options.y1 ?? '0%',
      x2: options.x2 ?? '100%',
      y2: options.y2 ?? '0%',
      spreadMethod: options.spread,
      gradientUnits: options.gradientUnits,
    },
    body,
  );
}

export function radialGradient(
  id: string,
  stops: GradientStop[],
  options: { cx?: string | number; cy?: string | number; r?: string | number; fx?: string | number; fy?: string | number; gradientUnits?: string } = {},
): string {
  const body = stops
    .map((item) => h('stop', { offset: item.offset, 'stop-color': item.color, 'stop-opacity': item.opacity }))
    .join('');
  return h(
    'radialGradient',
    {
      id,
      cx: options.cx ?? '50%',
      cy: options.cy ?? '50%',
      r: options.r ?? '50%',
      fx: options.fx,
      fy: options.fy,
      gradientUnits: options.gradientUnits,
    },
    body,
  );
}

export function blurFilter(id: string, deviation: number): string {
  return h('filter', { id, x: '-30%', y: '-30%', width: '160%', height: '160%' }, h('feGaussianBlur', { stdDeviation: deviation }));
}

export function glowFilter(id: string, deviation = 4, intensity = 1.1): string {
  return h(
    'filter',
    { id, x: '-60%', y: '-60%', width: '220%', height: '220%' },
    [
      h('feGaussianBlur', { stdDeviation: deviation, result: 'blur' }),
      h('feMerge', {}, [
        h('feMergeNode', { in: 'blur' }),
        h('feMergeNode', { in: 'blur' }),
        h('feMergeNode', { in: 'SourceGraphic' }),
      ]),
      h('feComponentTransfer', {}, h('feFuncA', { type: 'linear', slope: intensity, intercept: 0 })),
    ].join(''),
  );
}

export interface AnimateOptions {
  dur: string;
  begin?: string;
  repeatCount?: string;
  values?: string;
  from?: string;
  to?: string;
  calcMode?: 'linear' | 'spline' | 'discrete' | 'paced';
  keyTimes?: string;
  keySplines?: string;
  fill?: 'freeze' | 'remove';
  additive?: 'sum' | 'replace';
  attributeType?: string;
  restart?: string;
}

export function animate(attributeName: string, options: AnimateOptions): string {
  return h('animate', {
    attributeName,
    dur: options.dur,
    begin: options.begin ?? '0s',
    repeatCount: options.repeatCount ?? 'indefinite',
    values: options.values,
    from: options.from,
    to: options.to,
    calcMode: options.calcMode,
    keyTimes: options.keyTimes,
    keySplines: options.keySplines,
    fill: options.fill,
    additive: options.additive,
    attributeType: options.attributeType,
    restart: options.restart,
  });
}

export function animateTransform(
  type: 'translate' | 'scale' | 'rotate' | 'skewX' | 'skewY',
  options: AnimateOptions,
): string {
  return h('animateTransform', {
    attributeName: 'transform',
    type,
    dur: options.dur,
    begin: options.begin ?? '0s',
    repeatCount: options.repeatCount ?? 'indefinite',
    values: options.values,
    from: options.from,
    to: options.to,
    calcMode: options.calcMode,
    keyTimes: options.keyTimes,
    keySplines: options.keySplines,
    fill: options.fill,
    additive: options.additive,
  });
}

export interface TextOptions {
  x: number;
  y: number;
  size: number;
  fill: string;
  font: string;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  letterSpacing?: number;
  opacity?: number;
  transform?: string;
  filter?: string;
  className?: string;
  extra?: string;
}

export function textEl(content: string, options: TextOptions): string {
  return h(
    'text',
    {
      x: options.x,
      y: options.y,
      'font-family': options.font,
      'font-size': options.size,
      'font-weight': options.weight,
      fill: options.fill,
      'text-anchor': options.anchor ?? 'middle',
      'letter-spacing': options.letterSpacing,
      opacity: options.opacity,
      transform: options.transform,
      filter: options.filter,
      class: options.className,
    },
    `${escapeXml(content)}${options.extra ?? ''}`,
  );
}

/* ------------------------------------------------------------------ *
 * Text measurement — keeps generated copy inside its container
 * ------------------------------------------------------------------ */

/**
 * Rough advance-width factors per font family. SVG has no layout engine, so
 * lines are laid out by hand; these numbers are conservative (slightly wide)
 * so text errs on the side of being shortened rather than overlapping.
 */
const WIDTH_FACTORS: Record<FontKey, number> = {
  mono: 0.62,
  sans: 0.55,
  serif: 0.52,
  wide: 0.68,
  display: 0.58,
};

export function estimateTextWidth(text: string, size: number, fontKey: FontKey, weight = 400): number {
  const factor = WIDTH_FACTORS[fontKey] ?? WIDTH_FACTORS.mono;
  // Heavier weights and uppercase runs are wider.
  const weightBoost = weight >= 700 ? 1.05 : 1;
  const upperRatio = text.length ? (text.replace(/[^A-Z]/g, '').length / text.length) * 0.08 : 0;
  return text.length * size * factor * weightBoost * (1 + upperRatio);
}

/** Shortens `text` with an ellipsis so it fits `maxWidth` at the given size. */
export function fitText(text: string, maxWidth: number, size: number, fontKey: FontKey, weight = 400): string {
  if (maxWidth <= 0) return '';
  if (estimateTextWidth(text, size, fontKey, weight) <= maxWidth) return text;

  const ellipsis = '…';
  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const candidate = `${text.slice(0, mid).trimEnd()}${ellipsis}`;
    if (estimateTextWidth(candidate, size, fontKey, weight) <= maxWidth) low = mid;
    else high = mid - 1;
  }
  return low <= 0 ? '' : `${text.slice(0, low).trimEnd()}${ellipsis}`;
}

/* ------------------------------------------------------------------ *
 * Seeded randomness — every particle cloud is reproducible.
 * ------------------------------------------------------------------ */

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFrom(value: string): number {
  return fnv1a(value);
}

/* ------------------------------------------------------------------ *
 * Render context
 * ------------------------------------------------------------------ */

export interface RenderCtx {
  animationId: string;
  config: RenderConfig;
  palette: Palette;
  W: number;
  H: number;
  uid: string;
  font: string;
  bg: string;
  bgAlt: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  g1: string;
  g2: string;
  g3: string;
  glow: boolean;
  align: 'left' | 'center' | 'right';
  rng: () => number;
  addDef: (markup: string) => string;
  defs: string[];
  dev: (base: number, kind?: 'w' | 'h') => number;
  dur: (base: number) => string;
  repeat: (base: number) => number;
  id: (suffix: string) => string;
  /** Background rectangle honouring transparency + radius. */
  backdrop: (overrides?: { rx?: number; fill?: string; opacity?: number }) => string;
  anchorX: (offset?: number) => number;
  titleText: (content?: string, options?: Partial<TextOptions>) => string;
  subtitleText: (content?: string, options?: Partial<TextOptions>) => string;
  labelText: (content?: string, options?: Partial<TextOptions>) => string;
  /** Estimated advance width of `text` at `size`, for manual layout. */
  width: (text: string, size: number, weight?: number) => number;
  /** Same text, shortened with an ellipsis so it fits `maxWidth`. */
  fit: (text: string, maxWidth: number, size: number, weight?: number) => string;
  /** Shrinks the font down to `minSize` first, then truncates if still too long. */
  fitSize: (
    text: string,
    maxWidth: number,
    size: number,
    weight?: number,
    minSize?: number,
  ) => { text: string; size: number };
  /** Particles band across the full width. */
  starField: (options: { count?: number; minR?: number; maxR?: number; opacity?: number; twinkle?: boolean; colors?: string[]; padding?: number; className?: string }) => string;
  scanlines: (options?: { count?: number; opacity?: number; spacing?: number }) => string;
  vignette: (opacity?: number) => string;
  noise: (opacity?: number) => string;
  frame: (options?: { rx?: number; stroke?: string; inset?: number; glow?: boolean }) => string;
  chips: (items: string[], options?: { y?: number; size?: number; gap?: number; align?: 'start' | 'center' }) => string;
  heading(text: string, options?: { y?: number; size?: number; fill?: string; weight?: number; letterSpacing?: number; filter?: string; extra?: string }): string;
}

export function createRenderCtx(animationId: string, config: RenderConfig): RenderCtx {
  const palette = getPalette(config.paletteId);
  const W = Math.max(240, Math.round(config.width));
  const H = Math.max(80, Math.round(config.height));
  const uid = `${animationId}-${fnv1a(`${palette.id}:${W}x${H}:${config.density}`).toString(36)}`;
  const defs: string[] = [];

  const ctx: RenderCtx = {
    animationId,
    config,
    palette,
    W,
    H,
    uid,
    font: FONT_STACKS[config.font],
    bg: config.transparent ? 'none' : palette.bg,
    bgAlt: palette.bgAlt,
    surface: palette.surface,
    border: palette.border,
    text: palette.text,
    muted: palette.muted,
    g1: config.accent ?? palette.accent,
    g2: palette.accent2,
    g3: palette.accent3,
    glow: config.glow,
    align: config.align,
    rng: mulberry32(seedFrom(uid)),
    defs,
    addDef(markup) {
      defs.push(markup);
      return markup;
    },
    dev(base, kind = 'w') {
      const scale = kind === 'w' ? W / 900 : H / 280;
      return Math.round(base * Math.max(0.35, Math.min(scale, 2.6)));
    },
    dur(base) {
      const seconds = Math.max(0.35, base * config.speed);
      return `${Number(seconds.toFixed(2))}s`;
    },
    repeat(base) {
      return Math.max(1, Math.round(base));
    },
    id(suffix) {
      return `${uid}-${suffix}`;
    },
    backdrop(overrides = {}) {
      if (config.transparent) return '';
      return h('rect', {
        x: 0,
        y: 0,
        width: W,
        height: H,
        rx: overrides.rx ?? config.radius,
        fill: overrides.fill ?? `url(#${ctx.id('bg')})`,
        opacity: overrides.opacity,
      });
    },
    width(text, size, weight = 400) {
      return estimateTextWidth(text, size, config.font, weight);
    },
    fit(text, maxWidth, size, weight = 400) {
      return fitText(text, maxWidth, size, config.font, weight);
    },
    fitSize(text, maxWidth, size, weight = 400, minSize) {
      const floor = Math.max(6, minSize ?? size * 0.7);
      let current = size;
      while (current > floor && estimateTextWidth(text, current, config.font, weight) > maxWidth) {
        current = Math.max(floor, current - 0.5);
      }
      return { text: fitText(text, maxWidth, current, config.font, weight), size: current };
    },
    anchorX(offset = 0) {
      const inset = 56 + offset;
      if (config.align === 'left') return inset;
      if (config.align === 'right') return W - inset;
      return W / 2;
    },
    titleText(content, options = {}) {
      const size = options.size ?? ctx.dev(46, 'h');
      return textEl(content ?? config.title, {
        x: options.x ?? ctx.anchorX(),
        y: options.y ?? H * 0.52,
        size,
        fill: options.fill ?? ctx.text,
        font: ctx.font,
        weight: options.weight ?? 800,
        anchor: options.anchor ?? (config.align === 'left' ? 'start' : config.align === 'right' ? 'end' : 'middle'),
        letterSpacing: options.letterSpacing ?? size * 0.06,
        filter: options.filter,
        opacity: options.opacity,
        transform: options.transform,
        className: options.className,
        extra: options.extra,
      });
    },
    subtitleText(content, options = {}) {
      const size = options.size ?? ctx.dev(19, 'h');
      return textEl(content ?? config.subtitle, {
        x: options.x ?? ctx.anchorX(),
        y: options.y ?? H * 0.74,
        size,
        fill: options.fill ?? ctx.muted,
        font: options.font ?? ctx.font,
        weight: options.weight ?? 500,
        anchor: options.anchor ?? (config.align === 'left' ? 'start' : config.align === 'right' ? 'end' : 'middle'),
        letterSpacing: options.letterSpacing ?? size * 0.04,
        opacity: options.opacity,
        transform: options.transform,
        filter: options.filter,
        className: options.className,
        extra: options.extra,
      });
    },
    labelText(content, options = {}) {
      const size = options.size ?? ctx.dev(15, 'h');
      return textEl(content ?? config.label, {
        x: options.x ?? ctx.anchorX(),
        y: options.y ?? H * 0.88,
        size,
        fill: options.fill ?? ctx.g1,
        font: options.font ?? ctx.font,
        weight: options.weight ?? 600,
        anchor: options.anchor ?? (config.align === 'left' ? 'start' : config.align === 'right' ? 'end' : 'middle'),
        letterSpacing: options.letterSpacing ?? size * 0.16,
        opacity: options.opacity,
        transform: options.transform,
        className: options.className,
        extra: options.extra,
      });
    },
    starField(options) {
      return buildStarField(ctx, options);
    },
    scanlines(options) {
      return buildScanlines(ctx, options);
    },
    vignette(opacity = 0.55) {
      if (config.transparent) return '';
      ctx.addDef(radialGradient(ctx.id('vig'), [
        { offset: '55%', color: '#000000', opacity: 0 },
        { offset: '100%', color: '#000000', opacity },
      ]));
      return h('rect', { x: 0, y: 0, width: W, height: H, fill: `url(#${ctx.id('vig')})`, rx: config.radius });
    },
    noise(opacity = 0.05) {
      ctx.addDef(
        h('filter', { id: ctx.id('noise') }, [
          h('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.9', numOctaves: 2, stitchTiles: 'stitch' }),
          h('feColorMatrix', { type: 'saturate', values: 0 }),
        ].join('')),
      );
      return h('rect', {
        x: 0,
        y: 0,
        width: W,
        height: H,
        filter: `url(#${ctx.id('noise')})`,
        opacity,
        'pointer-events': 'none',
      });
    },
    frame(options = {}) {
      const inset = options.inset ?? 8;
      return h('rect', {
        x: inset,
        y: inset,
        width: W - inset * 2,
        height: H - inset * 2,
        rx: options.rx ?? Math.max(4, config.radius - inset / 2),
        fill: 'none',
        stroke: options.stroke ?? ctx.border,
        'stroke-width': 1.5,
        filter: options.glow && ctx.glow ? `url(#${ctx.id('glow')})` : undefined,
      });
    },
    chips(items, options = {}) {
      const size = options.size ?? ctx.dev(13, 'h');
      const gap = options.gap ?? size * 1.5;
      const estimates = items.map((item) => item.length * size * 0.62 + size * 1.6);
      const total = estimates.reduce((sum, value) => sum + value, 0) + gap * (items.length - 1);
      let cursor = options.align === 'start' ? 0 : (W - total) / 2;
      const y = options.y ?? H - size * 2.6;
      const parts = items.map((item, index) => {
        const width = estimates[index] as number;
        const block = [
          h('rect', {
            x: cursor,
            y: y - size * 1.15,
            width,
            height: size * 2.3,
            rx: size,
            fill: ctx.surface,
            stroke: ctx.border,
            'stroke-width': 1,
          }),
          textEl(item, {
            x: cursor + width / 2,
            y: y + size * 0.45,
            size,
            fill: ctx.muted,
            font: ctx.font,
            weight: 600,
            anchor: 'middle',
            letterSpacing: size * 0.04,
          }),
        ].join('');
        cursor += width + gap;
        return block;
      });
      return parts.join('');
    },
    heading(text, options = {}) {
      const size = options.size ?? ctx.dev(34, 'h');
      return textEl(text, {
        x: ctx.anchorX(),
        y: options.y ?? H * 0.5,
        size,
        fill: options.fill ?? ctx.text,
        font: ctx.font,
        weight: options.weight ?? 800,
        anchor: ctx.align === 'left' ? 'start' : ctx.align === 'right' ? 'end' : 'middle',
        letterSpacing: options.letterSpacing ?? size * 0.1,
        filter: options.filter,
        extra: options.extra,
      });
    },
  };

  return ctx;
}

function buildStarField(
  ctx: RenderCtx,
  options: {
    count?: number;
    minR?: number;
    maxR?: number;
    opacity?: number;
    twinkle?: boolean;
    colors?: string[];
    padding?: number;
    className?: string;
  },
): string {
  const count = Math.max(1, Math.round((options.count ?? 46) * (ctx.config.density / 5)));
  const colors = options.colors ?? [ctx.text, ctx.g1, ctx.g2, ctx.g3];
  const padding = options.padding ?? 0;
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = padding + ctx.rng() * (ctx.W - padding * 2);
    const y = padding + ctx.rng() * (ctx.H - padding * 2);
    const r = (options.minR ?? 0.7) + ctx.rng() * ((options.maxR ?? 1.9) - (options.minR ?? 0.7));
    const color = colors[Math.floor(ctx.rng() * colors.length)] as string;
    const baseOpacity = (options.opacity ?? 0.75) * (0.45 + ctx.rng() * 0.55);
    const twinkle = options.twinkle ?? true;
    const circle = h('circle', {
      cx: x.toFixed(2),
      cy: y.toFixed(2),
      r: r.toFixed(2),
      fill: color,
      opacity: baseOpacity.toFixed(2),
      class: options.className,
    });
    if (!twinkle) {
      parts.push(circle);
      continue;
    }
    const dur = (1.8 + ctx.rng() * 3.4) * ctx.config.speed;
    const begin = (-ctx.rng() * 6).toFixed(2);
    parts.push(
      h('circle', { cx: x.toFixed(2), cy: y.toFixed(2), r: r.toFixed(2), fill: color, opacity: baseOpacity.toFixed(2) }, [
        h('animate', {
          attributeName: 'opacity',
          values: `${baseOpacity.toFixed(2)};${Math.min(1, baseOpacity * 1.9).toFixed(2)};${baseOpacity.toFixed(2)}`,
          dur: `${dur.toFixed(2)}s`,
          begin: `${begin}s`,
          repeatCount: 'indefinite',
        }),
        h('animate', {
          attributeName: 'r',
          values: `${r.toFixed(2)};${(r * 1.35).toFixed(2)};${r.toFixed(2)}`,
          dur: `${dur.toFixed(2)}s`,
          begin: `${begin}s`,
          repeatCount: 'indefinite',
        }),
      ].join('')),
    );
  }
  return parts.join('');
}

function buildScanlines(ctx: RenderCtx, options: { count?: number; opacity?: number; spacing?: number } = {}): string {
  const spacing = options.spacing ?? 4;
  const count = options.count ?? Math.ceil(ctx.H / spacing);
  const rows: string[] = [];
  for (let i = 0; i < count; i += 1) {
    rows.push(
      h('rect', {
        x: 0,
        y: (i * spacing).toFixed(1),
        width: ctx.W,
        height: 1,
        fill: ctx.text,
        opacity: (options.opacity ?? 0.05).toFixed(3),
      }),
    );
  }
  return rows.join('');
}

/* ------------------------------------------------------------------ *
 * Asset factory
 * ------------------------------------------------------------------ */

export interface AnimationDefinition {
  id: string;
  name: Localized;
  blurb: Localized;
  tier: Tier;
  group: AnimationGroup;
  tags: string[];
  controls?: ControlKey[];
  defaults?: Partial<RenderConfig>;
  aria: string;
  extraDefs?: (ctx: RenderCtx) => string;
  body: (ctx: RenderCtx) => string;
}

const DEFAULT_CONTROLS: ControlKey[] = ['palette', 'accent', 'width', 'height', 'speed', 'radius', 'density', 'glow', 'transparent', 'font', 'align'];

/** Wraps a body builder into a complete, standalone SVG document. */
export function buildSvgDocument(
  ctx: RenderCtx,
  options: { aria: string; body: string; background?: boolean; extraDefs?: string },
): string {
  const commonDefs = [
    linearGradient(ctx.id('bg'), [
      { offset: '0%', color: ctx.bgAlt },
      { offset: '45%', color: ctx.bg === 'none' ? ctx.bgAlt : ctx.bg },
      { offset: '100%', color: ctx.bgAlt },
    ]),
    linearGradient(ctx.id('accent'), [
      { offset: '0%', color: ctx.g1 },
      { offset: '50%', color: ctx.g2 },
      { offset: '100%', color: ctx.g3 },
    ]),
    glowFilter(ctx.id('glow'), ctx.dev(3.2, 'h') / 4, 1.15),
    blurFilter(ctx.id('soft'), ctx.dev(14, 'h') / 4),
    blurFilter(ctx.id('soft-lg'), ctx.dev(38, 'h') / 4),
  ].join('');

  const background = options.background === false ? '' : ctx.backdrop();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ctx.W}" height="${ctx.H}" viewBox="0 0 ${ctx.W} ${ctx.H}" role="img" aria-label="${escapeXml(options.aria)}" preserveAspectRatio="xMidYMid meet"><title>${escapeXml(options.aria)}</title><defs>${commonDefs}${options.extraDefs ?? ''}${ctx.defs.join('')}</defs>${background}${options.body}</svg>`;
}

export function defineAnimation(definition: AnimationDefinition): AnimationAsset {
  const controls = definition.controls ?? DEFAULT_CONTROLS;
  const extras = definition.extraDefs;
  return {
    id: definition.id,
    name: definition.name,
    blurb: definition.blurb,
    tier: definition.tier,
    group: definition.group,
    tags: definition.tags,
    controls,
    defaults: definition.defaults ?? {},
    render(config) {
      const ctx = createRenderCtx(definition.id, config);
      const body = definition.body(ctx);
      return buildSvgDocument(ctx, {
        aria: definition.aria,
        body,
        extraDefs: extras ? extras(ctx) : '',
      });
    },
  };
}

/* ------------------------------------------------------------------ *
 * Shared decorative composites used by several animations
 * ------------------------------------------------------------------ */

export function softBlob(
  ctx: RenderCtx,
  options: { cx: number; cy: number; r: number; color: string; opacity?: number; dur: number; drift?: number; blur?: 'soft' | 'soft-lg' | 'none' },
): string {
  const { cx, cy, r, color, dur, drift = 26 } = options;
  const filterId = `url(#${ctx.id(options.blur === 'none' ? 'glow' : (options.blur ?? 'soft'))})`;
  return h(
    'circle',
    { cx, cy, r, fill: color, opacity: options.opacity ?? 0.5, filter: filterId },
    [
      h('animate', {
        attributeName: 'cx',
        values: `${cx};${cx + drift};${cx - drift * 0.6};${cx}`,
        dur: ctx.dur(dur),
        repeatCount: 'indefinite',
        calcMode: 'spline',
        keyTimes: '0;0.34;0.67;1',
        keySplines: '0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1',
      }),
      h('animate', {
        attributeName: 'cy',
        values: `${cy};${cy - drift * 0.7};${cy + drift * 0.5};${cy}`,
        dur: ctx.dur(dur * 1.18),
        repeatCount: 'indefinite',
        calcMode: 'spline',
        keyTimes: '0;0.34;0.67;1',
        keySplines: '0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1',
      }),
      h('animate', {
        attributeName: 'r',
        values: `${r};${(r * 1.14).toFixed(1)};${(r * 0.92).toFixed(1)};${r}`,
        dur: ctx.dur(dur * 0.83),
        repeatCount: 'indefinite',
        calcMode: 'spline',
        keyTimes: '0;0.34;0.67;1',
        keySplines: '0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1',
      }),
    ].join(''),
  );
}

export function shimmerBand(
  ctx: RenderCtx,
  options: { y: number; height: number; dur?: number; opacity?: number; width?: number; color?: string },
): string {
  const id = ctx.id(`shimmer-${Math.round(options.y)}`);
  const bandWidth = options.width ?? ctx.W * 0.28;
  ctx.addDef(
    linearGradient(
      id,
      [
        { offset: '0%', color: options.color ?? ctx.text, opacity: 0 },
        { offset: '50%', color: options.color ?? ctx.text, opacity: options.opacity ?? 0.55 },
        { offset: '100%', color: options.color ?? ctx.text, opacity: 0 },
      ],
      { gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: bandWidth, y2: 0 },
    ),
  );
  return h(
    'rect',
    { y: options.y, width: bandWidth, height: options.height, fill: `url(#${id})`, transform: `translate(${-bandWidth} 0)` },
    [
      h('animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        values: `${-bandWidth} 0;${ctx.W} 0`,
        dur: ctx.dur(options.dur ?? 3.6),
        repeatCount: 'indefinite',
      }),
    ].join(''),
  );
}

/** Concentric arc used by radar / rings / gauges. */
export function ring(
  ctx: RenderCtx,
  options: { cx: number; cy: number; r: number; stroke: string; width?: number; opacity?: number; dash?: string; rotate?: number; glow?: boolean },
): string {
  return h('circle', {
    cx: options.cx,
    cy: options.cy,
    r: options.r,
    fill: 'none',
    stroke: options.stroke,
    'stroke-width': options.width ?? 1.4,
    opacity: options.opacity ?? 0.6,
    'stroke-dasharray': options.dash,
    transform: options.rotate ? `rotate(${options.rotate} ${options.cx} ${options.cy})` : undefined,
    filter: options.glow && ctx.glow ? `url(#${ctx.id('glow')})` : undefined,
  });
}

/** Animated progress arc (stroke-dashoffset). */
export function progressArc(
  ctx: RenderCtx,
  options: {
    cx: number;
    cy: number;
    r: number;
    percent: number;
    color: string;
    track: string;
    width?: number;
    dur?: number;
    begin?: string;
    linecap?: 'round' | 'butt';
  },
): string {
  const circumference = 2 * Math.PI * options.r;
  const fraction = Math.max(0, Math.min(1, options.percent / 100));
  const on = circumference * fraction;
  const strokeWidth = options.width ?? 6;
  return [
    h('circle', {
      cx: options.cx,
      cy: options.cy,
      r: options.r,
      fill: 'none',
      stroke: options.track,
      'stroke-width': strokeWidth,
      opacity: 0.45,
    }),
    h(
      'circle',
      {
        cx: options.cx,
        cy: options.cy,
        r: options.r,
        fill: 'none',
        stroke: options.color,
        'stroke-width': strokeWidth,
        'stroke-linecap': options.linecap ?? 'round',
        'stroke-dasharray': `${on.toFixed(2)} ${(circumference - on).toFixed(2)}`,
        transform: `rotate(-90 ${options.cx} ${options.cy})`,
      },
      [
        h('animate', {
          attributeName: 'stroke-dasharray',
          values: `0 ${circumference.toFixed(2)};${on.toFixed(2)} ${(circumference - on).toFixed(2)};${on.toFixed(2)} ${(circumference - on).toFixed(2)};0 ${circumference.toFixed(2)}`,
          dur: ctx.dur(options.dur ?? 4),
          begin: options.begin ?? '0s',
          repeatCount: 'indefinite',
          calcMode: 'spline',
          keyTimes: '0;0.28;0.78;1',
          keySplines: '0.2 0.8 0.2 1;0 0 1 1;0.5 0 0.8 0.5',
        }),
      ].join(''),
    ),
  ].join('');
}

export function equalizerBars(
  ctx: RenderCtx,
  options: { x: number; y: number; width: number; height: number; bars?: number; color?: string; gap?: number; rounded?: number; base?: number; dur?: number },
): string {
  const bars = Math.max(3, Math.round((options.bars ?? 28) * Math.min(1.6, ctx.config.density / 5)));
  const gap = options.gap ?? 4;
  const barWidth = Math.max(1.4, (options.width - gap * (bars - 1)) / bars);
  const parts: string[] = [];
  for (let i = 0; i < bars; i += 1) {
    const peak = 0.22 + ctx.rng() * 0.78;
    const low = (options.base ?? 0.18) + ctx.rng() * 0.2;
    const x = options.x + i * (barWidth + gap);
    const fullHeight = options.height * peak;
    const shortHeight = options.height * low;
    const color = options.color ?? ctx.g2;
    parts.push(
      h(
        'rect',
        {
          x: x.toFixed(2),
          y: options.y,
          width: barWidth.toFixed(2),
          height: fullHeight.toFixed(2),
          rx: options.rounded ?? Math.min(barWidth / 2, 3),
          fill: color,
          opacity: 0.9,
        },
        [
          h('animate', {
            attributeName: 'height',
            values: `${shortHeight.toFixed(1)};${fullHeight.toFixed(1)};${(fullHeight * 0.62).toFixed(1)};${shortHeight.toFixed(1)}`,
            dur: ctx.dur((options.dur ?? 1.6) * (0.7 + ctx.rng() * 0.9)),
            begin: `${(-ctx.rng() * 2).toFixed(2)}s`,
            repeatCount: 'indefinite',
            calcMode: 'spline',
            keyTimes: '0;0.32;0.66;1',
            keySplines: '0.3 0.8 0.3 1;0.3 0.8 0.3 1;0.3 0.8 0.3 1',
          }),
          h('animate', {
            attributeName: 'y',
            values: `${(options.y + options.height - shortHeight).toFixed(1)};${(options.y + options.height - fullHeight).toFixed(1)};${(options.y + options.height - fullHeight * 0.62).toFixed(1)};${(options.y + options.height - shortHeight).toFixed(1)}`,
            dur: ctx.dur((options.dur ?? 1.6) * (0.7 + ctx.rng() * 0.9)),
            begin: `${(-ctx.rng() * 2).toFixed(2)}s`,
            repeatCount: 'indefinite',
            calcMode: 'spline',
            keyTimes: '0;0.32;0.66;1',
            keySplines: '0.3 0.8 0.3 1;0.3 0.8 0.3 1;0.3 0.8 0.3 1',
          }),
        ].join(''),
      ),
    );
  }
  return parts.join('');
}

export function particleCloud(
  ctx: RenderCtx,
  options: {
    count?: number;
    minR?: number;
    maxR?: number;
    colors?: string[];
    opacity?: number;
    dur?: number;
    driftY?: number;
    connect?: boolean;
    connectDistance?: number;
  },
): string {
  const count = Math.max(2, Math.round((options.count ?? 34) * (ctx.config.density / 5)));
  const colors = options.colors ?? [ctx.g1, ctx.g2, ctx.g3];
  const points: { x: number; y: number; r: number; color: string; dur: number; drift: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    points.push({
      x: ctx.rng() * ctx.W,
      y: ctx.rng() * ctx.H,
      r: (options.minR ?? 1.2) + ctx.rng() * ((options.maxR ?? 3.2) - (options.minR ?? 1.2)),
      color: colors[Math.floor(ctx.rng() * colors.length)] as string,
      dur: 4 + ctx.rng() * 6,
      drift: 8 + ctx.rng() * 26,
    });
  }

  const nodes = points
    .map((point) =>
      h(
        'circle',
        {
          cx: point.x.toFixed(2),
          cy: point.y.toFixed(2),
          r: point.r.toFixed(2),
          fill: point.color,
          opacity: (options.opacity ?? 0.85).toFixed(2),
        },
        [
          h('animate', {
            attributeName: 'cy',
            values: `${point.y.toFixed(2)};${(point.y - (options.driftY ?? point.drift)).toFixed(2)};${point.y.toFixed(2)}`,
            dur: ctx.dur(point.dur),
            repeatCount: 'indefinite',
            calcMode: 'spline',
            keyTimes: '0;0.5;1',
            keySplines: '0.4 0 0.6 1;0.4 0 0.6 1',
          }),
          h('animate', {
            attributeName: 'opacity',
            values: `${(options.opacity ?? 0.85).toFixed(2)};0.25;${(options.opacity ?? 0.85).toFixed(2)}`,
            dur: ctx.dur(point.dur * 0.8),
            repeatCount: 'indefinite',
          }),
        ].join(''),
      ),
    )
    .join('');

  if (!options.connect || points.length < 3) return nodes;

  const threshold = options.connectDistance ?? Math.min(ctx.W, ctx.H) * 0.22;
  const links: string[] = [];
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const a = points[i] as (typeof points)[number];
      const b = points[j] as (typeof points)[number];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance > threshold) continue;
      const opacity = (1 - distance / threshold) * 0.4;
      links.push(
        h(
          'line',
          {
            x1: a.x.toFixed(2),
            y1: a.y.toFixed(2),
            x2: b.x.toFixed(2),
            y2: b.y.toFixed(2),
            stroke: ctx.g2,
            'stroke-width': 0.9,
            opacity: opacity.toFixed(2),
          },
          [
            h('animate', {
              attributeName: 'opacity',
              values: `${opacity.toFixed(2)};${(opacity * 0.35).toFixed(2)};${opacity.toFixed(2)}`,
              dur: ctx.dur(3.4 + (i + j) * 0.12),
              repeatCount: 'indefinite',
            }),
          ].join(''),
        ),
      );
    }
  }
  return `${links.join('')}${nodes}`;
}

/** A github-ish "card" chrome used by several card animations. */
export function panelChrome(
  ctx: RenderCtx,
  options: { x: number; y: number; width: number; height: number; rx?: number; fill?: string; stroke?: string; title?: string; dots?: boolean },
): string {
  const rx = options.rx ?? Math.max(6, ctx.config.radius * 0.7);
  const parts = [
    h('rect', {
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
      rx,
      fill: options.fill ?? ctx.surface,
      stroke: options.stroke ?? ctx.border,
      'stroke-width': 1.2,
    }),
  ];
  if (options.dots !== false) {
    const colors = ['#ff5f57', '#febc2e', '#28c840'];
    colors.forEach((color, index) => {
      parts.push(h('circle', { cx: options.x + 20 + index * 16, cy: options.y + 20, r: 4.6, fill: color, opacity: 0.9 }));
    });
  }
  if (options.title) {
    parts.push(
      textEl(options.title, {
        x: options.x + options.width / 2,
        y: options.y + 24.5,
        size: Math.max(10, ctx.dev(12, 'h') * 0.9),
        fill: ctx.muted,
        font: ctx.font,
        weight: 600,
        anchor: 'middle',
        letterSpacing: 0.6,
      }),
    );
  }
  return parts.join('');
}

/** Deterministic code-ish lines for terminal / editor visuals. */
export function codeLines(
  ctx: RenderCtx,
  options: { x: number; y: number; width: number; rows: number; lineHeight: number; colors?: string[]; minRatio?: number; maxRatio?: number },
): { markup: string; colors: string[] } {
  const palette = options.colors ?? [ctx.g2, ctx.g1, ctx.g3, ctx.muted, ctx.text];
  const rows: string[] = [];
  const used: string[] = [];
  for (let i = 0; i < options.rows; i += 1) {
    const ratio = (options.minRatio ?? 0.28) + ctx.rng() * ((options.maxRatio ?? 0.92) - (options.minRatio ?? 0.28));
    const color = palette[Math.floor(ctx.rng() * palette.length)] as string;
    const indent = Math.round(ctx.rng() * 2) * options.lineHeight * 0.85;
    used.push(color);
    rows.push(
      h('rect', {
        x: options.x + indent,
        y: options.y + i * options.lineHeight,
        width: (options.width - indent) * ratio,
        height: Math.max(2, options.lineHeight * 0.34),
        rx: options.lineHeight * 0.17,
        fill: color,
        opacity: 0.75,
      }),
    );
  }
  return { markup: rows.join(''), colors: used };
}

export { type Palette };
