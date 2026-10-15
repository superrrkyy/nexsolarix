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

/* ------------------------------------------------------------------ *
 * 1. Aurora Profile
 * ------------------------------------------------------------------ */

export const auroraProfile = make(
  {
    id: 'aurora-profile',
    name: { id: 'Aurora Profile', en: 'Aurora Profile' },
    blurb: {
      id: 'Profil klasik dengan banner aurora, kartu statistik, dan pemisah gelombang.',
      en: 'The classic profile: aurora banner, stat card and wave dividers.',
    },
    tier: 'free',
    category: 'profile',
    tags: ['profile', 'banner', 'aurora', 'stats'],
    animations: ['aurora-banner', 'profile-card', 'wave-divider'],
    defaults: { paletteId: 'midnight-violet', height: 260 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${centered([img(pick(assets, 'aurora-banner'), 'Animated aurora banner', '100%')])}

${centered([
  `# Hi, I'm **${config.title}**`,
  '',
  config.subtitle,
  '',
  socialRow(config.label, [
    { label: 'GitHub', url: 'https://github.com/username' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/username' },
  ]),
])}

${img(pick(assets, 'wave-divider'), 'wave divider', '100%')}

## About me

I build things for the web and occasionally for the sky above it. Currently focused on
developer tooling, interface design and anything that makes a README fun to open.

- 🔭 Working on **developer tools & design systems**
- 🌱 Learning **WebGL and 3D on the web**
- 💬 Ask me about **TypeScript, React, animation**
- ⚡ Fun fact: I read the source of the libraries I use

${img(pick(assets, 'wave-divider'), 'wave divider', '100%')}

## Where I hang out

${techStackTable([
  { area: 'Frontend', tools: '`TypeScript` `React` `Vite` `Tailwind`' },
  { area: 'Backend', tools: '`Node.js` `Express` `PostgreSQL` `Prisma`' },
  { area: 'Design', tools: '`Figma` `Motion design` `Design systems`' },
  { area: 'Tools', tools: '`Git` `Docker` `Vitest` `Playwright`' },
])}

## Stats

${img(pick(assets, 'profile-card'), 'Animated profile stats card', '100%')}

${guidelineBlock(config)}

---

<p align="center"><i>Thanks for stopping by — say hi on Instagram ${config.label}.</i></p>
`,
);

/* ------------------------------------------------------------------ *
 * 2. Terminal Dev
 * ------------------------------------------------------------------ */

export const terminalDev = make(
  {
    id: 'terminal-dev',
    name: { id: 'Terminal Dev', en: 'Terminal Dev' },
    blurb: {
      id: 'Pembuka bergaya terminal dengan blok kode dan bar keterampilan.',
      en: 'A terminal-style opener with a code block and skill meters.',
    },
    tier: 'free',
    category: 'profile',
    tags: ['profile', 'terminal', 'developer', 'code'],
    animations: ['terminal-type', 'code-preview', 'skill-bars'],
    defaults: { paletteId: 'emerald-lab', height: 280 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${img(pick(assets, 'terminal-type'), 'Animated terminal typing a boot sequence', '100%')}

${centered([
  `## \`${config.label}\` on GitHub`,
  '',
  config.subtitle,
])}

## Right now

\`\`\`bash
$ whoami
> full-stack developer · building small sharp tools

$ cat philosophy.txt
> Ship small. Document it. Automate the boring part.
\`\`\`

${img(pick(assets, 'code-preview'), 'Animated code preview panel', '100%')}

## Skills

${img(pick(assets, 'skill-bars'), 'Animated skill bars', '100%')}

${detailsBlock(
  'What I am working on this year',
  checklist([
    { label: 'Publish a CLI that removes boilerplate from my week', done: true },
    { label: 'Contribute to two open-source animation libraries', done: true },
    { label: 'Write one technical deep-dive per month', done: false },
    { label: 'Learn shader programming properly', done: false },
  ]),
)}

## Projects

${projectCards([
  { name: 'readme-studio', description: 'Generates the animated README you are looking at.', url: 'https://github.com/username/readme-studio', tag: 'TypeScript' },
  { name: 'tiny-queue', description: 'A 3 kB job queue for Node with retries and backoff.', url: 'https://github.com/username/tiny-queue', tag: 'Node.js' },
  { name: 'orbit-ui', description: 'Motion-first component kit for dashboards.', url: 'https://github.com/username/orbit-ui', tag: 'React' },
])}

${centered([socialRow(config.label, [{ label: 'Email', url: 'mailto:hello@example.com' }])])}
`,
);

