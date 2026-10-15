import { defineAnimation, particleCloud, h, radialGradient, textEl, animate, animateTransform } from '../lib/svgkit';

/* ------------------------------------------------------------------ *
 * Effect group — ambient motion without a strong layout.
 * ------------------------------------------------------------------ */

export const constellation = defineAnimation({
  id: 'constellation',
  name: { id: 'Constellation', en: 'Constellation' },
  blurb: {
    id: 'Jaringan titik yang saling terhubung seperti rasi bintang.',
    en: 'A drifting network of nodes and links, like a constellation map.',
  },
  tier: 'free',
  group: 'effect',
  tags: ['effect', 'network', 'space', 'nodes'],
  aria: 'Animated constellation network',
  defaults: { height: 280 },
  body: (x) => {
    x.addDef(
      radialGradient(x.id('halo'), [
        { offset: '0%', color: x.g1, opacity: 0.28 },
        { offset: '100%', color: x.g1, opacity: 0 },
      ]),
    );
    const network = particleCloud(x, { count: 30, connect: true, connectDistance: Math.min(x.W, x.H) * 0.24, minR: 1.4, maxR: 3.4 });
    return [
      h('ellipse', { cx: x.W * 0.5, cy: x.H * 0.5, rx: x.W * 0.45, ry: x.H * 0.6, fill: `url(#${x.id('halo')})` }),
      h(
        'g',
        {},
        [network, animateTransform('rotate', {
          dur: x.dur(60),
          values: `${x.W / 2} ${x.H / 2};${x.W / 2 + 4} ${x.H / 2};${x.W / 2} ${x.H / 2}`,
          repeatCount: 'indefinite',
        })].join(''),
      ),
      x.heading(x.config.title, { y: x.H * 0.5, size: x.dev(32, 'h'), filter: x.glow ? `url(#${x.id('glow')})` : undefined }),
      x.vignette(0.5),
    ].join('');
  },
});

export const radarSweep = defineAnimation({
  id: 'radar-sweep',
  name: { id: 'Radar Sweep', en: 'Radar Sweep' },
  blurb: {
    id: 'Radar dengan sapuan cahaya berputar dan titik sinyal muncul.',
    en: 'A radar with a rotating sweep and pinging signal blips.',
  },
  tier: 'free',
  group: 'effect',
  tags: ['effect', 'radar', 'scan', 'tech'],
  aria: 'Animated radar sweep',
  defaults: { height: 280, width: 560 },
  body: (x) => {
    const cx = x.W / 2;
    const cy = x.H * 0.52;
    const radius = Math.min(x.W, x.H) * 0.42;

    x.addDef(
      radialGradient(x.id('sweep'), [
        { offset: '0%', color: x.g2, opacity: 0 },
        { offset: '70%', color: x.g2, opacity: 0.42 },
        { offset: '100%', color: x.g2, opacity: 0 },
      ]),
    );

    const rings = [0.28, 0.52, 0.76, 1]
      .map((scale, index) =>
        h('circle', {
          cx,
          cy,
          r: radius * scale,
          fill: 'none',
          stroke: x.g2,
          'stroke-width': 1,
          opacity: 0.24 + index * 0.06,
        }),
      )
      .join('');

    const spokes = Array.from({ length: 8 }, (_, index) => {
      const angle = (index / 8) * Math.PI * 2;
      return h('line', {
        x1: cx,
        y1: cy,
        x2: cx + Math.cos(angle) * radius,
        y2: cy + Math.sin(angle) * radius,
        stroke: x.g2,
        'stroke-width': 0.8,
        opacity: 0.18,
      });
    }).join('');

    const blips = Array.from({ length: Math.max(2, Math.round(4 * (x.config.density / 5))) }, (_, index) => {
      const angle = x.rng() * Math.PI * 2;
      const distance = radius * (0.25 + x.rng() * 0.7);
      const bx = cx + Math.cos(angle) * distance;
      const by = cy + Math.sin(angle) * distance;
      const delay = (index * 0.9).toFixed(2);
      return h('circle', { cx: bx.toFixed(1), cy: by.toFixed(1), r: 3.4, fill: x.g3, filter: `url(#${x.id('glow')})` }, [
        animate('r', { dur: x.dur(3.6), begin: `${delay}s`, values: '0;4.4;0', repeatCount: 'indefinite' }),
        animate('opacity', { dur: x.dur(3.6), begin: `${delay}s`, values: '0;1;0', repeatCount: 'indefinite' }),
      ].join(''));
    }).join('');

    return [
      h('circle', { cx, cy, r: radius, fill: x.surface, opacity: 0.35 }),
      h('g', {}, rings),
      h('g', {}, spokes),
      h(
        'g',
        {},
        [
          h('path', {
            d: `M${cx} ${cy} L${cx + radius} ${cy} A ${radius} ${radius} 0 0 0 ${cx + radius * Math.cos(-1.05)} ${cy + radius * Math.sin(-1.05)} Z`,
            fill: `url(#${x.id('sweep')})`,
          }),
          animateTransform('rotate', { dur: x.dur(3.6), values: `${cx} ${cy};${cx + 360} ${cy}`, repeatCount: 'indefinite' }),
        ].join(''),
      ),
      blips,
      h('circle', { cx, cy, r: 4, fill: x.g2 }),
      x.heading(x.config.title, { y: x.H - x.dev(30, 'h'), size: x.dev(22, 'h') }),
    ].join('');
  },
});

