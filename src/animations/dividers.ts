import { defineAnimation, h, linearGradient, animate, animateTransform } from '../lib/svgkit';

/* ------------------------------------------------------------------ *
 * Divider group — thin strips that separate README sections.
 * ------------------------------------------------------------------ */

function wavePath(x: { W: number; H: number }, yBase: number, amplitude: number, scale: number): string {
  const a = amplitude * scale;
  return [
    `M0 ${yBase}`,
    `C ${x.W * 0.12} ${yBase - a}, ${x.W * 0.22} ${yBase + a}, ${x.W * 0.35} ${yBase}`,
    `S ${x.W * 0.6} ${yBase - a}, ${x.W * 0.72} ${yBase}`,
    `S ${x.W * 0.92} ${yBase + a}, ${x.W} ${yBase}`,
    `L ${x.W} ${x.H} L 0 ${x.H} Z`,
  ].join(' ');
}

export const waveDivider = defineAnimation({
  id: 'wave-divider',
  name: { id: 'Wave Divider', en: 'Wave Divider' },
  blurb: {
    id: 'Tiga lapis gelombang mengalir untuk memisahkan bagian README.',
    en: 'Three flowing wave layers to separate README sections.',
  },
  tier: 'free',
  group: 'divider',
  tags: ['divider', 'wave', 'clean'],
  controls: ['palette', 'accent', 'width', 'height', 'speed', 'radius', 'transparent'],
  aria: 'Animated wave divider',
  defaults: { height: 90 },
  body: (x) => {
    const amplitude = x.H * 0.22;
    const layer = (yBase: number, color: string, opacity: number, dur: number, scale: number) => {
      const d = wavePath(x, yBase, amplitude, scale);
      return h(
        'g',
        {},
        [
          h('path', { d, fill: color, opacity }),
          h('path', { d, fill: color, opacity, transform: `translate(${x.W} 0)` }),
          animateTransform('translate', { dur: x.dur(dur), values: `0 0;${-x.W} 0`, repeatCount: 'indefinite' }),
        ].join(''),
      );
    };

    return [
      layer(x.H * 0.5, x.g1, 0.34, 7, 1),
      layer(x.H * 0.63, x.g2, 0.26, 5.5, 0.72),
      layer(x.H * 0.74, x.g3, 0.2, 4.5, 0.5),
    ].join('');
  },
});

export const pulseLine = defineAnimation({
  id: 'pulse-line',
  name: { id: 'Pulse Line', en: 'Pulse Line' },
  blurb: {
    id: 'Garis denyut seperti monitor jantung dengan penanda berjalan.',
    en: 'A heartbeat monitor line with a travelling marker.',
  },
  tier: 'free',
  group: 'divider',
  tags: ['divider', 'pulse', 'tech'],
  aria: 'Animated pulse divider line',
  defaults: { height: 80 },
  body: (x) => {
    const mid = x.H / 2;
    const segment = x.W / 6;
    const peak = x.H * 0.34;
    const d = `M0 ${mid} L ${segment * 1.6} ${mid} L ${segment * 1.85} ${mid - peak} L ${segment * 2.1} ${mid + peak * 0.6} L ${segment * 2.35} ${mid} L ${x.W} ${mid}`;
    const trail = x.W * 0.22;
    const total = x.W * 1.3;
    x.addDef(
      linearGradient(
        x.id('trail'),
        [
          { offset: '0%', color: x.g1, opacity: 0 },
          { offset: '50%', color: x.g2, opacity: 0.95 },
          { offset: '100%', color: x.g3, opacity: 0 },
        ],
        { gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: x.W, y2: 0 },
      ),
    );

    return [
      h('path', { d, fill: 'none', stroke: x.border, 'stroke-width': 2, opacity: 0.7 }),
      h(
        'path',
        {
          d,
          fill: 'none',
          stroke: `url(#${x.id('trail')})`,
          'stroke-width': 3,
          'stroke-linecap': 'round',
          'stroke-dasharray': `${trail.toFixed(1)} ${total.toFixed(1)}`,
          filter: `url(#${x.id('glow')})`,
        },
        [animate('stroke-dashoffset', { dur: x.dur(3.4), values: `${trail.toFixed(1)};${(-total).toFixed(1)}`, repeatCount: 'indefinite' })].join(''),
      ),
      h(
        'circle',
        { cx: 0, cy: mid, r: 4, fill: x.g2, filter: `url(#${x.id('glow')})` },
        [
          animate('cx', { dur: x.dur(3.4), values: `0;${x.W}`, repeatCount: 'indefinite' }),
          animate('cy', {
            dur: x.dur(3.4),
            values: `${mid};${mid};${mid - peak};${mid + peak * 0.6};${mid};${mid}`,
            keyTimes: '0;0.28;0.32;0.36;0.4;1',
            repeatCount: 'indefinite',
          }),
          animate('r', { dur: x.dur(3.4), values: '3;5;3', repeatCount: 'indefinite' }),
        ].join(''),
      ),
    ].join('');
  },
});

