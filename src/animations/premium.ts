import {
  defineAnimation,
  panelChrome,
  softBlob,
  equalizerBars,
  progressArc,
  particleCloud,
  h,
  linearGradient,
  radialGradient,
  textEl,
  animate,
  animateTransform,
  shimmerBand,
} from '../lib/svgkit';

/* ================================================================== *
 * Premium group.
 *
 * These carry the heavier motion design: layered parallax, iridescent
 * overlays, glitch systems and full data dashboards. Everything is still
 * self-contained SMIL so it renders inside a GitHub <img> tag.
 * ================================================================== */

export const holoCard = defineAnimation({
  id: 'holo-card',
  name: { id: 'Holo Card', en: 'Holo Card' },
  blurb: {
    id: 'Kartu holografik berlapis dengan kilau iridesen dan percikan cahaya.',
    en: 'A layered holographic card with iridescent sheen and light sparks.',
  },
  tier: 'premium',
  group: 'card',
  tags: ['premium', 'hologram', 'card', 'iridescent'],
  aria: 'Premium holographic profile card',
  defaults: { height: 320, width: 820 },
  body: (x) => {
    const cardW = Math.min(x.W * 0.86, x.dev(680, 'w'));
    const cardH = x.H * 0.72;
    const cardX = (x.W - cardW) / 2;
    const cardY = x.H * 0.12;

    x.addDef(
      linearGradient(
        x.id('holo'),
        [
          { offset: '0%', color: x.g1, opacity: 0.85 },
          { offset: '25%', color: x.g2, opacity: 0.7 },
          { offset: '50%', color: x.g3, opacity: 0.85 },
          { offset: '75%', color: x.g2, opacity: 0.6 },
          { offset: '100%', color: x.g1, opacity: 0.85 },
        ],
        { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
      ),
    );
    x.addDef(
      linearGradient(
        x.id('holoText'),
        [
          { offset: '0%', color: x.g3 },
          { offset: '50%', color: '#ffffff' },
          { offset: '100%', color: x.g2 },
        ],
        { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
      ),
    );

    // Right-hand text column: never wider than the card, never taller than the row.
    const textX0 = cardX + cardW * 0.38;
    const textW = cardX + cardW * 0.94 - textX0;
    const titleFit = x.fitSize(x.config.title, textW, Math.min(x.dev(30, 'h'), cardH * 0.34), 900);
    const subtitleFit = x.fitSize(x.config.subtitle, textW, Math.min(x.dev(15, 'h'), cardH * 0.2), 400);

    const layers = [1, 2, 3]
      .map((index) =>
        h('rect', {
          x: cardX + index * 9,
          y: cardY - index * 9,
          width: cardW,
          height: cardH,
          rx: x.config.radius,
          fill: x.surface,
          opacity: 0.16,
        }),
      )
      .join('');

    const sparks = Array.from({ length: 12 }, (_, index) => {
      const px = cardX + 30 + x.rng() * (cardW - 60);
      const py = cardY + 20 + x.rng() * (cardH - 40);
      const delay = (index * 0.42).toFixed(2);
      return h('circle', { cx: px.toFixed(1), cy: py.toFixed(1), r: 2.2, fill: '#ffffff', filter: `url(#${x.id('glow')})` }, [
        animate('opacity', { dur: x.dur(3.2), begin: `${delay}s`, values: '0;0.95;0', repeatCount: 'indefinite' }),
        animate('r', { dur: x.dur(3.2), begin: `${delay}s`, values: '0.4;2.6;0.4', repeatCount: 'indefinite' }),
      ].join(''));
    }).join('');

    return [
      layers,
      h('rect', { x: cardX, y: cardY, width: cardW, height: cardH, rx: x.config.radius, fill: x.surface, stroke: x.border, 'stroke-width': 1.4 }),
      h('rect', { x: cardX, y: cardY, width: cardW, height: cardH, rx: x.config.radius, fill: `url(#${x.id('holo')})`, opacity: 0.14 }, [
        animate('opacity', { dur: x.dur(6), values: '0.08;0.26;0.12;0.24;0.08', repeatCount: 'indefinite' }),
      ].join('')),
      shimmerBand(x, { y: cardY, height: cardH, dur: 3.4, opacity: 0.4, width: cardW * 0.28 }),
      h('rect', { x: cardX, y: cardY, width: cardW, height: cardH, rx: x.config.radius, fill: 'none', stroke: `url(#${x.id('holo')})`, 'stroke-width': 1.6, opacity: 0.75 }),
      h(
        'g',
        {},
        [
          h('rect', { x: cardX + cardW * 0.06, y: cardY + cardH * 0.16, width: cardW * 0.24, height: cardH * 0.68, rx: 18, fill: x.bg, opacity: 0.75, stroke: `url(#${x.id('holo')})`, 'stroke-width': 1.2 }),
          h('circle', { cx: cardX + cardW * 0.18, cy: cardY + cardH * 0.4, r: cardH * 0.15, fill: `url(#${x.id('holo')})`, opacity: 0.9 }),
          h('circle', { cx: cardX + cardW * 0.18, cy: cardY + cardH * 0.4, r: cardH * 0.15, fill: 'none', stroke: '#ffffff', 'stroke-width': 1, opacity: 0.35 }, [
            animate('r', { dur: x.dur(4.2), values: `${cardH * 0.15};${cardH * 0.175};${cardH * 0.15}`, repeatCount: 'indefinite' }),
          ].join('')),
          textEl(x.config.label, {
            x: cardX + cardW * 0.18,
            y: cardY + cardH * 0.68,
            size: x.dev(13, 'h'),
            fill: x.text,
            font: x.font,
            weight: 700,
            anchor: 'middle',
            letterSpacing: 0.8,
          }),
        ].join(''),
      ),
      textEl(titleFit.text, {
        x: cardX + cardW * 0.38,
        y: cardY + cardH * 0.34,
        size: titleFit.size,
        fill: `url(#${x.id('holoText')})`,
        font: x.font,
        weight: 900,
        anchor: 'start',
        letterSpacing: 1.2,
      }),
      textEl(subtitleFit.text, {
        x: cardX + cardW * 0.38,
        y: cardY + cardH * 0.5,
        size: subtitleFit.size,
        fill: x.muted,
        font: x.font,
        anchor: 'start',
      }),
      h('g', { transform: `translate(${cardX + cardW * 0.38 - 30} 0)` }, x.chips(['premium', 'holo', 'animated'], {
        y: cardY + cardH * 0.76,
        size: x.dev(12, 'h'),
        align: 'start',
      })),
      sparks,
      x.vignette(0.3),
    ].join('');
  },
});

export const auroraFlow = defineAnimation({
  id: 'aurora-flow',
  name: { id: 'Aurora Flow', en: 'Aurora Flow' },
  blurb: {
    id: 'Kabut gradasi berlapis yang mengalir dengan kedalaman blur.',
    en: 'Layered gradient fog flowing with real depth-of-field blur.',
  },
  tier: 'premium',
  group: 'banner',
  tags: ['premium', 'aurora', 'gradient', 'depth'],
  aria: 'Premium aurora flow banner',
  defaults: { height: 300 },
  body: (x) => {
    const blobs = [
      softBlob(x, { cx: x.W * 0.18, cy: x.H * 0.3, r: x.H * 0.72, color: x.g1, opacity: 0.52, dur: 12, drift: x.W * 0.07, blur: 'soft-lg' }),
      softBlob(x, { cx: x.W * 0.52, cy: x.H * 0.72, r: x.H * 0.66, color: x.g2, opacity: 0.46, dur: 10, drift: x.W * 0.06, blur: 'soft-lg' }),
      softBlob(x, { cx: x.W * 0.8, cy: x.H * 0.24, r: x.H * 0.6, color: x.g3, opacity: 0.44, dur: 14, drift: x.W * 0.05, blur: 'soft-lg' }),
      softBlob(x, { cx: x.W * 0.34, cy: x.H * 0.42, r: x.H * 0.34, color: x.g2, opacity: 0.3, dur: 8, drift: x.W * 0.08, blur: 'soft' }),
    ].join('');

    return [
      blobs,
      x.noise(0.045),
      x.vignette(0.55),
      h('g', {}, [
        h('rect', { x: x.anchorX(-x.dev(260, 'w')), y: x.H * 0.22, width: x.dev(520, 'w'), height: 2, fill: `url(#${x.id('accent')})`, opacity: 0.7 }),
      ].join('')),
      x.heading(x.config.title, { y: x.H * 0.5, filter: `url(#${x.id('glow')})`, letterSpacing: x.dev(8, 'h') }),
      x.subtitleText(x.config.subtitle, { y: x.H * 0.68 }),
      x.labelText(x.config.label, { y: x.H * 0.85 }),
    ].join('');
  },
});

export const cyberGlitch = defineAnimation({
  id: 'cyber-glitch',
  name: { id: 'Cyber Glitch', en: 'Cyber Glitch' },
  blurb: {
    id: 'Judul dengan pemisahan RGB, potongan piksel dan scanline sinyal rusak.',
    en: 'Headline with RGB split, slice tearing and broken-signal scanlines.',
  },
  tier: 'premium',
  group: 'banner',
  tags: ['premium', 'glitch', 'cyber', 'text'],
  aria: 'Premium cyber glitch banner',
  defaults: { height: 280, title: 'GLITCH', subtitle: 'SIGNAL LOST — RECONNECTING', label: 'ERR 0x1F4' },
  body: (x) => {
    const size = x.dev(70, 'h');
    const cx = x.W / 2;
    const cy = x.H * 0.48;

    const layer = (color: string, dx: number, opacity: number, begin: string) =>
      h(
        'g',
        {},
        [
          textEl(x.config.title, {
            x: cx,
            y: cy,
            size,
            fill: color,
            font: x.font,
            weight: 900,
            anchor: 'middle',
            letterSpacing: size * 0.12,
            opacity,
          }),
          animateTransform('translate', {
            dur: x.dur(3.2),
            begin,
            values: `0 0;${dx} 0;${-dx * 0.6} 0;0 0;${dx * 0.4} -4;0 0`,
            keyTimes: '0;0.12;0.24;0.4;0.55;1',
            repeatCount: 'indefinite',
            calcMode: 'discrete',
          }),
        ].join(''),
      );

    const glitchBars = Array.from({ length: 12 }, (_, index) => {
      const y = x.H * 0.2 + index * (x.H * 0.6) / 12;
      const height = 3 + x.rng() * 7;
      const delay = (index * 0.17).toFixed(2);
      return h('rect', { x: 0, y: y.toFixed(1), width: x.W, height: height.toFixed(1), fill: index % 2 === 0 ? x.g1 : x.g2, opacity: 0 }, [
        animate('opacity', { dur: '3.4s', begin: `${delay}s`, values: '0;0;0.55;0;0;0.3;0', keyTimes: '0;0.3;0.36;0.44;0.7;0.74;1', repeatCount: 'indefinite' }),
        animate('x', { dur: '3.4s', begin: `${delay}s`, values: '-30;0;26;-14;0;18;0', repeatCount: 'indefinite', calcMode: 'discrete' }),
      ].join(''));
    }).join('');

    return [
      h('g', {}, layer(x.g2, -6, 0.75, '0s')),
      h('g', {}, layer(x.g3, 6, 0.7, '0.06s')),
      h('g', {}, layer(x.text, 0, 0.98, '0.02s')),
      h('g', {}, layer(x.g1, 3, 0.45, '0.12s')),
      glitchBars,
      x.scanlines({ spacing: 3, opacity: 0.06 }),
      x.noise(0.07),
      x.vignette(0.5),
      x.subtitleText(x.config.subtitle, { y: x.H * 0.74, fill: x.g2, letterSpacing: x.dev(3, 'h') }),
      x.labelText(x.config.label, { y: x.H * 0.87, fill: x.g3 }),
      h('rect', { x: 0, y: 0, width: x.W, height: x.H, fill: 'none', stroke: x.g2, 'stroke-width': 1, opacity: 0.25 }),
    ].join('');
  },
});

export const kineticTypo = defineAnimation({
  id: 'kinetic-typo',
  name: { id: 'Kinetic Typography', en: 'Kinetic Typography' },
  blurb: {
    id: 'Huruf yang muncul satu per satu di antara dua pita berjalan.',
    en: 'Letters that land one by one between two travelling ribbons.',
  },
  tier: 'premium',
  group: 'banner',
  tags: ['premium', 'typography', 'kinetic', 'text'],
  aria: 'Premium kinetic typography banner',
  defaults: { height: 280, title: 'KINETIC', subtitle: 'MOTION • TYPE • SYSTEM' },
  body: (x) => {
    const letters = x.config.title.split('');
    const size = x.dev(72, 'h');
    const advance = size * 0.62;
    const totalWidth = letters.length * advance;
    const startX = x.W / 2 - totalWidth / 2 + advance * 0.5;
    const cy = x.H * 0.5;

    const letterNodes = letters
      .map((letter, index) => {
        const delay = (index * 0.09).toFixed(2);
        return h(
          'g',
          { transform: `translate(${(startX + index * advance).toFixed(1)} ${cy})` },
          [
            textEl(letter, {
              x: 0,
              y: 0,
              size,
              fill: index % 2 === 0 ? x.text : x.g2,
              font: x.font,
              weight: 900,
              anchor: 'middle',
            }),
            animateTransform('translate', {
              dur: '4.4s',
              begin: `${delay}s`,
              values: `0 90;0 -6;0 0;0 0;0 -90`,
              keyTimes: '0;0.14;0.24;0.72;1',
              repeatCount: 'indefinite',
              additive: 'sum',
            }),
            animate('opacity', { dur: '4.4s', begin: `${delay}s`, values: '0;1;1;1;0;0', keyTimes: '0;0.12;0.3;0.7;0.9;1', repeatCount: 'indefinite' }),
          ].join(''),
        );
      })
      .join('');

    const ribbon = (y: number, reverse: boolean, color: string, dur: number) => {
      const content = `${x.config.subtitle}   `.repeat(Math.max(3, Math.ceil(x.W / 320) + 2));
      return h(
        'g',
        {},
        [
          h('rect', { x: 0, y, width: x.W, height: x.H * 0.1, fill: color, opacity: 0.12 }),
          h('text', { x: 0, y: y + x.H * 0.072, 'font-family': x.font, 'font-size': x.H * 0.072, 'font-weight': 700, fill: color, 'letter-spacing': x.H * 0.012, opacity: 0.9 }, content),
          h('text', { x: x.W, y: y + x.H * 0.072, 'font-family': x.font, 'font-size': x.H * 0.072, 'font-weight': 700, fill: color, 'letter-spacing': x.H * 0.012, opacity: 0.9 }, content),
          animateTransform('translate', {
            dur: x.dur(dur),
            values: reverse ? `${-x.W} 0;0 0` : `0 0;${-x.W} 0`,
            repeatCount: 'indefinite',
          }),
        ].join(''),
      );
    };

    return [
      ribbon(x.H * 0.06, false, x.g1, 10),
      ribbon(x.H * 0.84, true, x.g3, 12),
      letterNodes,
      x.vignette(0.35),
      x.labelText(x.config.label, { y: x.H * 0.68, fill: x.muted }),
    ].join('');
  },
});

export const liquidMetal = defineAnimation({
  id: 'liquid-metal',
  name: { id: 'Liquid Metal', en: 'Liquid Metal' },
  blurb: {
    id: 'Logam cair dengan sorotan spekular yang menyapu di atas judul.',
    en: 'Liquid metal with specular highlights sweeping across the title.',
  },
  tier: 'premium',
  group: 'banner',
  tags: ['premium', 'metal', 'luxury', 'text'],
  aria: 'Premium liquid metal banner',
  defaults: { height: 280, title: 'LUXURY', subtitle: 'Crafted with precision' },
  body: (x) => {
    x.addDef(
      linearGradient(
        x.id('metal'),
        [
          { offset: '0%', color: x.g2, opacity: 0.9 },
          { offset: '18%', color: x.g3, opacity: 1 },
          { offset: '38%', color: x.g1, opacity: 0.95 },
          { offset: '52%', color: '#ffffff', opacity: 1 },
          { offset: '68%', color: x.g1, opacity: 0.95 },
          { offset: '84%', color: x.g3, opacity: 1 },
          { offset: '100%', color: x.g2, opacity: 0.9 },
        ],
        { x1: '0%', y1: '0%', x2: '100%', y2: '20%' },
      ),
    );
    x.addDef(
      radialGradient(x.id('pool'), [
        { offset: '0%', color: x.g3, opacity: 0.5 },
        { offset: '100%', color: x.g1, opacity: 0 },
      ]),
    );

    const highlights = Array.from({ length: 5 }, (_, index) => {
      const y = x.H * (0.28 + index * 0.11);
      const width = x.W * (0.45 + x.rng() * 0.4);
      const delay = (index * 0.6).toFixed(2);
      return h(
        'ellipse',
        { cx: 0, cy: y, rx: width / 2, ry: x.H * 0.012, fill: '#ffffff', opacity: 0.32, filter: `url(#${x.id('soft')})` },
        [
          animate('cx', { dur: x.dur(7 + index), begin: `${delay}s`, values: `${-width / 2};${x.W + width / 2}`, repeatCount: 'indefinite' }),
          animate('opacity', { dur: x.dur(7 + index), begin: `${delay}s`, values: '0;0.42;0', repeatCount: 'indefinite' }),
        ].join(''),
      );
    }).join('');

    return [
      h('ellipse', { cx: x.W / 2, cy: x.H * 0.55, rx: x.W * 0.42, ry: x.H * 0.5, fill: `url(#${x.id('pool')})` }),
      h(
        'rect',
        { x: 0, y: x.H * 0.3, width: x.W, height: x.H * 0.3, fill: `url(#${x.id('metal')})`, opacity: 0.22 },
        [animate('opacity', { dur: x.dur(6), values: '0.16;0.3;0.2;0.28;0.16', repeatCount: 'indefinite' })].join(''),
      ),
      highlights,
      textEl(x.config.title, {
        x: x.W / 2,
        y: x.H * 0.53,
        size: x.dev(64, 'h'),
        fill: `url(#${x.id('metal')})`,
        font: x.font,
        weight: 900,
        anchor: 'middle',
        letterSpacing: x.dev(6, 'h'),
        filter: `url(#${x.id('glow')})`,
      }),
      h('line', { x1: x.W * 0.2, y1: x.H * 0.63, x2: x.W * 0.8, y2: x.H * 0.63, stroke: `url(#${x.id('metal')})`, 'stroke-width': 1.6 }, [
        animate('opacity', { dur: x.dur(4), values: '0.4;1;0.4', repeatCount: 'indefinite' }),
      ].join('')),
      x.subtitleText(x.config.subtitle, { y: x.H * 0.76, fill: x.g3 }),
      x.vignette(0.45),
    ].join('');
  },
});

export const retroSun = defineAnimation({
  id: 'retro-sun',
  name: { id: 'Retro Sun', en: 'Retro Sun' },
  blurb: {
    id: 'Matahari synthwave bergaris dengan grid perspektif dan langit berbintang.',
    en: 'A striped synthwave sun over a perspective grid and star sky.',
  },
  tier: 'premium',
  group: 'banner',
  tags: ['premium', 'synthwave', 'retro', 'grid'],
  aria: 'Premium retro synthwave sun banner',
  defaults: { height: 300 },
  body: (x) => {
    const horizon = x.H * 0.62;
    const sunR = Math.min(x.H * 0.34, x.W * 0.16);
    const sunCx = x.W / 2;
    const sunCy = horizon - sunR * 0.18;

    x.addDef(
      linearGradient(
        x.id('sunGrad'),
        [
          { offset: '0%', color: x.g3, opacity: 1 },
          { offset: '45%', color: x.g1, opacity: 1 },
          { offset: '100%', color: x.g2, opacity: 1 },
        ],
        { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
      ),
    );
    const stripes = Array.from({ length: 7 }, (_, index) => {
      const y = sunCy - sunR * 0.2 + index * (sunR * 0.42) / 3;
      return h('rect', { x: sunCx - sunR - 4, y: y.toFixed(1), width: sunR * 2 + 8, height: (2 + index * 1.4).toFixed(1), fill: x.bg });
    }).join('');
    x.addDef(h('mask', { id: x.id('sunMask') }, [h('circle', { cx: sunCx, cy: sunCy, r: sunR, fill: '#ffffff' }), stripes].join('')));

    const gridRows = 8;
    const rowLines = Array.from({ length: gridRows }, (_, index) =>
      h('rect', { x: 0, y: horizon, width: x.W, height: 1.2, fill: x.g2, opacity: 0.4 }, [
        animate('y', {
          dur: x.dur(4),
          begin: `${(index * 0.42).toFixed(2)}s`,
          values: `${horizon};${x.H * 1.15}`,
          repeatCount: 'indefinite',
          calcMode: 'spline',
          keyTimes: '0;1',
          keySplines: '0.85 0 0.95 1',
        }),
        animate('opacity', { dur: x.dur(4), begin: `${(index * 0.42).toFixed(2)}s`, values: '0.15;0.7;0.15', repeatCount: 'indefinite' }),
      ].join('')),
    ).join('');

    const columns = Array.from({ length: 15 }, (_, index) => {
      const t = index / 14;
      return h('line', {
        x1: x.W * 0.5 + (t - 0.5) * x.W * 0.2,
        y1: horizon,
        x2: x.W * 0.5 + (t - 0.5) * x.W * 2.6,
        y2: x.H * 1.2,
        stroke: x.g2,
        'stroke-width': 0.9,
        opacity: 0.28,
      });
    }).join('');

    return [
      x.starField({ count: 42, maxR: 1.6, padding: 4, colors: ['#ffffff', x.g3, x.g2] }),
      h('circle', { cx: sunCx, cy: sunCy, r: sunR, fill: `url(#${x.id('sunGrad')})`, mask: `url(#${x.id('sunMask')})`, filter: `url(#${x.id('glow')})` }, [
        animate('r', { dur: x.dur(8), values: `${sunR};${sunR * 1.03};${sunR}`, repeatCount: 'indefinite' }),
      ].join('')),
      h('rect', { x: 0, y: horizon, width: x.W, height: x.H - horizon, fill: x.bgAlt, opacity: 0.6 }),
      h('g', {}, columns),
      h('g', {}, rowLines),
      h('line', { x1: 0, y1: horizon, x2: x.W, y2: horizon, stroke: x.g3, 'stroke-width': 2, filter: `url(#${x.id('glow')})` }),
      x.heading(x.config.title, { y: x.H * 0.18, size: x.dev(38, 'h'), filter: `url(#${x.id('glow')})`, letterSpacing: x.dev(10, 'h') }),
      x.subtitleText(x.config.subtitle, { y: x.H * 0.9, fill: x.g2 }),
    ].join('');
  },
});

export const dashPanel = defineAnimation({
  id: 'dash-panel',
  name: { id: 'Dashboard Panel', en: 'Dashboard Panel' },
  blurb: {
    id: 'Dasbor lengkap: cincin, bar, sparkline, dan indikator status.',
    en: 'A full dashboard: rings, bars, a sparkline and live status.',
  },
  tier: 'premium',
  group: 'data',
  tags: ['premium', 'dashboard', 'charts', 'data'],
  aria: 'Premium animated dashboard panel',
  defaults: { height: 340, width: 900 },
  body: (x) => {
    const pad = x.dev(24, 'w');
    const box = { x: pad, y: x.H * 0.08, width: x.W - pad * 2, height: x.H * 0.84 };

    const sparkPoints = Array.from({ length: 26 }, (_, index) => {
      const px = box.x + 340 + (index / 25) * (box.width - 380);
      const py = box.y + box.height * 0.62 - Math.sin(index * 0.55) * box.height * 0.14 - x.rng() * box.height * 0.06;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    }).join(' ');
    const sparkLength = box.width * 1.4;

    return [
      h('rect', { x: 0, y: 0, width: x.W, height: x.H, fill: `url(#${x.id('bg')})`, rx: x.config.radius }),
      h('rect', { x: box.x, y: box.y, width: box.width, height: box.height, rx: x.config.radius, fill: x.surface, stroke: x.border, 'stroke-width': 1.3 }),
      h('circle', { cx: box.x + 32, cy: box.y + 32, r: 5, fill: x.g3 }, [
        animate('opacity', { dur: '1.8s', values: '1;0.2;1', repeatCount: 'indefinite' }),
      ].join('')),
      textEl(x.config.title, {
        x: box.x + 50,
        y: box.y + 37,
        size: x.dev(16, 'h'),
        fill: x.text,
        font: x.font,
        weight: 700,
        anchor: 'start',
        letterSpacing: 0.8,
      }),
      textEl(x.config.label, {
        x: box.x + box.width - 24,
        y: box.y + 37,
        size: x.dev(12, 'h'),
        fill: x.muted,
        font: x.font,
        weight: 600,
        anchor: 'end',
      }),
      progressArc(x, { cx: box.x + 84, cy: box.y + box.height * 0.58, r: 44, percent: 78, color: x.g1, track: x.bg, width: 8, dur: 5 }),
      textEl('78%', {
        x: box.x + 84,
        y: box.y + box.height * 0.58 + 6,
        size: x.dev(20, 'h'),
        fill: x.text,
        font: x.font,
        weight: 800,
        anchor: 'middle',
      }),
      textEl('UPTIME', {
        x: box.x + 84,
        y: box.y + box.height * 0.58 + 62,
        size: x.dev(11, 'h'),
        fill: x.muted,
        font: x.font,
        weight: 600,
        anchor: 'middle',
        letterSpacing: 1.4,
      }),
      progressArc(x, { cx: box.x + 204, cy: box.y + box.height * 0.58, r: 44, percent: 54, color: x.g3, track: x.bg, width: 8, dur: 5.6 }),
      textEl('54%', {
        x: box.x + 204,
        y: box.y + box.height * 0.58 + 6,
        size: x.dev(20, 'h'),
        fill: x.text,
        font: x.font,
        weight: 800,
        anchor: 'middle',
      }),
      textEl('LOAD', {
        x: box.x + 204,
        y: box.y + box.height * 0.58 + 62,
        size: x.dev(11, 'h'),
        fill: x.muted,
        font: x.font,
        weight: 600,
        anchor: 'middle',
        letterSpacing: 1.4,
      }),
      h('polyline', {
        points: sparkPoints,
        fill: 'none',
        stroke: x.g2,
        'stroke-width': 2.4,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-dasharray': `${sparkLength} ${sparkLength}`,
        'stroke-dashoffset': sparkLength,
        filter: `url(#${x.id('glow')})`,
      }, [
        animate('stroke-dashoffset', { dur: x.dur(6), values: `${sparkLength};0;0;${sparkLength}`, keyTimes: '0;0.4;0.8;1', repeatCount: 'indefinite' }),
      ].join('')),
      equalizerBars(x, {
        x: box.x + 340,
        y: box.y + box.height * 0.74,
        width: box.width - 380,
        height: box.height * 0.16,
        bars: 34,
        color: x.g1,
        dur: 1.4,
      }),
      h('rect', { x: box.x + 340, y: box.y + box.height * 0.28, width: box.width - 380, height: 1, fill: x.border }),
      shimmerBand(x, { y: box.y, height: box.height, dur: 6, opacity: 0.12, width: box.width * 0.3 }),
      x.vignette(0.2),
    ].join('');
  },
});

export const statRings = defineAnimation({
  id: 'stat-rings',
  name: { id: 'Stat Rings Pro', en: 'Stat Rings Pro' },
  blurb: {
    id: 'Cincin statistik besar dengan penanda orbit dan angka yang berdenyut.',
    en: 'Large statistic rings with orbiting markers and pulsing readouts.',
  },
  tier: 'premium',
  group: 'data',
  tags: ['premium', 'rings', 'stats', 'metrics'],
  aria: 'Premium animated statistic rings',
  defaults: { height: 300, width: 820 },
  body: (x) => {
    const items = [
      { value: 92, label: 'PERFORMANCE', color: x.g1 },
      { value: 67, label: 'COVERAGE', color: x.g2 },
      { value: 45, label: 'BUNDLE', color: x.g3 },
    ];
    const radius = Math.min(x.H * 0.3, x.W / 7.2);
    const spacing = x.W / (items.length + 1);
    const cy = x.H * 0.46;

    return items
      .map((item, index) => {
        const cx = spacing * (index + 1);
        const circumference = 2 * Math.PI * radius;
        const dash = (circumference * item.value) / 100;
        return [
          h('g', {}, [
            h('circle', { cx, cy, r: radius * 1.14, fill: 'none', stroke: x.border, 'stroke-width': 1, 'stroke-dasharray': '3 7', opacity: 0.7 }),
            animateTransform('rotate', {
              dur: x.dur(index % 2 === 0 ? 26 : 21),
              values: index % 2 === 0 ? `${cx} ${cy};${cx + 360} ${cy}` : `${cx} ${cy};${cx - 360} ${cy}`,
              repeatCount: 'indefinite',
            }),
          ].join('')),
          h('circle', { cx, cy, r: radius, fill: x.bg, opacity: 0.65 }),
          h('circle', { cx, cy, r: radius, fill: 'none', stroke: x.bg, 'stroke-width': radius * 0.18, opacity: 0.6 }),
          h(
            'circle',
            {
              cx,
              cy,
              r: radius,
              fill: 'none',
              stroke: item.color,
              'stroke-width': radius * 0.14,
              'stroke-linecap': 'round',
              'stroke-dasharray': `${dash.toFixed(1)} ${(circumference - dash).toFixed(1)}`,
              transform: `rotate(-90 ${cx} ${cy})`,
              filter: x.glow ? `url(#${x.id('glow')})` : undefined,
            },
            [
              animate('stroke-dasharray', {
                dur: x.dur(5.4),
                values: `0 ${circumference.toFixed(1)};${dash.toFixed(1)} ${(circumference - dash).toFixed(1)};${dash.toFixed(1)} ${(circumference - dash).toFixed(1)};0 ${circumference.toFixed(1)}`,
                keyTimes: '0;0.3;0.74;1',
                repeatCount: 'indefinite',
                calcMode: 'spline',
                keySplines: '0.2 0.8 0.2 1;0 0 1 1;0.4 0 0.8 0.4',
              }),
            ].join(''),
          ),
          h('g', {}, [
            h('circle', { cx: cx + radius, cy, r: radius * 0.075, fill: item.color, filter: `url(#${x.id('glow')})` }),
            animateTransform('rotate', { dur: x.dur(5.4), values: `${cx} ${cy};${cx + 360} ${cy}`, repeatCount: 'indefinite' }),
          ].join('')),
          h(
            'text',
            {
              x: cx,
              y: cy + radius * 0.16,
              'font-family': x.font,
              'font-size': radius * 0.56,
              'font-weight': 900,
              fill: x.text,
              'text-anchor': 'middle',
            },
            `${item.value}%`,
          ),
          textEl(item.label, {
            x: cx,
            y: cy + radius + x.dev(30, 'h'),
            size: x.dev(11, 'h'),
            fill: x.muted,
            font: x.font,
            weight: 700,
            anchor: 'middle',
            letterSpacing: x.dev(2, 'h'),
          }),
        ].join('');
      })
      .join('');
  },
});

export const codeWindow = defineAnimation({
  id: 'code-window',
  name: { id: 'IDE Window', en: 'IDE Window' },
  blurb: {
    id: 'Jendela editor lengkap: sidebar, nomor baris, minimap dan status bar.',
    en: 'A full editor window: sidebar, line numbers, minimap and status bar.',
  },
  tier: 'premium',
  group: 'card',
  tags: ['premium', 'code', 'editor', 'developer'],
  aria: 'Premium animated IDE code window',
  defaults: { height: 340, width: 880 },
  body: (x) => {
    const pad = x.dev(24, 'w');
    const box = { x: pad, y: x.H * 0.08, width: x.W - pad * 2, height: x.H * 0.84 };
    const sidebarW = box.width * 0.2;
    const minimapW = box.width * 0.09;
    const editorX = box.x + sidebarW + 20;
    const editorW = box.width - sidebarW - minimapW - 56;
    const lineHeight = x.dev(19, 'h');
    const rows = 9;
    const top = box.y + 66;

    const files = ['readme.md', 'profile.svg', 'theme.ts', 'orbit.tsx'];
    const sidebar = files
      .map((file, index) => {
        const y = top + index * (lineHeight * 1.5);
        const active = index === 0;
        return [
          active ? h('rect', { x: box.x + 8, y: y - lineHeight * 0.85, width: sidebarW - 4, height: lineHeight * 1.3, rx: 6, fill: x.g1, opacity: 0.16 }) : '',
          h('rect', { x: box.x + 18, y: y - lineHeight * 0.5, width: lineHeight * 0.5, height: lineHeight * 0.5, rx: 2, fill: active ? x.g2 : x.muted, opacity: active ? 1 : 0.55 }),
          textEl(file, {
            x: box.x + 34,
            y: y,
            size: x.dev(11, 'h'),
            fill: active ? x.text : x.muted,
            font: x.font,
            weight: active ? 700 : 500,
            anchor: 'start',
          }),
        ].join('');
      })
      .join('');

    const colors = [x.g3, x.g2, x.g1, x.muted, x.text];
    const code: string[] = [];
    for (let index = 0; index < rows; index += 1) {
      const ratio = 0.32 + x.rng() * 0.6;
      const indent = Math.round(x.rng() * 2) * lineHeight * 0.9;
      const width = (editorW - indent - 10) * ratio;
      const delay = `${(0.2 + index * 0.3).toFixed(2)}s`;
      code.push(
        h('g', { opacity: 0 }, [
          animate('opacity', { dur: '0.45s', begin: delay, values: '0;1', repeatCount: '1', fill: 'freeze' }),
          h('rect', {
            x: editorX + indent,
            y: top + index * lineHeight - lineHeight * 0.32,
            width: width.toFixed(1),
            height: Math.max(3, lineHeight * 0.34),
            rx: 2,
            fill: colors[index % colors.length] as string,
            opacity: 0.85,
          }),
        ].join('')),
        h(
          'text',
          {
            x: editorX - 12,
            y: top + index * lineHeight,
            'font-family': x.font,
            'font-size': x.dev(10, 'h'),
            fill: x.muted,
            opacity: 0.5,
            'text-anchor': 'end',
          },
          String(index + 1),
        ),
      );
    }

    const minimap = Array.from({ length: 22 }, (_, index) =>
      h('rect', {
        x: box.x + box.width - minimapW - 14,
        y: top + index * (lineHeight * 0.55) - lineHeight * 0.3,
        width: (minimapW - 10) * (0.35 + ((index * 37) % 60) / 100),
        height: 2.2,
        rx: 1,
        fill: colors[index % colors.length] as string,
        opacity: 0.45,
      }),
    ).join('');

    return [
      h('rect', { x: 0, y: 0, width: x.W, height: x.H, fill: `url(#${x.id('bg')})`, rx: x.config.radius }),
      panelChrome(x, { x: box.x, y: box.y, width: box.width, height: box.height, title: 'nexsolarix — README Studio' }),
      h('rect', { x: box.x, y: box.y + 38, width: box.width, height: 1, fill: x.border }),
      h('rect', { x: box.x + 1, y: box.y + 39, width: sidebarW, height: box.height - 40, fill: x.bg, opacity: 0.5 }),
      sidebar,
      h('g', { 'font-family': x.font }, code.join('')),
      minimap,
      h('rect', { x: box.x + 1, y: box.y + box.height - 26, width: box.width - 2, height: 25, fill: x.bg, opacity: 0.6 }),
      textEl(`${x.config.subtitle} · utf-8 · LF`, {
        x: box.x + 18,
        y: box.y + box.height - 9,
        size: x.dev(10, 'h'),
        fill: x.muted,
        font: x.font,
        anchor: 'start',
      }),
      textEl(x.config.label, {
        x: box.x + box.width - 18,
        y: box.y + box.height - 9,
        size: x.dev(10, 'h'),
        fill: x.g2,
        font: x.font,
        weight: 700,
        anchor: 'end',
      }),
      h('rect', { x: editorX - 4, y: top + rows * lineHeight - lineHeight * 0.32, width: x.dev(9, 'h'), height: lineHeight * 0.8, fill: x.g3 }, [
        animate('opacity', { dur: '1.05s', values: '1;0;1', repeatCount: 'indefinite' }),
      ].join('')),
    ].join('');
  },
});

export const particleField = defineAnimation({
  id: 'particle-field',
  name: { id: 'Particle Depth', en: 'Particle Depth' },
  blurb: {
    id: 'Tiga lapisan partikel dengan parallax, blur, dan garis penghubung.',
    en: 'Three particle layers with parallax, blur and link lines.',
  },
  tier: 'premium',
  group: 'effect',
  tags: ['premium', 'particles', 'depth', 'parallax'],
  aria: 'Premium particle depth field',
  defaults: { height: 300 },
  body: (x) => {
    return [
      h('g', { filter: `url(#${x.id('soft-lg')})`, opacity: 0.55 }, particleCloud(x, {
        count: 18,
        minR: 3.5,
        maxR: 8,
        opacity: 0.5,
        dur: 12,
        driftY: 30,
        colors: [x.g1, x.g3],
      })),
      h('g', { opacity: 0.85 }, particleCloud(x, {
        count: 26,
        minR: 1.8,
        maxR: 4.2,
        opacity: 0.8,
        dur: 8,
        driftY: 22,
        colors: [x.g2, x.g1, x.text],
        connect: true,
        connectDistance: Math.min(x.W, x.H) * 0.3,
      })),
      h('g', {}, particleCloud(x, {
        count: 40,
        minR: 0.6,
        maxR: 1.8,
        opacity: 0.7,
        dur: 6,
        driftY: 14,
        colors: [x.text, x.g2, x.g3],
      })),
      x.noise(0.04),
      x.vignette(0.55),
      x.heading(x.config.title, { y: x.H * 0.5, size: x.dev(34, 'h'), filter: `url(#${x.id('glow')})`, letterSpacing: x.dev(6, 'h') }),
      x.subtitleText(x.config.subtitle, { y: x.H * 0.66 }),
    ].join('');
  },
});

export const nebulaClouds = defineAnimation({
  id: 'nebula-clouds',
  name: { id: 'Nebula Clouds', en: 'Nebula Clouds' },
  blurb: {
    id: 'Awan gas warna-warni yang mengembang perlahan di antara bintang.',
    en: 'Colourful gas clouds expanding slowly between the stars.',
  },
  tier: 'premium',
  group: 'banner',
  tags: ['premium', 'space', 'nebula', 'clouds'],
  aria: 'Premium nebula cloud banner',
  defaults: { height: 300 },
  body: (x) => {
    x.addDef(
      radialGradient(x.id('gas1'), [
        { offset: '0%', color: x.g1, opacity: 0.55 },
        { offset: '45%', color: x.g2, opacity: 0.28 },
        { offset: '100%', color: x.g1, opacity: 0 },
      ]),
    );
    x.addDef(
      radialGradient(x.id('gas2'), [
        { offset: '0%', color: x.g3, opacity: 0.5 },
        { offset: '50%', color: x.g1, opacity: 0.22 },
        { offset: '100%', color: x.g3, opacity: 0 },
      ]),
    );

    const cloud = (id: string, cx: number, cy: number, rx: number, ry: number, dur: number, drift: number, delay: string) =>
      h(
        'ellipse',
        { cx, cy, rx, ry, fill: `url(#${x.id(id)})`, filter: `url(#${x.id('soft-lg')})` },
        [
          animate('cx', { dur: x.dur(dur), begin: delay, values: `${cx};${cx + drift};${cx - drift * 0.7};${cx}`, repeatCount: 'indefinite' }),
          animate('cy', { dur: x.dur(dur * 1.2), begin: delay, values: `${cy};${cy - drift * 0.5};${cy + drift * 0.6};${cy}`, repeatCount: 'indefinite' }),
          animate('rx', { dur: x.dur(dur * 0.8), begin: delay, values: `${rx};${rx * 1.16};${rx * 0.94};${rx}`, repeatCount: 'indefinite' }),
          animate('ry', { dur: x.dur(dur * 0.9), begin: delay, values: `${ry};${ry * 0.9};${ry * 1.12};${ry}`, repeatCount: 'indefinite' }),
        ].join(''),
      );

    return [
      x.starField({ count: 74, minR: 0.5, maxR: 2, padding: 4, colors: ['#ffffff', x.g2, x.g3, x.g1] }),
      cloud('gas1', x.W * 0.28, x.H * 0.44, x.W * 0.24, x.H * 0.42, 16, 26, '0s'),
      cloud('gas2', x.W * 0.68, x.H * 0.36, x.W * 0.2, x.H * 0.34, 13, 20, '1.4s'),
      cloud('gas1', x.W * 0.5, x.H * 0.72, x.W * 0.3, x.H * 0.3, 19, 32, '0.8s'),
      h('line', { x1: x.W * 0.1, y1: x.H * 0.2, x2: x.W * 0.1, y2: x.H * 0.2, stroke: '#ffffff', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, [
        animate('x1', { dur: x.dur(5.5), values: `${x.W * 0.1};${x.W * 0.7}`, repeatCount: 'indefinite' }),
        animate('y1', { dur: x.dur(5.5), values: `${x.H * 0.2};${x.H * 0.6}`, repeatCount: 'indefinite' }),
        animate('x2', { dur: x.dur(5.5), values: `${x.W * 0.16};${x.W * 0.76}`, repeatCount: 'indefinite' }),
        animate('y2', { dur: x.dur(5.5), values: `${x.H * 0.24};${x.H * 0.64}`, repeatCount: 'indefinite' }),
        animate('opacity', { dur: x.dur(5.5), values: '0;1;0.9;0;0', keyTimes: '0;0.1;0.5;0.62;1', repeatCount: 'indefinite' }),
      ].join('')),
      x.vignette(0.5),
      x.heading(x.config.title, { y: x.H * 0.5, size: x.dev(40, 'h'), filter: `url(#${x.id('glow')})`, letterSpacing: x.dev(8, 'h') }),
      x.subtitleText(x.config.subtitle, { y: x.H * 0.68 }),
      x.labelText(x.config.label, { y: x.H * 0.85 }),
    ].join('');
  },
});

export const prismBeam = defineAnimation({
  id: 'prism-beam',
  name: { id: 'Prism Beam', en: 'Prism Beam' },
  blurb: {
    id: 'Seberkas cahaya masuk ke prisma lalu terurai jadi spektrum warna.',
    en: 'A light beam enters a prism and splits into a full spectrum.',
  },
  tier: 'premium',
  group: 'banner',
  tags: ['premium', 'optics', 'prism', 'science'],
  aria: 'Premium prism beam spectrum animation',
  defaults: { height: 300, title: 'SPECTRUM', subtitle: 'One beam, infinite colour' },
  body: (x) => {
    const prismCx = x.W * 0.5;
    const prismCy = x.H * 0.52;
    const size = Math.min(x.H * 0.34, x.W * 0.12);
    const triangle = `${prismCx},${prismCy - size} ${prismCx + size * 0.92},${prismCy + size * 0.62} ${prismCx - size * 0.92},${prismCy + size * 0.62}`;

    const spectrum = [x.g3, x.g2, x.g1]
      .map((color, index) => {
        const angle = -0.16 + index * 0.17;
        const endX = prismCx + size * 1.1 + x.W * 0.4;
        const endY = prismCy + Math.tan(angle) * (x.W * 0.4);
        const length = Math.hypot(endX - prismCx, endY - prismCy);
        return h(
          'line',
          {
            x1: prismCx + size * 0.7,
            y1: prismCy + size * 0.2,
            x2: endX,
            y2: endY,
            stroke: color,
            'stroke-width': 4.5,
            'stroke-linecap': 'round',
            opacity: 0.85,
            'stroke-dasharray': `${length} ${length}`,
            'stroke-dashoffset': length,
            filter: `url(#${x.id('glow')})`,
          },
          [
            animate('stroke-dashoffset', {
              dur: x.dur(4),
              begin: `${(0.4 + index * 0.18).toFixed(2)}s`,
              values: `${length};0;0;${length}`,
              keyTimes: '0;0.35;0.82;1',
              repeatCount: 'indefinite',
            }),
          ].join(''),
        );
      })
      .join('');

    const incomingLength = x.W * 0.34;
    return [
      h('line', {
        x1: prismCx - size - incomingLength,
        y1: prismCy - size * 0.34,
        x2: prismCx - size * 0.92,
        y2: prismCy + size * 0.6,
        stroke: '#ffffff',
        'stroke-width': 5,
        'stroke-linecap': 'round',
        opacity: 0.9,
        filter: `url(#${x.id('glow')})`,
        'stroke-dasharray': `${incomingLength} ${incomingLength * 2}`,
      }, [
        animate('stroke-dashoffset', { dur: x.dur(4), values: `${incomingLength};${-incomingLength * 2}`, repeatCount: 'indefinite' }),
      ].join('')),
      h('polygon', { points: triangle, fill: x.surface, stroke: x.border, 'stroke-width': 1.4, opacity: 0.95 }),
      h('polygon', { points: triangle, fill: 'none', stroke: x.g2, 'stroke-width': 2, opacity: 0.8 }, [
        animate('opacity', { dur: x.dur(4), values: '0.35;1;0.35', repeatCount: 'indefinite' }),
      ].join('')),
      spectrum,
      h('line', { x1: 0, y1: prismCy + size * 0.62, x2: x.W, y2: prismCy + size * 0.62, stroke: x.border, 'stroke-width': 1, opacity: 0.5 }),
      x.heading(x.config.title, { y: x.H * 0.16, size: x.dev(32, 'h'), letterSpacing: x.dev(8, 'h'), filter: x.glow ? `url(#${x.id('glow')})` : undefined }),
      x.subtitleText(x.config.subtitle, { y: x.H * 0.9 }),
      x.starField({ count: 26, minR: 0.4, maxR: 1.2, opacity: 0.45 }),
      x.vignette(0.4),
    ].join('');
  },
});

export const premiumAnimations = [
  holoCard,
  auroraFlow,
  cyberGlitch,
  kineticTypo,
  liquidMetal,
  retroSun,
  dashPanel,
  statRings,
  codeWindow,
  particleField,
  nebulaClouds,
  prismBeam,
];