export const matrixRain = defineAnimation({
  id: 'matrix-rain',
  name: { id: 'Matrix Rain', en: 'Matrix Rain' },
  blurb: {
    id: 'Hujan kode digital turun di kolom-kolom vertikal.',
    en: 'Digital rain cascading down vertical columns.',
  },
  tier: 'free',
  group: 'effect',
  tags: ['effect', 'matrix', 'code', 'rain'],
  controls: ['palette', 'accent', 'width', 'height', 'speed', 'radius', 'density', 'glow', 'transparent'],
  aria: 'Animated matrix digital rain',
  defaults: { height: 300 },
  body: (x) => {
    const columns = Math.max(6, Math.round(22 * (x.config.density / 5)));
    const gap = x.W / columns;
    const glyphHeight = Math.max(5, x.H * 0.035);
    const perColumn = 8;
    const drops: string[] = [];
    for (let column = 0; column < columns; column += 1) {
      const x0 = gap * (column + 0.5);
      const delay = (ctx01(x, column) * 3).toFixed(2);
      const duration = (2.2 + ctx01(x, column + 99) * 2.4).toFixed(2);
      const trail = Array.from({ length: perColumn }, (_, index) => {
        const opacity = (1 - index / perColumn) * 0.9;
        return h('rect', {
          x: (x0 - gap * 0.16).toFixed(1),
          y: (-index * glyphHeight * 1.6).toFixed(1),
          width: (gap * 0.32).toFixed(1),
          height: (glyphHeight * 0.66).toFixed(1),
          rx: glyphHeight * 0.2,
          fill: index === 0 ? x.g3 : x.g1,
          opacity: opacity.toFixed(2),
        });
      }).join('');
      drops.push(
        h(
          'g',
          {},
          [
            h('g', {}, trail),
            animateTransform('translate', {
              dur: `${(Number(duration) * x.config.speed).toFixed(2)}s`,
              begin: `${delay}s`,
              values: `0 ${-glyphHeight * perColumn * 2};0 ${x.H + glyphHeight * perColumn * 2}`,
              repeatCount: 'indefinite',
            }),
          ].join(''),
        ),
      );
    }
    return [
      x.scanlines({ spacing: 3, opacity: 0.03 }),
      h('g', {}, drops.join('')),
      x.vignette(0.6),
      x.heading(x.config.title, { y: x.H * 0.5, size: x.dev(30, 'h'), filter: `url(#${x.id('glow')})` }),
    ].join('');
  },
});

function ctx01(x: { rng: () => number }, salt: number): number {
  // Deterministic per column: cheap mixing of the column index with the rng.
  return (x.rng() + salt * 0.017) % 1;
}

