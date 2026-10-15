import type { RenderConfig, TemplateBuildOptions, TemplateAsset } from '../core/types';
import {
  buildFiles as composeFiles,
  img,
  centered,
  badges,
  socialRow,
  techStackTable,
  detailsBlock,
  checklist,
  projectCards,
  profileHeaderNote,
  guidelineBlock,
  type SvgAsset,
} from './shared';

const pick = (assets: SvgAsset[], id: string) => assets.find((asset) => asset.id === id);

function make(
  meta: Omit<TemplateAsset, 'buildFiles'>,
  markdown: (assets: SvgAsset[], config: RenderConfig) => string,
): TemplateAsset {
  return {
    ...meta,
    buildFiles: (config: RenderConfig, options: TemplateBuildOptions) =>
      composeFiles({
        templateId: meta.id,
        animations: meta.animations,
        config,
        base: meta.defaults,
        options,
        intro: meta.blurb,
        markdown: (assets) => markdown(assets, config),
      }),
  };
}

const premiumNote =
  '> ✦ **NexSolarix Premium** — template ini termasuk paket premium. Bebas kamu ubah, warnai, dan pakai di profil atau repo apa pun. / This template is part of the premium pack. Edit it, recolour it, ship it anywhere.';

/* ------------------------------------------------------------------ *
 * 1. Holo Profile
 * ------------------------------------------------------------------ */