/* ------------------------------------------------------------------ *
 * 3. Minimal Clean
 * ------------------------------------------------------------------ */

export const minimalClean = make(
  {
    id: 'minimal-clean',
    name: { id: 'Minimal Clean', en: 'Minimal Clean' },
    blurb: {
      id: 'Tipografi bersih untuk palet terang, minim distraksi.',
      en: 'Clean typography built for light palettes, zero clutter.',
    },
    tier: 'free',
    category: 'minimal',
    tags: ['minimal', 'light', 'typography'],
    animations: ['gradient-shimmer', 'pulse-line'],
    defaults: { paletteId: 'arctic-light', height: 200, glow: false },
  },
  (assets, config) => `${profileHeaderNote(config)}

${img(pick(assets, 'gradient-shimmer'), 'Animated gradient headline', '100%')}

**${config.subtitle}**

I design and build software that stays out of the way. Short READMEs, long changelogs.

${img(pick(assets, 'pulse-line'), 'divider', '100%')}

### Selected work

| Project | What it does | Stack |
| --- | --- | --- |
| **Northwind** | Analytics for small teams, no dashboards required | TypeScript · ClickHouse |
| **Paperclip** | Clipboard history that respects your privacy | Rust · Tauri |
| **Lumen** | A 6 kB animation helper for the web | TypeScript |

${img(pick(assets, 'pulse-line'), 'divider', '100%')}

### Elsewhere

${socialRow(config.label, [{ label: 'Website', url: 'https://example.com' }, { label: 'GitHub', url: 'https://github.com/username' }])}

${guidelineBlock(config)}
`,
);

/* ------------------------------------------------------------------ *
 * 4. Neon Cyber
 * ------------------------------------------------------------------ */

