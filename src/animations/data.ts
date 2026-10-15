import { defineAnimation, equalizerBars, progressArc, h, linearGradient, textEl, animate, animateTransform, shimmerBand } from '../lib/svgkit';

/* ------------------------------------------------------------------ *
 * Data group — charts, meters and badge rows.
 * ------------------------------------------------------------------ */

export const skillBars = defineAnimation({
  id: 'skill-bars',
  name: { id: 'Skill Bars', en: 'Skill Bars' },
  blurb: {
    id: 'Bar keterampilan yang terisi bergantian dengan label dan persentase.',
    en: 'Skill meters that fill in sequence with labels and percentages.',
  },
  tier: 'free',
  group: 'data',
  tags: ['data', 'skills', 'bars', 'stats'],
  aria: 'Animated skill bars',
  defaults: { height: 280, width: 780 },
  body: (x) => {
    const rows = [
      { label: 'TypeScript', value: 94, color: x.g1 },
      { label: 'React & Three.js', value: 88, color: x.g2 },
      { label: 'Design systems', value: 79, color: x.g3 },
      { label: 'DevOps', value: 66, color: x.g2 },
    ];
    const trackX = x.dev(210, 'w');
    const trackW = x.W - trackX - x.dev(120, 'w');
    const rowHeight = x.H / (rows.length + 1);
    const thickness = Math.max(8, rowHeight * 0.24);

    return rows
      .map((row, index) => {
        const y = rowHeight * (index + 0.7);
        const width = trackW * (row.value / 100);
        const delay = `${(index * 0.28).toFixed(2)}s`;
        return [
          textEl(row.label, {
            x: x.dev(40, 'w'),
            y: y + thickness * 0.36,
            size: x.dev(15, 'h'),
            fill: x.text,
            font: x.font,
            weight: 600,
            anchor: 'start',
          }),
          h('rect', { x: trackX, y, width: trackW, height: thickness, rx: thickness / 2, fill: x.surface, stroke: x.border, 'stroke-width': 1 }),
          h(
            'rect',
            { x: trackX, y, width: 0, height: thickness, rx: thickness / 2, fill: row.color },
            [
              animate('width', {
                dur: x.dur(1.5),
                begin: delay,
                values: `0;${width.toFixed(1)};${width.toFixed(1)};${(width * 0.86).toFixed(1)};${width.toFixed(1)}`,
                keyTimes: '0;0.42;0.7;0.86;1',
                repeatCount: 'indefinite',
              }),
              animate('opacity', { dur: x.dur(3.2), begin: delay, values: '0.9;1;0.85;1', repeatCount: 'indefinite' }),
            ].join(''),
          ),
          h(
            'text',
            {
              x: trackX + trackW + x.dev(16, 'w'),
              y: y + thickness * 0.78,
              'font-family': x.font,
              'font-size': x.dev(14, 'h'),
              'font-weight': 700,
              fill: row.color,
            },
            `${row.value}%`,
          ),
        ].join('');
      })
      .join('');
  },
});

export const equalizerCard = defineAnimation({
  id: 'equalizer-card',
  name: { id: 'Equalizer Card', en: 'Equalizer Card' },
  blurb: {
    id: 'Kartu "now playing" dengan equalizer dan piringan berputar.',
    en: 'A now-playing card with a live equalizer and spinning record.',
  },
  tier: 'free',
  group: 'data',
  tags: ['data', 'music', 'audio', 'card'],
  aria: 'Animated now playing equalizer card',
  defaults: { height: 220, title: 'Now Playing', subtitle: 'Lo-fi beats to code to', label: 'playlist 04' },
  body: (x) => {
    const discR = x.H * 0.28;
    const discCx = x.W * 0.16;
    const discCy = x.H * 0.5;

    return [
      h(
        'g',
        {},
        [
          h('circle', { cx: discCx, cy: discCy, r: discR, fill: x.surface, stroke: x.border, 'stroke-width': 1.4 }),
          h('circle', { cx: discCx, cy: discCy, r: discR * 0.62, fill: 'none', stroke: x.border, 'stroke-width': 1, opacity: 0.8 }),
          h('circle', { cx: discCx, cy: discCy, r: discR * 0.34, fill: `url(#${x.id('accent')})`, opacity: 0.9 }),
          h('circle', { cx: discCx, cy: discCy, r: discR * 0.09, fill: x.bg }),
          animateTransform('rotate', { dur: x.dur(6), values: `${discCx} ${discCy};${discCx + 360} ${discCy}`, repeatCount: 'indefinite' }),
        ].join(''),
      ),
      textEl(x.config.title, {
        x: x.W * 0.32,
        y: x.H * 0.34,
        size: x.dev(24, 'h'),
        fill: x.text,
        font: x.font,
        weight: 800,
        anchor: 'start',
      }),
      textEl(x.config.subtitle, {
        x: x.W * 0.32,
        y: x.H * 0.5,
        size: x.dev(15, 'h'),
        fill: x.muted,
        font: x.font,
        anchor: 'start',
      }),
      equalizerBars(x, {
        x: x.W * 0.32,
        y: x.H * 0.6,
        width: x.W * 0.52,
        height: x.H * 0.22,
        bars: 26,
        color: x.g2,
        dur: 1.5,
      }),
      textEl(x.config.label, {
        x: x.W - x.dev(40, 'w'),
        y: x.H * 0.34,
        size: x.dev(13, 'h'),
        fill: x.g1,
        font: x.font,
        weight: 700,
        anchor: 'end',
      }),
      h('circle', { cx: x.W - x.dev(48, 'w'), cy: x.H * 0.5, r: 5, fill: x.g3 }, [
        animate('opacity', { dur: '1.6s', values: '1;0.25;1', repeatCount: 'indefinite' }),
      ].join('')),
      x.vignette(0.2),
    ].join('');
  },
});