export const holoProfile = make(
  {
    id: 'holo-profile',
    name: { id: 'Holo Profile', en: 'Holo Profile' },
    blurb: {
      id: 'Kartu holografik dengan cincin statistik bercahaya dan sparkle.',
      en: 'A holographic card with glowing stat rings and drifting sparks.',
    },
    tier: 'premium',
    category: 'profile',
    tags: ['premium', 'hologram', 'profile', 'iridescent'],
    animations: ['holo-card', 'stat-rings', 'sparkle-trail'],
    defaults: { paletteId: 'holo-chrome', height: 320 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${premiumNote}

${img(pick(assets, 'holo-card'), 'Holographic animated profile card', '100%')}

${centered([
  `# ${config.label}`,
  '',
  config.subtitle,
  '',
  socialRow(config.label, [{ label: 'GitHub', url: 'https://github.com/username' }]),
])}

${img(pick(assets, 'sparkle-trail'), 'Animated sparkle divider', '100%')}

## Signature work

${detailsBlock(
  'Iridescent — a design system that adapts to its context',
  [
    '- 180 components, one token source, zero visual regressions in migration.',
    '- Shipped dark, light and high-contrast themes from the same primitives.',
    '- Documented as a living site rather than a static PDF.',
  ].join('\n'),
)}

${detailsBlock(
  'Chromat — colour pipeline for brand teams',
  [
    '- Turns a single brand colour into a full accessible palette.',
    '- Exports to CSS, Tailwind, Figma and iOS in one click.',
  ].join('\n'),
)}

## Signals

${img(pick(assets, 'stat-rings'), 'Animated statistic rings', '100%')}

${centered([`<sub>${config.label} · animated with NexSolarix</sub>`])}
`,
);

/* ------------------------------------------------------------------ *
 * 2. Cyber Glitch Pro
 * ------------------------------------------------------------------ */

export const cyberGlitchPro = make(
  {
    id: 'cyber-glitch-pro',
    name: { id: 'Cyber Glitch Pro', en: 'Cyber Glitch Pro' },
    blurb: {
      id: 'Header glitch RGB, jendela IDE, dan pita sinyal rusak.',
      en: 'An RGB glitch header, an IDE window and broken-signal ribbons.',
    },
    tier: 'premium',
    category: 'creative',
    tags: ['premium', 'glitch', 'cyber', 'editor'],
    animations: ['cyber-glitch', 'code-window', 'marquee-band'],
    defaults: {
      paletteId: 'glitch-pro',
      height: 280,
      title: 'GLITCH',
      subtitle: 'SIGNAL LOST — RECONNECTING',
      label: 'ERR 0x1F4',
    },
  },
  (assets, config) => `${profileHeaderNote(config)}

${premiumNote}

${img(pick(assets, 'cyber-glitch'), 'Glitch animated banner with RGB split', '100%')}

${img(pick(assets, 'marquee-band'), 'Animated marquee ribbon', '100%')}

## \`${config.label}\` — terminal identity

Somewhere between the compiler and the debugger. I write systems that fail loudly,
recover quietly, and ship on schedule.

${img(pick(assets, 'code-window'), 'Animated IDE code window', '100%')}

## Manifest

\`\`\`diff
+ typed everywhere, any is banned in review
+ tests before refactors, always
- no feature flags without an expiry date
- no dependency without a reason
\`\`\`

## Deployments

| Environment | Cadence | Rollback |
| --- | --- | --- |
| staging | every merge | instant |
| production | daily 10:00 | one command |
| edge | weekly | canary |

${centered([
  badges([
    { label: 'uptime', message: '99.98%', color: 'ff2d95' },
    { label: 'latency', message: '42ms p95', color: '00f0ff' },
    { label: 'errors', message: '0.01%', color: '7cff00' },
  ]),
])}

${centered([socialRow(config.label)])}
`,
);

/* ------------------------------------------------------------------ *
 * 3. Aurora Flow Pro
 * ------------------------------------------------------------------ */

export const auroraFlowPro = make(
  {
    id: 'aurora-flow-pro',
    name: { id: 'Aurora Flow Pro', en: 'Aurora Flow Pro' },
    blurb: {
      id: 'Kabut gradasi berkedalaman tinggi dengan pembuka sinematik.',
      en: 'Deep gradient fog with a cinematic, film-grain opener.',
    },
    tier: 'premium',
    category: 'creative',
    tags: ['premium', 'aurora', 'depth', 'cinematic'],
    animations: ['aurora-flow', 'particle-field', 'orbit-title'],
    defaults: { paletteId: 'aurora-pro', height: 300 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${premiumNote}

${img(pick(assets, 'aurora-flow'), 'Aurora flow animated banner', '100%')}

${centered([
  `# ${config.title}`,
  '',
  config.subtitle,
  '',
  socialRow(config.label, [{ label: 'GitHub', url: 'https://github.com/username' }]),
])}

${img(pick(assets, 'particle-field'), 'Animated particle depth field', '100%')}

## For the curious

I build interfaces that feel alive without getting in the way. Most of my work starts
as a sketch of motion, then becomes a system.

${detailsBlock(
  'What I am building now',
  checklist([
    { label: 'A renderer that keeps 60fps on a five-year-old laptop', done: true },
    { label: 'Design tokens that compile to SVG, CSS and native', done: true },
    { label: 'A motion library with a hard 8 kB budget', done: false },
    { label: 'Write the documentation I wish I had at 20', done: false },
  ]),
)}

${img(pick(assets, 'orbit-title'), 'Orbit divider', '100%')}

## Craft notes

${techStackTable([
  { area: 'Motion', tools: '`SVG` `SMIL` `CSS` `requestAnimationFrame`' },
  { area: 'Build', tools: '`TypeScript` `Vite` `esbuild`' },
  { area: 'Quality', tools: '`Vitest` `axe` `lighthouse`' },
])}

${guidelineBlock(config)}
`,
);

/* ------------------------------------------------------------------ *
 * 4. Dashboard Pro
 * ------------------------------------------------------------------ */

export const dashboardPro = make(
  {
    id: 'dashboard-pro',
    name: { id: 'Dashboard Pro', en: 'Dashboard Pro' },
    blurb: {
      id: 'Dasbor penuh: cincin, sparkline, bar, dan indikator live.',
      en: 'A full dashboard: rings, sparkline, bars and live indicators.',
    },
    tier: 'premium',
    category: 'data',
    tags: ['premium', 'dashboard', 'metrics', 'charts'],
    animations: ['dash-panel', 'stat-rings', 'particle-field'],
    defaults: { paletteId: 'obsidian-pro', height: 340, width: 900 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${premiumNote}

${img(pick(assets, 'dash-panel'), 'Animated metrics dashboard', '100%')}

${centered([
  `# ${config.title}`,
  '',
  config.subtitle,
  '',
  badges([
    { label: 'status', message: 'operational', color: '5eead4' },
    { label: 'deploys', message: '142 this year', color: '7dd3fc' },
    { label: 'incidents', message: '0 sev-1', color: 'c4b5fd' },
  ]),
])}

## How I measure a good week

| Metric | Target | Reality |
| --- | --- | --- |
| Deploys per week | 5+ | 6.4 average |
| Lead time for change | < 1 day | 7 hours |
| Change failure rate | < 15% | 8% |
| Time spent in meetings | < 6 h | 5 h |

${img(pick(assets, 'stat-rings'), 'Animated metric rings', '100%')}

${detailsBlock(
  'The stack behind the numbers',
  [
    '- **Collection:** a small CLI that reads local git history and CI logs — nothing phones home.',
    '- **Storage:** SQLite, because it is one file and it is fast enough.',
    '- **Rendering:** every chart on this page is a static SVG with SMIL animation, so it works on GitHub.',
  ].join('\n'),
)}

${img(pick(assets, 'particle-field'), 'Animated depth divider', '100%')}

${centered([socialRow(config.label)])}
`,
);

/* ------------------------------------------------------------------ *
 * 5. Kinetic Pro
 * ------------------------------------------------------------------ */

export const kineticPro = make(
  {
    id: 'kinetic-pro',
    name: { id: 'Kinetic Typography Pro', en: 'Kinetic Typography Pro' },
    blurb: {
      id: 'Tipografi kinetik dengan pita berjalan di dua arah.',
      en: 'Kinetic typography with ribbons running in both directions.',
    },
    tier: 'premium',
    category: 'creative',
    tags: ['premium', 'typography', 'kinetic', 'brand'],
    animations: ['kinetic-typo', 'marquee-band', 'gradient-shimmer'],
    defaults: {
      paletteId: 'retro-iso',
      height: 280,
      title: 'KINETIC',
      subtitle: 'MOTION • TYPE • SYSTEM',
    },
  },
  (assets, config) => `${profileHeaderNote(config)}

${premiumNote}

${img(pick(assets, 'kinetic-typo'), 'Kinetic typography animated banner', '100%')}

${centered([`### ${config.label}`, '', config.subtitle])}

${img(pick(assets, 'marquee-band'), 'Animated marquee ribbon', '100%')}

## What I make

Motion-first brand systems: the kind where the logo moves, the type breathes, and the
guidelines are a living page instead of a 90-page PDF.

${detailsBlock(
  'Selected identity work',
  projectCards([
    { name: 'Vector', description: 'Animated logotype system for a robotics startup — 14 states, one source file.', url: 'https://example.com', tag: 'brand' },
    { name: 'Cadence', description: 'Type-driven campaign toolkit with editable motion presets.', url: 'https://example.com', tag: 'campaign' },
    { name: 'Interval', description: 'Wayfinding system where motion signals direction.', url: 'https://example.com', tag: 'spatial' },
  ]),
)}

${img(pick(assets, 'gradient-shimmer'), 'Gradient shimmer divider', '100%')}

${centered([socialRow(config.label, [{ label: 'Portfolio', url: 'https://example.com' }])])}

${guidelineBlock(config)}
`,
);

/* ------------------------------------------------------------------ *
 * 6. Retro Iso
 * ------------------------------------------------------------------ */

export const retroIso = make(
  {
    id: 'retro-iso',
    name: { id: 'Retro Isometric', en: 'Retro Isometric' },
    blurb: {
      id: 'Matahari synthwave, grid surut, dan vibe arcade 80-an.',
      en: 'A synthwave sun, a retreating grid and pure 80s arcade energy.',
    },
    tier: 'premium',
    category: 'creative',
    tags: ['premium', 'synthwave', 'retro', 'grid'],
    animations: ['retro-sun', 'neon-grid', 'wave-divider'],
    defaults: { paletteId: 'retro-iso', height: 300, title: 'SYNTHWAVE' },
  },
  (assets, config) => `${profileHeaderNote(config)}

${premiumNote}

${img(pick(assets, 'retro-sun'), 'Retro synthwave sun banner', '100%')}

${centered([
  `# ${config.title}`,
  '',
  config.subtitle,
  '',
  socialRow(config.label, [{ label: 'GitHub', url: 'https://github.com/username' }]),
])}

${img(pick(assets, 'wave-divider'), 'Animated wave divider', '100%')}

## Arcade cabinet

I build games, tools and toys with an unreasonable amount of neon.

- 🕹 **Grid Runner** — an endless runner rendered entirely in SVG
- 👾 **Pixel Forge** — sprite editor that exports to CSS box-shadow art
- 🎛 **Patch Bay** — a browser synth with a real modular routing graph

${detailsBlock(
  'Behind the neon',
  [
    '```text',
    'renderer   → SVG + SMIL, no canvas, no WebGL',
    'state      → plain objects, one store, no magic',
    'audio      → WebAudio, scheduled to the sample',
    '```',
    '',
    'Constraint is the aesthetic: if it cannot run inside an `<img>` tag, it does not ship.',
  ].join('\n'),
)}

${img(pick(assets, 'neon-grid'), 'Neon grid divider', '100%')}

${centered([
  badges([
    { label: 'retro', message: 'forever', color: 'ff6ec7' },
    { label: 'crt', message: 'enabled', color: '6ee7ff' },
    { label: 'score', message: '999999', color: 'ffe066' },
  ]),
])}

${guidelineBlock(config)}
`,
);

/* ------------------------------------------------------------------ *
 * 7. Liquid Lux
 * ------------------------------------------------------------------ */

export const liquidLux = make(
  {
    id: 'liquid-lux',
    name: { id: 'Liquid Luxury', en: 'Liquid Luxury' },
    blurb: {
      id: 'Logam cair dengan kilau spekular untuk kesan mewah.',
      en: 'Liquid metal with specular sweeps for an unmistakably luxe look.',
    },
    tier: 'premium',
    category: 'portfolio',
    tags: ['premium', 'luxury', 'metal', 'portfolio'],
    animations: ['liquid-metal', 'holo-card', 'sparkle-trail'],
    defaults: { paletteId: 'liquid-gold', height: 280, title: 'LUXURY' },
  },
  (assets, config) => `${profileHeaderNote(config)}

${premiumNote}

${img(pick(assets, 'liquid-metal'), 'Liquid metal animated banner', '100%')}

${img(pick(assets, 'sparkle-trail'), 'Sparkle divider', '100%')}

## \`${config.label}\`

${config.subtitle}

I keep a small client list and go deep on each engagement: brand, product surface,
motion system, and the boring details that make it all hold together.

${img(pick(assets, 'holo-card'), 'Holographic credential card', '100%')}

### Selected engagements

| Client | Scope | Outcome |
| --- | --- | --- |
| Atelier Nord | brand + product | launched in 9 weeks, 2 design awards |
| Verre | motion system | cut production time per asset by 60% |
| Maison Ora | e-commerce rebuild | 34% uplift in conversion |

${detailsBlock(
  'How I work',
  [
    '1. **Week 1 — Understand.** Interviews, audits, constraints written down.',
    '2. **Week 2 — Frame.** One direction, three references, no mood-board sprawl.',
    '3. **Week 3+ — Build.** Weekly ships, async reviews, everything documented.',
  ].join('\n'),
)}

${centered([socialRow(config.label, [{ label: 'Enquiries', url: 'mailto:studio@example.com' }])])}

${centered(['<sub>Limited slots each quarter.</sub>'])}
`,
);

/* ------------------------------------------------------------------ *
 * 8. Constellation Pro
 * ------------------------------------------------------------------ */

export const constellationPro = make(
  {
    id: 'constellation-pro',
    name: { id: 'Constellation Pro', en: 'Constellation Pro' },
    blurb: {
      id: 'Jaringan partikel berkedalaman, konstelasi, dan cincin metrik.',
      en: 'A depth-lit particle network, constellation map and metric rings.',
    },
    tier: 'premium',
    category: 'profile',
    tags: ['premium', 'network', 'particles', 'space'],
    animations: ['particle-field', 'constellation', 'stat-rings'],
    defaults: { paletteId: 'nebula-pro', height: 300 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${premiumNote}

${img(pick(assets, 'particle-field'), 'Particle depth field banner', '100%')}

${centered([
  `# ${config.label}`,
  '',
  config.subtitle,
  '',
  badges([
    { label: 'nodes', message: 'connected', color: 'a78bfa' },
    { label: 'open source', message: 'by default', color: 'f472b6' },
    { label: 'response time', message: '< 24h', color: '38bdf8' },
  ]),
])}

