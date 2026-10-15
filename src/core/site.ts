import { ALL_ANIMATIONS, FREE_ANIMATIONS } from '../animations';
import { ALL_TEMPLATES, FREE_TEMPLATES } from '../templates';
import { PALETTES } from './palettes';

const env = import.meta.env ?? {};

export const SITE = {
  brand: 'NexSolarix',
  tagline: {
    id: 'Studio README & animasi SVG',
    en: 'README studio & SVG animations',
  },
  description: {
    id: 'Koleksi template README.md dan animasi SVG untuk mempercantik profil GitHub kamu.',
    en: 'A collection of README.md templates and SVG animations that make a GitHub profile worth reading.',
  },
  instagram: (env.VITE_INSTAGRAM_HANDLE as string | undefined)?.trim() || 'superryinz',
  repository: 'https://github.com/superrrkyy/nexsolarix',
  version: '1.0.0',
} as const;

export const SITE_STATS = {
  templates: ALL_TEMPLATES.length,
  freeTemplates: FREE_TEMPLATES.length,
  premiumTemplates: ALL_TEMPLATES.length - FREE_TEMPLATES.length,
  animations: ALL_ANIMATIONS.length,
  freeAnimations: FREE_ANIMATIONS.length,
  premiumAnimations: ALL_ANIMATIONS.length - FREE_ANIMATIONS.length,
  palettes: PALETTES.length,
} as const;

export function instagramUrl(handle = SITE.instagram): string {
  return `https://instagram.com/${handle.replace(/^@/, '')}`;
}
