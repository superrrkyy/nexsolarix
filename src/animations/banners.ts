import { defineAnimation, softBlob, shimmerBand, h, linearGradient, radialGradient, textEl, animate } from '../lib/svgkit';

/* ------------------------------------------------------------------ *
 * Banner group — wide headers for the top of a README.
 * ------------------------------------------------------------------ */

export const auroraBanner = defineAnimation({
  id: 'aurora-banner',
  name: { id: 'Aurora Banner', en: 'Aurora Banner' },
  blurb: {
    id: 'Pita aurora lembut yang bergerak pelan dengan judul bercahaya.',
    en: 'Soft drifting aurora ribbons behind a glowing headline.',
  },
  tier: 'free',
  group: 'banner',
  tags: ['banner', 'aurora', 'gradient', 'headline'],
  aria: 'Animated aurora banner with a glowing headline',
  defaults: { height: 260 },
  body: (x) => {
    const blobs = [
      softBlob(x, { cx: x.W * 0.22, cy: x.H * 0.32, r: x.H * 0.62, color: x.g1, opacity: 0.5, dur: 9, drift: x.W * 0.06 }),
      softBlob(x, { cx: x.W * 0.68, cy: x.H * 0.62, r: x.H * 0.7, color: x.g2, opacity: 0.42, dur: 11, drift: x.W * 0.05 }),
      softBlob(x, { cx: x.W * 0.46, cy: x.H * 0.2, r: x.H * 0.5, color: x.g3, opacity: 0.34, dur: 13, drift: x.W * 0.04 }),
    ].join('');

    const ribbons = [
      h('rect', { x: 0, y: x.H * 0.58, width: x.W, height: x.H * 0.06, fill: x.g1, opacity: 0.16, filter: `url(#${x.id('soft')})` }, [
        animate('y', { dur: x.dur(7), values: `${x.H * 0.56};${x.H * 0.64};${x.H * 0.56}` }),
      ].join('')),
      h('rect', { x: 0, y: x.H * 0.7, width: x.W, height: x.H * 0.04, fill: x.g3, opacity: 0.14, filter: `url(#${x.id('soft')})` }, [
        animate('y', { dur: x.dur(9), values: `${x.H * 0.72};${x.H * 0.62};${x.H * 0.72}` }),
      ].join('')),
    ].join('');

    return [
      blobs,
      ribbons,
      x.vignette(0.45),
      h('g', { opacity: 0 }, [
        animate('opacity', { dur: x.dur(1.6), values: '0;1', repeatCount: '1', fill: 'freeze' }),
        x.heading(x.config.title, { y: x.H * 0.5, filter: x.glow ? `url(#${x.id('glow')})` : undefined }),
      ].join('')),
      x.subtitleText(x.config.subtitle, { y: x.H * 0.68 }),
      x.labelText(x.config.label, { y: x.H * 0.84 }),
    ].join('');
  },
});

export const starfield = defineAnimation({
  id: 'starfield',
  name: { id: 'Starfield', en: 'Starfield' },
  blurb: {
    id: 'Langit berbintang berkelip dengan bintang jatuh melintas.',
    en: 'Twinkling star sky with shooting stars crossing the frame.',
  },
  tier: 'free',
  group: 'banner',
  tags: ['banner', 'space', 'stars', 'minimal'],
  aria: 'Animated starfield banner with shooting stars',
  defaults: { height: 240 },
  body: (x) => {
    x.addDef(
      radialGradient(x.id('neb'), [
        { offset: '0%', color: x.g1, opacity: 0.34 },
        { offset: '100%', color: x.g1, opacity: 0 },
      ]),
    );
    x.addDef(
      radialGradient(x.id('neb2'), [
        { offset: '0%', color: x.g3, opacity: 0.26 },
        { offset: '100%', color: x.g3, opacity: 0 },
      ]),
    );

    const shootingStars = [0, 1, 2]
      .map((index) => {
        const startX = x.W * (0.1 + index * 0.28);
        const startY = x.H * (0.12 + index * 0.08);
        const length = x.dev(120, 'w');
        return h(
          'g',
          { opacity: 0 },
          [
            h('line', {
              x1: startX,
              y1: startY,
              x2: startX + length,
              y2: startY + length * 0.34,
              stroke: `url(#${x.id('accent')})`,
              'stroke-width': 2,
              'stroke-linecap': 'round',
            }),
            animate('opacity', {
              dur: x.dur(6.5),
              begin: `${(index * 2.1).toFixed(1)}s`,
              values: '0;1;1;0;0',
              keyTimes: '0;0.06;0.3;0.42;1',
            }),
            animate('transform', {
              dur: x.dur(6.5),
              begin: `${(index * 2.1).toFixed(1)}s`,
              values: `translate(${-length * 1.4} ${-length * 0.5});translate(${x.W * 0.35} ${x.H * 0.1});translate(${x.W * 0.35} ${x.H * 0.1});translate(${x.W * 0.9} ${x.H * 0.3});translate(${x.W * 0.9} ${x.H * 0.3})`,
              keyTimes: '0;0.42;0.42;0.42;1',
            }),
          ].join(''),
        );
      })
      .join('');

    return [
      h('ellipse', { cx: x.W * 0.24, cy: x.H * 0.3, rx: x.W * 0.3, ry: x.H * 0.5, fill: `url(#${x.id('neb')})` }),
      h('ellipse', { cx: x.W * 0.78, cy: x.H * 0.68, rx: x.W * 0.26, ry: x.H * 0.42, fill: `url(#${x.id('neb2')})` }),
      x.starField({ count: 90, minR: 0.5, maxR: 2.1, padding: 6 }),
      shootingStars,
      x.vignette(0.5),
      x.heading(x.config.title, { y: x.H * 0.48, letterSpacing: x.dev(10, 'h') }),
      h('line', { x1: x.anchorX(-x.dev(150, 'w')), y1: x.H * 0.58, x2: x.anchorX(x.dev(150, 'w')), y2: x.H * 0.58, stroke: `url(#${x.id('accent')})`, 'stroke-width': 1.2, opacity: 0.8 }),
      x.subtitleText(x.config.subtitle, { y: x.H * 0.72 }),
    ].join('');
  },
});