${img(pick(assets, 'constellation'), 'Constellation network', '100%')}

## Networks I run

- **Mesh** — a local-first sync layer for field research teams
- **Beacon** — uptime monitoring that fits in a single binary
- **Relay** — webhook router with replay, retries and signed delivery

${img(pick(assets, 'stat-rings'), 'Metric rings', '100%')}

${detailsBlock(
  'What I believe about open source',
  'A README is a contract. If someone cannot install your project in five minutes on a slow connection, the documentation is the bug — not the user. Every repository I maintain gets a quickstart, a troubleshooting section, and a working example with real data.',
)}

${img(pick(assets, 'particle-field'), 'Depth divider', '100%')}

${centered([socialRow(config.label, [{ label: 'GitHub', url: 'https://github.com/username' }])])}

${guidelineBlock(config)}
`,
);

/* ------------------------------------------------------------------ *
 * 9. Nebula Pro
 * ------------------------------------------------------------------ */

export const nebulaPro = make(
  {
    id: 'nebula-pro',
    name: { id: 'Nebula Pro', en: 'Nebula Pro' },
    blurb: {
      id: 'Awan gas nebula yang mengembang dengan bintang jatuh.',
      en: 'Expanding nebula gas clouds with shooting stars.',
    },
    tier: 'premium',
    category: 'creative',
    tags: ['premium', 'nebula', 'space', 'clouds'],
    animations: ['nebula-clouds', 'starfield', 'orbit-title'],
    defaults: { paletteId: 'nebula-pro', height: 300 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${premiumNote}

${img(pick(assets, 'nebula-clouds'), 'Nebula clouds animated banner', '100%')}

${centered([
  `# ${config.title}`,
  '',
  config.subtitle,
  '',
  socialRow(config.label, [{ label: 'GitHub', url: 'https://github.com/username' }]),
])}