export const marqueeBand = defineAnimation({
  id: 'marquee-band',
  name: { id: 'Marquee Band', en: 'Marquee Band' },
  blurb: {
    id: 'Pita teks berjalan dengan dua arah berlawanan — cocok untuk skill atau slogan.',
    en: 'Opposing scrolling text ribbons — perfect for skills or slogans.',
  },
  tier: 'free',
  group: 'divider',
  tags: ['divider', 'marquee', 'text', 'ticker'],
  controls: ['palette', 'accent', 'width', 'height', 'speed', 'radius', 'glow', 'transparent', 'font', 'title', 'subtitle'],
  aria: 'Animated marquee text band',
  defaults: { height: 120, title: 'DESIGN • DEVELOP • DEPLOY', subtitle: 'OPEN SOURCE • SINCE 2024' },
  body: (x) => {
    const ribbon = (y: number, height: number, text: string, reverse: boolean, color: string, opacity: number, dur: number) => {
      const fontSize = height * 0.52;
      const approxCharWidth = fontSize * 0.58;
      const repeats = Math.max(2, Math.ceil(x.W / Math.max(1, text.length * approxCharWidth)) + 1);
      const content = Array.from({ length: repeats }, () => `${text}   `).join('');
      const textNode = (offsetX: number) =>
        h(
          'text',
          {
            x: offsetX,
            y: y + height * 0.68,
            'font-family': x.font,
            'font-size': fontSize,
            'font-weight': 800,
            fill: color,
            'letter-spacing': fontSize * 0.1,
          },
          content,
        );
      return [
        h('rect', { x: 0, y, width: x.W, height, fill: x.surface, opacity: opacity * 0.55 }),
        h('rect', { x: 0, y, width: x.W, height: 1, fill: color, opacity: 0.35 }),
        h('rect', { x: 0, y: y + height - 1, width: x.W, height: 1, fill: color, opacity: 0.35 }),
        h('g', {}, [textNode(0), textNode(x.W), animateTransform('translate', {
          dur: x.dur(dur),
          values: reverse ? `${-x.W} 0;0 0` : `0 0;${-x.W} 0`,
          repeatCount: 'indefinite',
        })].join('')),
      ].join('');
    };

    return [
      ribbon(x.H * 0.14, x.H * 0.32, x.config.title, false, x.g1, 0.26, 9),
      ribbon(x.H * 0.54, x.H * 0.32, x.config.subtitle, true, x.g2, 0.22, 11),
    ].join('');
  },
});

export const orbitTitle = defineAnimation({
  id: 'orbit-title',
  name: { id: 'Orbit Title', en: 'Orbit Title' },
  blurb: {
    id: 'Judul di tengah dengan planet kecil mengorbit di sekelilingnya.',
    en: 'A centred headline with tiny worlds orbiting around it.',
  },
  tier: 'free',
  group: 'divider',
  tags: ['divider', 'space', 'orbit', 'playful'],
  aria: 'Animated orbit divider with planets',
  defaults: { height: 160 },
  body: (x) => {
    const cx = x.anchorX();
    const cy = x.H * 0.54;
    const rx = Math.min(x.W * 0.34, x.dev(330, 'w'));
    const ry = x.H * 0.3;

    const orbit = (scale: number, color: string, dotR: number, dur: number, reverse: boolean) =>
      h(
        'g',
        {},
        [
          h('ellipse', { cx, cy, rx: rx * scale, ry: ry * scale, fill: 'none', stroke: x.border, 'stroke-width': 1.2, opacity: 0.75 }),
          h(
            'g',
            {},
            [
              h('circle', { cx: cx + rx * scale, cy, r: dotR, fill: color, filter: x.glow ? `url(#${x.id('glow')})` : undefined }),
              animateTransform('rotate', {
                dur: x.dur(dur),
                values: reverse ? `${cx} ${cy};${360 + cx} ${cy}` : `${cx} ${cy};${-360 + cx} ${cy}`,
                repeatCount: 'indefinite',
              }),
            ].join(''),
          ),
        ].join(''),
      );

    return [
      orbit(1, x.g1, 6, 12, false),
      orbit(0.72, x.g2, 4.4, 8.5, true),
      orbit(0.48, x.g3, 3.2, 6, false),
      h('circle', { cx, cy, r: x.H * 0.13, fill: `url(#${x.id('accent')})`, filter: `url(#${x.id('glow')})` }, [
        animate('r', { dur: x.dur(4.5), values: `${x.H * 0.12};${x.H * 0.145};${x.H * 0.12}`, repeatCount: 'indefinite' }),
      ].join('')),
      x.heading(x.config.title, { y: cy + x.H * 0.06, size: x.dev(30, 'h'), filter: x.glow ? `url(#${x.id('glow')})` : undefined }),
    ].join('');
  },
});