export const loadingBar = defineAnimation({
  id: 'loading-bar',
  name: { id: 'Loading Bar', en: 'Loading Bar' },
  blurb: {
    id: 'Progress bar tipis dengan kilau dan cincin pemuat.',
    en: 'A slim progress bar with a sheen and a loading ring.',
  },
  tier: 'free',
  group: 'data',
  tags: ['data', 'loading', 'progress', 'minimal'],
  aria: 'Animated loading progress bar',
  defaults: { height: 150 },
  body: (x) => {
    const trackW = Math.min(x.W * 0.66, x.dev(620, 'w'));
    const trackX = (x.W - trackW) / 2;
    const trackY = x.H * 0.58;
    const height = Math.max(8, x.H * 0.08);

    x.addDef(
      linearGradient(x.id('fill'), [
        { offset: '0%', color: x.g1 },
        { offset: '50%', color: x.g2 },
        { offset: '100%', color: x.g3 },
      ], { gradientUnits: 'userSpaceOnUse', x1: trackX, y1: 0, x2: trackX + trackW, y2: 0 }),
    );

    return [
      textEl(x.config.title, {
        x: x.W / 2,
        y: x.H * 0.28,
        size: x.dev(20, 'h'),
        fill: x.text,
        font: x.font,
        weight: 700,
      }),
      h('rect', { x: trackX, y: trackY, width: trackW, height, rx: height / 2, fill: x.surface, stroke: x.border, 'stroke-width': 1 }),
      h(
        'rect',
        { x: trackX, y: trackY, width: 0, height, rx: height / 2, fill: `url(#${x.id('fill')})`, filter: x.glow ? `url(#${x.id('glow')})` : undefined },
        [
          animate('width', {
            dur: x.dur(4.2),
            values: `0;${(trackW * 0.62).toFixed(1)};${(trackW * 0.72).toFixed(1)};${(trackW * 0.94).toFixed(1)};0`,
            keyTimes: '0;0.45;0.6;0.92;1',
            repeatCount: 'indefinite',
            calcMode: 'spline',
            keySplines: '0.2 0.8 0.2 1;0 0 1 1;0.2 0.8 0.2 1;0.4 0 0.6 1',
          }),
        ].join(''),
      ),
      shimmerBand(x, { y: trackY, height, dur: 2.2, opacity: 0.5, width: trackW * 0.2 }),
      textEl(x.config.subtitle, {
        x: x.W / 2,
        y: x.H * 0.84,
        size: x.dev(13, 'h'),
        fill: x.muted,
        font: x.font,
        weight: 600,
      }),
      h(
        'g',
        {},
        [
          h('circle', { cx: trackX - 26, cy: trackY + height / 2, r: height * 0.6, fill: 'none', stroke: x.g2, 'stroke-width': 2.2, 'stroke-dasharray': `${height * 1.9} ${height * 3.8}`, 'stroke-linecap': 'round' }),
          animateTransform('rotate', {
            dur: x.dur(1.4),
            values: `${trackX - 26} ${trackY + height / 2};${trackX - 26 + 360} ${trackY + height / 2}`,
            repeatCount: 'indefinite',
          }),
        ].join(''),
      ),
    ].join('');
  },
});