export const neonGrid = defineAnimation({
  id: 'neon-grid',
  name: { id: 'Neon Grid', en: 'Neon Grid' },
  blurb: {
    id: 'Grid perspektif neon yang berlari ke arah horizon.',
    en: 'A neon perspective grid racing toward the horizon line.',
  },
  tier: 'free',
  group: 'banner',
  tags: ['banner', 'cyber', 'grid', 'tech'],
  aria: 'Animated neon perspective grid banner',
  defaults: { height: 260 },
  body: (x) => {
    const horizon = x.H * 0.58;
    const rows = 9;
    const rowParts: string[] = [];
    for (let i = 0; i < rows; i += 1) {
      const spread = i / rows;
      rowParts.push(
        h('rect', { x: 0, y: horizon, width: x.W, height: 1.4, fill: x.g2, opacity: 0.22 + spread * 0.5 }, [
          animate('y', {
            dur: x.dur(3.2),
            begin: `${(i * 0.32).toFixed(2)}s`,
            values: `${horizon};${horizon + (x.H - horizon) * 1.35}`,
            repeatCount: 'indefinite',
            calcMode: 'spline',
            keyTimes: '0;1',
            keySplines: '0.9 0 1 1',
          }),
          animate('opacity', { dur: x.dur(3.2), begin: `${(i * 0.32).toFixed(2)}s`, values: '0.14;0.85;0.14', repeatCount: 'indefinite' }),
        ].join('')),
      );
    }

    const columns = Math.max(6, Math.round(16 * (x.config.density / 5)));
    const colParts: string[] = [];
    for (let i = 0; i <= columns; i += 1) {
      const t = i / columns;
      const topX = x.W * 0.5 + (t - 0.5) * x.W * 0.18;
      const bottomX = x.W * 0.5 + (t - 0.5) * x.W * 2.4;
      colParts.push(
        h('line', {
          x1: topX,
          y1: horizon,
          x2: bottomX,
          y2: x.H * 1.25,
          stroke: `url(#${x.id('gridCol')})`,
          'stroke-width': 1,
        }),
      );
    }

    x.addDef(
      linearGradient(x.id('gridCol'), [
        { offset: '0%', color: x.g2, opacity: 0.05 },
        { offset: '55%', color: x.g1, opacity: 0.5 },
        { offset: '100%', color: x.g3, opacity: 0 },
      ], { gradientUnits: 'userSpaceOnUse', x1: 0, y1: horizon, x2: 0, y2: x.H }),
    );
    x.addDef(
      radialGradient(x.id('sun'), [
        { offset: '0%', color: x.g3, opacity: 0.6 },
        { offset: '60%', color: x.g1, opacity: 0.22 },
        { offset: '100%', color: x.g1, opacity: 0 },
      ]),
    );

    return [
      h('rect', { x: 0, y: horizon, width: x.W, height: x.H - horizon, fill: x.bgAlt, opacity: 0.55 }),
      h('ellipse', { cx: x.W / 2, cy: horizon - x.H * 0.05, rx: x.W * 0.34, ry: x.H * 0.42, fill: `url(#${x.id('sun')})` }),
      h('g', { opacity: 0.9 }, colParts.join('')),
      h('g', {}, rowParts.join('')),
      h('line', { x1: 0, y1: horizon, x2: x.W, y2: horizon, stroke: x.g2, 'stroke-width': 2, filter: `url(#${x.id('glow')})`, opacity: 0.95 }),
      x.scanlines({ spacing: 3, opacity: 0.04 }),
      x.vignette(0.6),
      x.heading(x.config.title, { y: x.H * 0.34, filter: `url(#${x.id('glow')})` }),
      x.subtitleText(x.config.subtitle, { y: horizon + x.H * 0.18 }),
    ].join('');
  },
});