${img(pick(assets, 'starfield'), 'Starfield divider', '100%')}

## Deep field

I work on the boundary between data and narrative: observability tools, scientific
visualisation, and anything that makes a large number legible.

${detailsBlock(
  'Projects in orbit',
  projectCards([
    { name: 'Parallax', description: 'Visualises telescope datasets in the browser at 60fps.', url: 'https://example.com', tag: 'WebGL' },
    { name: 'Redshift', description: 'Turns raw telemetry into readable incident timelines.', url: 'https://example.com', tag: 'Go' },
    { name: 'Occult', description: 'Predicts satellite passes for a given point on Earth.', url: 'https://example.com', tag: 'Python' },
  ]),
)}

${img(pick(assets, 'orbit-title'), 'Orbit divider', '100%')}

${centered([
  '<sub>Data sources are cited in each repository. Nothing on this profile is a live feed.</sub>',
])}

${guidelineBlock(config)}
`,
);

/* ------------------------------------------------------------------ *
 * 10. Prism Pro
 * ------------------------------------------------------------------ */

export const prismPro = make(
  {
    id: 'prism-pro',
    name: { id: 'Prism Science', en: 'Prism Science' },
    blurb: {
      id: 'Prisma optik dengan spektrum cahaya dan panel dasbor.',
      en: 'An optical prism splitting light, plus a dashboard panel.',
    },
    tier: 'premium',
    category: 'data',
    tags: ['premium', 'science', 'optics', 'education'],
    animations: ['prism-beam', 'dash-panel', 'wave-divider'],
    defaults: { paletteId: 'deep-ocean', height: 300, title: 'SPECTRUM' },
  },
  (assets, config) => `${profileHeaderNote(config)}