export const badgeRow = defineAnimation({
  id: 'badge-row',
  name: { id: 'Badge Row', en: 'Badge Row' },
  blurb: {
    id: 'Deretan badge yang muncul satu per satu dengan efek pop.',
    en: 'A row of badges that pop in one after another.',
  },
  tier: 'free',
  group: 'data',
  tags: ['data', 'badges', 'shields', 'minimal'],
  controls: ['palette', 'accent', 'width', 'height', 'speed', 'radius', 'glow', 'transparent', 'font'],
  aria: 'Animated badge row',
  defaults: { height: 120, width: 860 },
  body: (x) => {
    const items = [
      { label: 'v1.0.0', color: x.g1 },
      { label: 'MIT License', color: x.g2 },
      { label: 'build passing', color: x.g3 },
      { label: 'PRs welcome', color: x.g2 },
      { label: 'made with ♥', color: x.g1 },
    ];
    const size = x.dev(15, 'h');
    const gap = size * 1.1;
    const widths = items.map((item) => item.label.length * size * 0.62 + size * 2.4);
    const total = widths.reduce((sum, value) => sum + value, 0) + gap * (items.length - 1);
    let cursor = (x.W - total) / 2;
    const y = x.H / 2;

    return items
      .map((item, index) => {
        const width = widths[index] as number;
        const block = h(
          'g',
          { transform: `translate(${cursor} ${y}) scale(0)`, opacity: 0 },
          [
            animateTransform('scale', {
              dur: x.dur(0.6),
              begin: `${(index * 0.24).toFixed(2)}s`,
              values: '0;1.12;1;1;0',
              keyTimes: '0;0.45;0.68;0.88;1',
              repeatCount: 'indefinite',
              additive: 'sum',
            }),
            animate('opacity', {
              dur: x.dur(6),
              begin: `${(index * 0.24).toFixed(2)}s`,
              values: '0;1;1;0;0',
              keyTimes: '0;0.08;0.8;0.92;1',
              repeatCount: 'indefinite',
            }),
            h('rect', { x: -width / 2, y: -size * 1.15, width, height: size * 2.3, rx: size * 0.5, fill: item.color, opacity: 0.16 }),
            h('rect', { x: -width / 2, y: -size * 1.15, width, height: size * 2.3, rx: size * 0.5, fill: 'none', stroke: item.color, 'stroke-width': 1.2 }),
            h('circle', { cx: -width / 2 + size * 1.1, cy: 0, r: size * 0.34, fill: item.color }),
            textEl(item.label, {
              x: -width / 2 + size * 1.9,
              y: size * 0.42,
              size,
              fill: x.text,
              font: x.font,
              weight: 700,
              anchor: 'start',
              letterSpacing: 0.4,
            }),
          ].join(''),
        );
        cursor += width + gap;
        return block;
      })
      .join('');
  },
});

export const ringStats = defineAnimation({
  id: 'ring-stats',
  name: { id: 'Ring Stats', en: 'Ring Stats' },
  blurb: {
    id: 'Tiga cincin progres beranimasi dengan nilai persentase.',
    en: 'Three animated progress rings with percentage readouts.',
  },
  tier: 'free',
  group: 'data',
  tags: ['data', 'rings', 'progress', 'stats'],
  aria: 'Animated progress ring statistics',
  defaults: { height: 260, width: 820 },
  body: (x) => {
    const items = [
      { value: 82, label: 'Frontend', color: x.g1 },
      { value: 74, label: 'Backend', color: x.g2 },
      { value: 91, label: 'Design', color: x.g3 },
    ];
    const radius = Math.min(x.H * 0.28, x.W / 8);
    const spacing = x.W / (items.length + 1);

    return items
      .map((item, index) => {
        const cx = spacing * (index + 1);
        const cy = x.H * 0.46;
        return [
          progressArc(x, {
            cx,
            cy,
            r: radius,
            percent: item.value,
            color: item.color,
            track: x.surface,
            width: Math.max(5, radius * 0.16),
            dur: 4.4,
          }),
          h(
            'g',
            {},
            [
              h('circle', { cx: cx + radius, cy, r: Math.max(2.6, radius * 0.075), fill: item.color, filter: x.glow ? `url(#${x.id('glow')})` : undefined }),
              animateTransform('rotate', {
                dur: x.dur(4.4),
                values: `${cx} ${cy};${cx + 360} ${cy}`,
                repeatCount: 'indefinite',
              }),
            ].join(''),
          ),
          textEl(`${item.value}%`, {
            x: cx,
            y: cy + radius * 0.16,
            size: radius * 0.52,
            fill: x.text,
            font: x.font,
            weight: 800,
            anchor: 'middle',
          }),
          textEl(item.label, {
            x: cx,
            y: cy + radius + x.dev(28, 'h'),
            size: x.dev(14, 'h'),
            fill: x.muted,
            font: x.font,
            weight: 600,
            anchor: 'middle',
          }),
        ].join('');
      })
      .join('');
  },
});