export const gradientShimmer = defineAnimation({
  id: 'gradient-shimmer',
  name: { id: 'Gradient Shimmer', en: 'Gradient Shimmer' },
  blurb: {
    id: 'Teks gradasi dengan kilau yang menyapu dari kiri ke kanan.',
    en: 'Gradient headline with a highlight that sweeps left to right.',
  },
  tier: 'free',
  group: 'banner',
  tags: ['banner', 'text', 'gradient', 'minimal'],
  controls: ['palette', 'accent', 'width', 'height', 'speed', 'radius', 'glow', 'transparent', 'font', 'align', 'title', 'subtitle'],
  aria: 'Animated gradient shimmer headline',
  defaults: { height: 200 },
  body: (x) => {
    const maskId = x.id('textmask');
    const size = x.dev(52, 'h');
    x.addDef(
      h('mask', { id: maskId, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: x.W, height: x.H }, [
        textEl(x.config.title, {
          x: x.anchorX(),
          y: x.H * 0.56,
          size,
          fill: '#ffffff',
          font: x.font,
          weight: 900,
          anchor: x.align === 'left' ? 'start' : x.align === 'right' ? 'end' : 'middle',
          letterSpacing: size * 0.06,
        }),
      ].join('')),
    );
    const gradientId = x.id('shimmerText');
    x.addDef(
      linearGradient(
        gradientId,
        [
          { offset: '0%', color: x.g1 },
          { offset: '35%', color: x.g2 },
          { offset: '55%', color: '#ffffff' },
          { offset: '75%', color: x.g3 },
          { offset: '100%', color: x.g1 },
        ],
        { gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: x.W, y2: 0 },
      ),
    );

    return [
      h('rect', { x: 0, y: 0, width: x.W, height: x.H, fill: `url(#${gradientId})`, mask: `url(#${maskId})` }),
      shimmerBand(x, { y: x.H * 0.2, height: x.H * 0.6, dur: 3.2, opacity: 0.22 }),
      h('line', {
        x1: x.anchorX(-x.dev(230, 'w')),
        y1: x.H * 0.7,
        x2: x.anchorX(x.dev(230, 'w')),
        y2: x.H * 0.7,
        stroke: `url(#${x.id('accent')})`,
        'stroke-width': 2,
        'stroke-linecap': 'round',
      }, [
        animate('x1', { dur: x.dur(4), values: `${x.anchorX(-x.dev(230, 'w'))};${x.anchorX(-x.dev(120, 'w'))};${x.anchorX(-x.dev(230, 'w'))}` }),
        animate('x2', { dur: x.dur(4), values: `${x.anchorX(x.dev(230, 'w'))};${x.anchorX(x.dev(120, 'w'))};${x.anchorX(x.dev(230, 'w'))}` }),
      ].join('')),
      x.subtitleText(x.config.subtitle, { y: x.H * 0.84 }),
      x.vignette(0.3),
    ].join('');
  },
});

export const dotMatrix = defineAnimation({
  id: 'dot-matrix',
  name: { id: 'Dot Matrix', en: 'Dot Matrix' },
  blurb: {
    id: 'Matriks titik dengan gelombang cahaya yang mengalir.',
    en: 'A dot matrix with a travelling light wave.',
  },
  tier: 'free',
  group: 'banner',
  tags: ['banner', 'pattern', 'dots', 'tech'],
  controls: ['palette', 'accent', 'width', 'height', 'speed', 'radius', 'density', 'glow', 'transparent', 'font', 'align', 'title'],
  aria: 'Animated dot matrix wave banner',
  defaults: { height: 220 },
  body: (x) => {
    const cols = Math.max(8, Math.round(26 * (x.config.density / 5)));
    const rows = Math.max(3, Math.round(8 * (x.config.density / 5)));
    const gapX = x.W / (cols + 1);
    const gapY = x.H / (rows + 1);
    const radius = Math.max(1.4, Math.min(gapX, gapY) * 0.17);
    const dots: string[] = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const cx = gapX * (col + 1);
        const cy = gapY * (row + 1);
        const delay = ((col / cols) * 2.4 + row * 0.12).toFixed(2);
        const peak = 0.45 + x.rng() * 0.55;
        dots.push(
          h('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: radius.toFixed(2), fill: row % 2 === 0 ? x.g1 : x.g2, opacity: 0.16 }, [
            animate('opacity', { dur: x.dur(2.6), begin: `${delay}s`, values: `0.12;${peak.toFixed(2)};0.12`, repeatCount: 'indefinite' }),
            animate('r', { dur: x.dur(2.6), begin: `${delay}s`, values: `${radius.toFixed(2)};${(radius * 1.9).toFixed(2)};${radius.toFixed(2)}`, repeatCount: 'indefinite' }),
          ].join('')),
        );
      }
    }
    return [
      h('g', {}, dots.join('')),
      x.vignette(0.42),
      x.heading(x.config.title, { y: x.H * 0.52, filter: x.glow ? `url(#${x.id('glow')})` : undefined, size: x.dev(38, 'h') }),
    ].join('');
  },
});