${premiumNote}

${img(pick(assets, 'prism-beam'), 'Prism beam spectrum banner', '100%')}

${centered([
  `# ${config.title}`,
  '',
  config.subtitle,
  '',
  badges([
    { label: 'physics', message: 'applied', color: '38bdf8' },
    { label: 'docs', message: 'always', color: '34d399' },
    { label: 'demos', message: 'interactive', color: 'a78bfa' },
  ]),
])}

${img(pick(assets, 'wave-divider'), 'Wave divider', '100%')}

## Teaching in the open

I build explainers that run in a browser tab and need no installation — optics,
orbits, waves, and the maths that ties them together.

${img(pick(assets, 'dash-panel'), 'Animated dashboard with charts', '100%')}

### Course material

| Module | Level | Format |
| --- | --- | --- |
| Geometric optics | intro | interactive notebook |
| Interference & diffraction | intermediate | browser lab |
| Spectroscopy basics | intermediate | annotated datasets |
| Orbital mechanics | advanced | simulation playground |

${detailsBlock(
  'On accuracy',
  'Every figure is checked against a published source and cited in the repository. Estimated or simulated values are labelled as such — a teaching tool that quietly invents numbers is worse than no tool at all.',
)}

${centered([socialRow(config.label, [{ label: 'Notes', url: 'https://example.com' }])])}

${centered(['<sub>Built for students first, always.</sub>'])}
`,
);

export const PREMIUM_TEMPLATES: TemplateAsset[] = [
  holoProfile,
  cyberGlitchPro,
  auroraFlowPro,
  dashboardPro,
  kineticPro,
  retroIso,
  liquidLux,
  constellationPro,
  nebulaPro,
  prismPro,
];