export const neonCyber = make(
  {
    id: 'neon-cyber',
    name: { id: 'Neon Cyber', en: 'Neon Cyber' },
    blurb: {
      id: 'Grid neon, badge menyala, dan bingkai HUD untuk vibe cyberpunk.',
      en: 'Neon grid, glowing badges and a HUD frame for cyberpunk energy.',
    },
    tier: 'free',
    category: 'creative',
    tags: ['creative', 'cyber', 'neon', 'badges'],
    animations: ['neon-grid', 'badge-row', 'hud-frame'],
    defaults: { paletteId: 'cyber-cyan', height: 260 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${img(pick(assets, 'neon-grid'), 'Animated neon grid banner', '100%')}

${centered([
  badges([
    { label: 'status', message: 'online', color: '22d3ee' },
    { label: 'focus', message: 'shipping', color: 'a3e635' },
    { label: 'coffee', message: 'level 9', color: '0ea5e9' },
  ]),
])}

${centered([`### \`${config.label}\``, '', config.subtitle])}

${img(pick(assets, 'badge-row'), 'Animated badge row', '100%')}

## Systems I run

${img(pick(assets, 'hud-frame'), 'Animated HUD frame with status readout', '100%')}

| Module | Status | Note |
| --- | --- | --- |
| interface | **stable** | shipped daily, no regressions this quarter |
| telemetry | **beta** | opt-in only, data stays local |
| automation | **stable** | 40+ scripts, one command each |

## Signal

\`\`\`text
┌─ CONTACT ─────────────────────────────┐
│ instagram  ${config.label}
│ github     github.com/username
│ email      hello@example.com
└───────────────────────────────────────┘
\`\`\`

${centered(['<sub>Best viewed with the lights off.</sub>'])}
`,
);

/* ------------------------------------------------------------------ *
 * 5. Orbit Hero
 * ------------------------------------------------------------------ */

export const orbitHero = make(
  {
    id: 'orbit-hero',
    name: { id: 'Orbit Hero', en: 'Orbit Hero' },
    blurb: {
      id: 'Judul dengan planet mengorbit dan pemisah orbit antar bagian.',
      en: 'A headline circled by tiny planets, with orbit dividers between sections.',
    },
    tier: 'free',
    category: 'profile',
    tags: ['profile', 'space', 'orbit', 'playful'],
    animations: ['orbit-title', 'starfield'],
    defaults: { paletteId: 'deep-ocean', height: 240 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${img(pick(assets, 'starfield'), 'Animated starfield banner', '100%')}

${img(pick(assets, 'orbit-title'), 'Animated orbit title', '100%')}

I'm **${config.title}** — ${config.subtitle.toLowerCase()}.

${img(pick(assets, 'orbit-title'), 'orbit divider', '100%')}

## Missions

- 🛰 **Ground station** — a monitoring tool that tells me when things break before users do
- 🌌 **Star chart** — a tiny 3D visualiser for constellation data
- 📡 **Signal** — a newsletter about building calm software

## Ground truth

${techStackTable([
  { area: 'Languages', tools: '`TypeScript` `Python` `Go`' },
  { area: 'Interests', tools: '`astronomy` `simulation` `maps`' },
  { area: 'Currently', tools: 'writing a 3D renderer from scratch' },
])}

${centered([socialRow(config.label)])}

${guidelineBlock(config)}
`,
);

/* ------------------------------------------------------------------ *
 * 6. HUD Tech
 * ------------------------------------------------------------------ */

export const hudTech = make(
  {
    id: 'hud-tech',
    name: { id: 'HUD Tech', en: 'HUD Tech' },
    blurb: {
      id: 'Bingkai HUD, cincin statistik, dan roadmap untuk profil teknis.',
      en: 'HUD framing, stat rings and a roadmap for a technical profile.',
    },
    tier: 'free',
    category: 'data',
    tags: ['data', 'hud', 'roadmap', 'stats'],
    animations: ['hud-frame', 'ring-stats', 'loading-bar'],
    defaults: { paletteId: 'slate-minimal', height: 240 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${img(pick(assets, 'hud-frame'), 'Animated HUD frame header', '100%')}

${centered([
  `## ${config.title}`,
  '',
  config.subtitle,
  '',
  badges([
    { label: 'build', message: 'passing', color: '3fb950' },
    { label: 'coverage', message: '94%', color: '58a6ff' },
    { label: 'license', message: 'MIT', color: '8957e5' },
  ]),
])}

## Instrumentation

${img(pick(assets, 'ring-stats'), 'Animated progress rings', '100%')}

## Roadmap

${checklist([
  { label: 'Control plane rewrite', done: true },
  { label: 'Structured logging everywhere', done: true },
  { label: 'Open-source the scheduler', done: true },
  { label: 'Multi-region failover', done: false },
  { label: 'Public status page', done: false },
])}

${detailsBlock(
  'Architecture at a glance',
  [
    '```text',
    'client ──▶ edge cache ──▶ api ──▶ queue ──▶ workers',
    '                          │',
    '                          └──▶ postgres (primary + replica)',
    '```',
    '',
    'Everything is containerised, everything is observable, nothing is deployed on a Friday.',
  ].join('\n'),
)}

## Build status

${img(pick(assets, 'loading-bar'), 'Animated loading bar', '100%')}

${centered([socialRow(config.label)])}
`,
);

/* ------------------------------------------------------------------ *
 * 7. Glass Portfolio
 * ------------------------------------------------------------------ */

export const glassPortfolio = make(
  {
    id: 'glass-portfolio',
    name: { id: 'Glass Portfolio', en: 'Glass Portfolio' },
    blurb: {
      id: 'Panel kaca mengkilap dengan tabel proyek untuk portofolio.',
      en: 'A glassy sheen panel with a project table for portfolios.',
    },
    tier: 'free',
    category: 'portfolio',
    tags: ['portfolio', 'glass', 'projects'],
    animations: ['glass-panel', 'sparkle-trail'],
    defaults: { paletteId: 'rose-quartz', height: 260 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${img(pick(assets, 'glass-panel'), 'Animated glass panel header', '100%')}

## Hello 👋

I'm **${config.title}**, ${config.subtitle.toLowerCase()}.

${img(pick(assets, 'sparkle-trail'), 'Animated sparkle divider', '100%')}

### Case studies

${detailsBlock(
  'Atlas — design system for a 40-person team',
  [
    '- Rebuilt the component library around tokens; designers and engineers now ship from one source.',
    '- Cut design QA time by roughly half in the first two quarters.',
    '- Wrote the migration guide that moved 60+ screens without a freeze.',
  ].join('\n'),
)}

${detailsBlock(
  'Fathom — analytics without the dashboard tax',
  [
    '- Interviewed 22 users; the finding was that nobody opened the dashboard I had built.',
    '- Replaced it with a weekly digest and saw retention climb.',
    '- Shipped in 11 weeks from idea to first paying customer.',
  ].join('\n'),
)}

${detailsBlock(
  'Loom — a colour tool for accessibility',
  [
    '- Generates compliant palettes from a single brand colour.',
    '- Used by around 3,000 people, still free.',
  ].join('\n'),
)}

## Toolbox

${techStackTable([
  { area: 'Design', tools: '`Figma` `prototyping` `motion`' },
  { area: 'Build', tools: '`React` `Vite` `TypeScript` `Tailwind`' },
  { area: 'Research', tools: '`user interviews` `usability tests`' },
])}

${centered([socialRow(config.label, [{ label: 'Portfolio', url: 'https://example.com' }])])}
`,
);

/* ------------------------------------------------------------------ *
 * 8. Now Playing
 * ------------------------------------------------------------------ */

export const nowPlaying = make(
  {
    id: 'now-playing',
    name: { id: 'Now Playing', en: 'Now Playing' },
    blurb: {
      id: 'Kartu now-playing dengan equalizer plus kutipan favorit.',
      en: 'A now-playing card with an equalizer plus a favourite quote.',
    },
    tier: 'free',
    category: 'creative',
    tags: ['creative', 'music', 'equalizer', 'quote'],
    animations: ['equalizer-card', 'typing-quote', 'pulse-line'],
    defaults: {
      paletteId: 'neon-magenta',
      height: 240,
      title: 'Now Playing',
      subtitle: 'Lo-fi beats to refactor to',
      label: 'playlist 04',
    },
  },
  (assets, config) => `${profileHeaderNote(config)}

${img(pick(assets, 'equalizer-card'), 'Animated now playing card', '100%')}

# Hey, I'm ${config.title}

${config.subtitle} — mostly with headphones on.

${img(pick(assets, 'typing-quote'), 'Animated typing quote', '100%')}

${img(pick(assets, 'pulse-line'), 'divider', '100%')}

## The rotation

| Mood | Sound | When |
| --- | --- | --- |
| deep work | ambient · drone | mornings, before standup |
| shipping | drum & bass | release days |
| debugging | lo-fi | when the stack trace is long |
| writing docs | piano | afternoons |

## What I make

- 🎧 **Playlist engine** — turns a folder of files into a shareable set
- 📻 **Radio log** — archives shows I care about, searchable offline
- 🎼 **Tab printer** — clean sheet music PDFs from plain text

${centered([socialRow(config.label)])}
`,
);

/* ------------------------------------------------------------------ *
 * 9. Starfield Intro
 * ------------------------------------------------------------------ */

export const starfieldIntro = make(
  {
    id: 'starfield-intro',
    name: { id: 'Starfield Intro', en: 'Starfield Intro' },
    blurb: {
      id: 'Pembuka langit berbintang dengan jaringan konstelasi.',
      en: 'A star-sky opener paired with a constellation network.',
    },
    tier: 'free',
    category: 'profile',
    tags: ['profile', 'space', 'stars', 'network'],
    animations: ['starfield', 'constellation'],
    defaults: { paletteId: 'nebula-pro', height: 260 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${img(pick(assets, 'starfield'), 'Animated starfield header', '100%')}

${centered([
  `# ${config.title}`,
  '',
  config.subtitle,
  '',
  socialRow(config.label, [{ label: 'GitHub', url: 'https://github.com/username' }]),
])}

${img(pick(assets, 'constellation'), 'Animated constellation network', '100%')}

## What I do

I connect things that were not meant to talk to each other — APIs, sensors, spreadsheets,
and occasionally a telescope.

${detailsBlock(
  'Currently exploring',
  checklist([
    { label: 'Satellite pass prediction on the command line', done: true },
    { label: 'A map of light pollution around my city', done: false },
    { label: 'Realtime sky visualiser for schools', done: false },
  ]),
)}

## Stack

${techStackTable([
  { area: 'Day job', tools: '`TypeScript` `Postgres` `Kubernetes`' },
  { area: 'Night job', tools: '`Python` `Skyfield` `Three.js`' },
])}

${guidelineBlock(config)}
`,
);

/* ------------------------------------------------------------------ *
 * 10. Code Quote
 * ------------------------------------------------------------------ */

export const codeQuote = make(
  {
    id: 'code-quote',
    name: { id: 'Code & Quote', en: 'Code & Quote' },
    blurb: {
      id: 'Panel kode dan kutipan yang diketik, gaya minimalis developer.',
      en: 'A code panel plus a typed quote, in a minimal developer style.',
    },
    tier: 'free',
    category: 'minimal',
    tags: ['minimal', 'code', 'quote'],
    animations: ['code-preview', 'typing-quote', 'wave-divider'],
    defaults: { paletteId: 'paper-ink', height: 260, glow: false, title: 'Simplicity is prerequisite for reliability.', label: '— Edsger W. Dijkstra' },
  },
  (assets, config) => `${profileHeaderNote(config)}

${img(pick(assets, 'code-preview'), 'Animated code panel', '100%')}

${centered([`## ${config.label}`, '', 'Backend engineer · boring technology enthusiast'])}

${img(pick(assets, 'typing-quote'), 'Animated typing quote', '100%')}

${img(pick(assets, 'wave-divider'), 'divider', '100%')}

### Notes to self

1. The cheapest feature to maintain is the one you did not build.
2. If the test is hard to write, the design is probably wrong.
3. Log lines are a user interface for your future self.

### Writing

- **On boring databases** — why the dull choice usually wins
- **Refactoring without a freeze** — a plan that fits in one sprint
- **README driven development** — document first, then build

${centered([socialRow(config.label)])}
`,
);

/* ------------------------------------------------------------------ *
 * 11. Stats Showcase
 * ------------------------------------------------------------------ */

export const statsShowcase = make(
  {
    id: 'stats-showcase',
    name: { id: 'Stats Showcase', en: 'Stats Showcase' },
    blurb: {
      id: 'Profil berbasis data: bar, cincin, dan badge yang hidup.',
      en: 'A data-first profile: living bars, rings and badges.',
    },
    tier: 'free',
    category: 'data',
    tags: ['data', 'stats', 'charts'],
    animations: ['skill-bars', 'ring-stats', 'badge-row'],
    defaults: { paletteId: 'emerald-lab', height: 260 },
  },
  (assets, config) => `${profileHeaderNote(config)}

${centered([
  `# ${config.title}`,
  '',
  config.subtitle,
  '',
  img(pick(assets, 'badge-row'), 'Animated badge row', '100%'),
])}

## Numbers I care about

${img(pick(assets, 'ring-stats'), 'Animated progress rings', '100%')}

## Where the time goes

${img(pick(assets, 'skill-bars'), 'Animated skill bars', '100%')}

${detailsBlock(
  'How these are calculated',
  'Every number on this page is generated locally from my own notes and repositories — no third-party tracking, no hidden analytics. If a metric cannot be defended, it does not belong on a profile.',
)}

## Repositories worth your time

${projectCards([
  { name: 'metrics-kit', description: 'Collects the numbers above from a git repo in one command.', url: 'https://github.com/username/metrics-kit', tag: 'TypeScript' },
  { name: 'chart-lite', description: '4 kB SVG chart renderer with zero dependencies.', url: 'https://github.com/username/chart-lite', tag: 'SVG' },
  { name: 'pipeline-dsl', description: 'Readable YAML pipelines that fail loudly and early.', url: 'https://github.com/username/pipeline-dsl', tag: 'Node.js' },
])}

${guidelineBlock(config)}
`,
);

/* ------------------------------------------------------------------ *
 * 12. Project Launch
 * ------------------------------------------------------------------ */

export const projectLaunch = make(
  {
    id: 'project-launch',
    name: { id: 'Project Launch', en: 'Project Launch' },
    blurb: {
      id: 'Untuk repository proyek: instalasi, fitur, dan status rilis.',
      en: 'Built for project repos: install steps, features and release status.',
    },
    tier: 'free',
    category: 'project',
    tags: ['project', 'readme', 'launch', 'docs'],
    animations: ['loading-bar', 'badge-row', 'wave-divider'],
    defaults: {
      paletteId: 'midnight-violet',
      height: 150,
      title: 'nexsolarix',
      subtitle: 'Animated README assets for busy developers',
    },
  },
  (assets, config) => `${profileHeaderNote(config)}

${centered([`# ${config.title}`, '', config.subtitle])}

${centered([
  badges([
    { label: 'version', message: '1.0.0', color: '7c5cff' },
    { label: 'license', message: 'MIT', color: '3fb950' },
    { label: 'node', message: '>=20', color: '58a6ff' },
    { label: 'PRs', message: 'welcome', color: 'ff5cc8' },
  ]),
])}

${img(pick(assets, 'badge-row'), 'Animated badge row', '100%')}

## Install

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

| Feature | Why it exists |
| --- | --- |
| **Generated assets** | Every banner is a real SVG file you can edit by hand |
| **Zero runtime** | Nothing is fetched at page load; images work offline |
| **Accessible defaults** | Text stays selectable, contrast is checked per palette |
| **Small surface** | One command to build, one folder to deploy |

## Status

${img(pick(assets, 'loading-bar'), 'Animated progress bar', '100%')}

${checklist([
  { label: 'Core renderer', done: true },
  { label: 'Template gallery', done: true },
  { label: 'ZIP export', done: true },
  { label: 'Plugin API', done: false },
])}

${img(pick(assets, 'wave-divider'), 'divider', '100%')}

## Contributing

1. Fork and branch from \`main\`.
2. Run \`npm test\` before opening a PR.
3. Keep assets editable — no build step should be required to change a colour.

${centered(['<sub>MIT licensed. Built with care and too much coffee.</sub>'])}
`,
);

export const FREE_TEMPLATES: TemplateAsset[] = [
  auroraProfile,
  terminalDev,
  minimalClean,
  neonCyber,
  orbitHero,
  hudTech,
  glassPortfolio,
  nowPlaying,
  starfieldIntro,
  codeQuote,
  statsShowcase,
  projectLaunch,
];