export const pulseRings = defineAnimation({
  id: 'pulse-rings',
  name: { id: 'Pulse Rings', en: 'Pulse Rings' },
  blurb: {
    id: 'Cincin gelombang yang mengembang dari inti bercahaya.',
    en: 'Expanding wave rings radiating from a glowing core.',
  },
  tier: 'free',
  group: 'effect',
  tags: ['effect', 'pulse', 'rings', 'minimal'],
  aria: 'Animated expanding pulse rings',
  defaults: { height: 260 },
  body: (x) => {
    const cx = x.align === 'left' ? x.W * 0.24 : x.align === 'right' ? x.W * 0.76 : x.W / 2;
    const cy = x.H / 2;
    const maxR = Math.min(x.W, x.H) * 0.68;
    const rings = Array.from({ length: Math.max(3, Math.round(5 * (x.config.density / 5))) }, (_, index) => {
      const begin = (index * 0.72).toFixed(2);
      const color = [x.g1, x.g2, x.g3][index % 3] as string;
      return h('circle', { cx, cy, r: 10, fill: 'none', stroke: color, 'stroke-width': 2 }, [
        animate('r', { dur: x.dur(3.6), begin: `${begin}s`, values: `10;${maxR.toFixed(1)}`, repeatCount: 'indefinite' }),
        animate('opacity', { dur: x.dur(3.6), begin: `${begin}s`, values: '0.85;0', repeatCount: 'indefinite' }),
        animate('stroke-width', { dur: x.dur(3.6), begin: `${begin}s`, values: '3;0.6', repeatCount: 'indefinite' }),
      ].join(''));
    }).join('');

    return [
      h('circle', { cx, cy, r: x.dev(14, 'h'), fill: `url(#${x.id('accent')})`, filter: `url(#${x.id('glow')})` }, [
        animate('r', { dur: x.dur(2.6), values: `${x.dev(13, 'h')};${x.dev(18, 'h')};${x.dev(13, 'h')}`, repeatCount: 'indefinite' }),
      ].join('')),
      rings,
      x.heading(x.config.title, { y: cy + x.dev(14, 'h') + maxR * 0.06, size: x.dev(26, 'h'), filter: x.glow ? `url(#${x.id('glow')})` : undefined }),
      x.subtitleText(x.config.subtitle, { y: cy + x.dev(14, 'h') + maxR * 0.06 + x.dev(26, 'h') }),
    ].join('');
  },
});

export const sparkleTrail = defineAnimation({
  id: 'sparkle-trail',
  name: { id: 'Sparkle Trail', en: 'Sparkle Trail' },
  blurb: {
    id: 'Kelap-kelip bintang kecil yang melintas mengikuti jalur.',
    en: 'Tiny stars that sparkle along a travelling path.',
  },
  tier: 'free',
  group: 'effect',
  tags: ['effect', 'sparkle', 'stars', 'decoration'],
  aria: 'Animated sparkle trail',
  defaults: { height: 160, width: 900 },
  body: (x) => {
    const count = Math.max(8, Math.round(16 * (x.config.density / 5)));
    const sparkles = Array.from({ length: count }, (_, index) => {
      const t = index / count;
      const px = x.W * (0.06 + t * 0.88);
      const py = x.H * (0.5 + Math.sin(t * Math.PI * 2) * 0.22);
      const size = x.dev(7, 'h') * (0.6 + ((index * 37) % 10) / 12);
      const delay = (index * 0.16).toFixed(2);
      return h(
        'g',
        { transform: `translate(${px.toFixed(1)} ${py.toFixed(1)})` },
        [
          h('path', {
            d: `M0 ${-size} L${size * 0.22} ${-size * 0.22} L${size} 0 L${size * 0.22} ${size * 0.22} L0 ${size} L${-size * 0.22} ${size * 0.22} L${-size} 0 L${-size * 0.22} ${-size * 0.22} Z`,
            fill: index % 3 === 0 ? x.g3 : index % 3 === 1 ? x.g2 : x.g1,
            filter: `url(#${x.id('glow')})`,
          }),
          animate('opacity', { dur: x.dur(2.4), begin: `${delay}s`, values: '0;1;0.2;1;0;0', keyTimes: '0;0.12;0.3;0.5;0.72;1', repeatCount: 'indefinite' }),
          animateTransform('scale', { dur: x.dur(2.4), begin: `${delay}s`, values: '0;1.2;0.6;1;0;0', keyTimes: '0;0.12;0.3;0.5;0.72;1', repeatCount: 'indefinite', additive: 'sum' }),
        ].join(''),
      );
    }).join('');

    return [
      x.starField({ count: 34, minR: 0.5, maxR: 1.4, opacity: 0.5 }),
      sparkles,
      textEl(x.config.title, {
        x: x.W / 2,
        y: x.H * 0.92,
        size: x.dev(16, 'h'),
        fill: x.muted,
        font: x.font,
        weight: 600,
        anchor: 'middle',
        letterSpacing: x.dev(4, 'h'),
      }),
    ].join('');
  },
});
