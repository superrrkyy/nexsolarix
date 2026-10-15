import type { AnimationAsset, AnimationGroup, RenderConfig, Tier } from '../core/types';
import { resolveConfig } from '../core/palettes';
import { auroraBanner, starfield, neonGrid, gradientShimmer, dotMatrix } from './banners';
import { terminalType, profileCard, glassPanel, hudFrame, typingQuote, codePreview } from './cards';
import { skillBars, equalizerCard, loadingBar, badgeRow, ringStats } from './data';
import { constellation, radarSweep, matrixRain, pulseRings, sparkleTrail } from './effects';
import { waveDivider, pulseLine, marqueeBand, orbitTitle } from './dividers';
import { premiumAnimations } from './premium';

export const FREE_ANIMATIONS: AnimationAsset[] = [
  auroraBanner,
  starfield,
  neonGrid,
  gradientShimmer,
  dotMatrix,
  terminalType,
  profileCard,
  glassPanel,
  hudFrame,
  typingQuote,
  codePreview,
  skillBars,
  equalizerCard,
  loadingBar,
  badgeRow,
  ringStats,
  constellation,
  radarSweep,
  matrixRain,
  pulseRings,
  sparkleTrail,
  waveDivider,
  pulseLine,
  marqueeBand,
  orbitTitle,
];

export const ALL_ANIMATIONS: AnimationAsset[] = [...FREE_ANIMATIONS, ...premiumAnimations];

export const ANIMATION_MAP: Record<string, AnimationAsset> = Object.fromEntries(
  ALL_ANIMATIONS.map((animation) => [animation.id, animation]),
);

export function getAnimation(id: string): AnimationAsset | undefined {
  return ANIMATION_MAP[id];
}

export function animationsByTier(tier: Tier): AnimationAsset[] {
  return ALL_ANIMATIONS.filter((animation) => animation.tier === tier);
}

export function animationsByGroup(group: AnimationGroup): AnimationAsset[] {
  return ALL_ANIMATIONS.filter((animation) => animation.group === group);
}

export const ANIMATION_GROUPS: { group: AnimationGroup; label: { id: string; en: string } }[] = [
  { group: 'banner', label: { id: 'Banner', en: 'Banner' } },
  { group: 'card', label: { id: 'Kartu', en: 'Card' } },
  { group: 'data', label: { id: 'Data', en: 'Data' } },
  { group: 'effect', label: { id: 'Efek', en: 'Effect' } },
  { group: 'divider', label: { id: 'Pemisah', en: 'Divider' } },
];

/** Renders an animation with a fully resolved configuration. */
export function renderAnimation(id: string, config?: Partial<RenderConfig> | null): string {
  const animation = getAnimation(id);
  if (!animation) return '';
  return animation.render(resolveConfig({ ...animation.defaults, ...(config ?? {}) }));
}

export function renderAnimationWith(animation: AnimationAsset, config: RenderConfig): string {
  return animation.render(config);
}
