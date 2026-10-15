import { defineAnimation, panelChrome, h, linearGradient, radialGradient, textEl, animate, animateTransform, shimmerBand } from '../lib/svgkit';

/* ------------------------------------------------------------------ *
 * Card group — self-contained "widget" visuals for a profile README.
 * ------------------------------------------------------------------ */

export const terminalType = defineAnimation({
  id: 'terminal-type',
  name: { id: 'Terminal Type', en: 'Terminal Type' },
  blurb: {
    id: 'Jendela terminal dengan baris perintah yang diketik dan kursor berkedip.',
    en: 'A terminal window that types its commands with a blinking caret.',
  },
  tier: 'free',
  group: 'card',
  tags: ['card', 'terminal', 'developer', 'typing'],
  aria: 'Animated terminal window typing commands',
  defaults: { height: 280 },
  body: (x) => {
    const pad = x.dev(26, 'w');
    const box = { x: pad, y: x.H * 0.1, width: x.W - pad * 2, height: x.H * 0.8 };
    const inner = { x: box.x + 24, y: box.y + 54 };
    const lineHeight = x.dev(21, 'h');
    const mono = x.font;
    const lines = [
      { text: '$ npx nexsolarix init', color: x.g2, delay: 0.1 },
      { text: '✔ reading config', color: x.g1, delay: 1.4 },
      { text: '✔ rendering 34 animated assets', color: x.g1, delay: 2.2 },
      { text: '➜ README ready to publish', color: x.g3, delay: 3.1 },
    ];

    const typing = lines
      .map((line, index) => {
        const y = inner.y + index * lineHeight;
        const width = Math.min(box.width - 48, line.text.length * x.dev(11, 'h') * 0.62);
        const maskId = x.id(`type-${index}`);
        x.addDef(
          h('clipPath', { id: maskId }, [
            h('rect', { x: inner.x, y: y - lineHeight * 0.8, width: 0, height: lineHeight * 1.2 }, [
              animate('width', { dur: x.dur(0.9), begin: `${line.delay}s`, values: `0;${width.toFixed(1)}`, repeatCount: '1', fill: 'freeze' }),
            ].join('')),
          ].join('')),
        );
        return h(
          'g',
          { 'clip-path': `url(#${maskId})` },
          [
            h(
              'text',
              { x: inner.x, y, 'font-family': mono, 'font-size': x.dev(15, 'h'), fill: line.color, 'font-weight': 600 },
              line.text,
            ),
            h('rect', { x: inner.x + width + 8, y: y - lineHeight * 0.7, width: x.dev(9, 'h'), height: lineHeight * 0.85, fill: x.g3, opacity: 0 }, [
              animate('opacity', { dur: '1s', begin: `${line.delay}s`, values: '0;1;1;0;1', repeatCount: 'indefinite' }),
            ].join('')),
          ].join(''),
        );
      })
      .join('');

    return [
      h('rect', { x: 0, y: 0, width: x.W, height: x.H, fill: `url(#${x.id('bg')})`, rx: x.config.radius }),
      panelChrome(x, { x: box.x, y: box.y, width: box.width, height: box.height, title: 'nexsolarix — zsh' }),
      h('rect', { x: box.x, y: box.y + 38, width: box.width, height: 1, fill: x.border }),
      h('g', { 'font-family': mono }, typing),
      h('rect', { x: box.x, y: box.y + box.height - 26, width: box.width, height: 1, fill: x.border, opacity: 0.7 }),
      textEl(`${x.config.label} · ${x.config.subtitle}`, {
        x: box.x + 24,
        y: box.y + box.height - 9,
        size: x.dev(12, 'h'),
        fill: x.muted,
        font: mono,
        anchor: 'start',
        opacity: 0.85,
      }),
      x.vignette(0.25),
    ].join('');
  },
});

export const profileCard = defineAnimation({
  id: 'profile-card',
  name: { id: 'Profile Card', en: 'Profile Card' },
  blurb: {
    id: 'Kartu profil dengan cincin avatar berputar dan statistik bergaya.',
    en: 'A profile card with a spinning avatar ring and styled stats.',
  },
  tier: 'free',
  group: 'card',
  tags: ['card', 'profile', 'avatar', 'stats'],
  aria: 'Animated profile card with avatar ring',
  defaults: { height: 300, width: 760 },
  body: (x) => {
    const cardW = Math.min(x.W * 0.92, 860);
    const cardH = x.H * 0.84;
    const cardX = (x.W - cardW) / 2;
    const cardY = x.H * 0.08;

    // Three fixed columns so nothing can ever overlap: avatar | text | stats.
    const pad = cardW * 0.045;
    const avatarR = Math.min(cardH * 0.22, cardW * 0.085, 50);
    const avatarCx = cardX + pad + avatarR;
    const avatarCy = cardY + cardH / 2;
    const textX = avatarCx + avatarR + cardW * 0.075;
    const statsW = Math.min(cardW * 0.36, 300);
    const statsX = cardX + cardW - pad - statsW;
    const textW = Math.max(80, statsX - textX - cardW * 0.045);

    x.addDef(
      radialGradient(x.id('avatarFill'), [
        { offset: '0%', color: x.g2, opacity: 0.95 },
        { offset: '60%', color: x.g1, opacity: 0.85 },
        { offset: '100%', color: x.g3, opacity: 0.9 },
      ]),
    );

    // Stats share the right-hand column evenly, so they never collide.
    const stats = [
      { value: '128', label: 'Repositories' },
      { value: '42', label: 'Followers' },
      { value: '9', label: 'Years coding' },
    ];
    const columnW = statsW / stats.length;

    const statBlock = (index: number) => {
      const stat = stats[index] as { value: string; label: string };
      const cellX = statsX + index * columnW;
      const boxW = Math.max(52, columnW - 10);
      const boxX = cellX + (columnW - boxW) / 2;
      const valueSize = Math.min(x.dev(26, 'h'), boxW * 0.42);
      const labelFit = x.fitSize(stat.label, boxW * 0.9, Math.min(x.dev(11, 'h'), boxW * 0.2), 600);
      return h(
        'g',
        {},
        [
          h('rect', {
            x: boxX,
            y: cardY + cardH * 0.26,
            width: boxW,
            height: cardH * 0.48,
            rx: Math.max(8, x.config.radius * 0.6),
            fill: x.surface,
            stroke: x.border,
            'stroke-width': 1,
          }),
          textEl(stat.value, {
            x: boxX + boxW / 2,
            y: cardY + cardH * 0.52,
            size: valueSize,
            fill: x.text,
            font: x.font,
            weight: 800,
            anchor: 'middle',
          }),
          textEl(labelFit.text, {
            x: boxX + boxW / 2,
            y: cardY + cardH * 0.68,
            size: labelFit.size,
            fill: x.muted,
            font: x.font,
            weight: 600,
            anchor: 'middle',
          }),
          h('rect', { x: boxX + boxW * 0.2, y: cardY + cardH * 0.4, width: boxW * 0.6, height: 3, rx: 2, fill: `url(#${x.id('accent')})` }, [
            animate('width', { dur: x.dur(3.2), begin: `${index * 0.3}s`, values: `${boxW * 0.12};${boxW * 0.6};${boxW * 0.12}`, repeatCount: 'indefinite' }),
          ].join('')),
        ].join(''),
      );
    };

    const titleFit = x.fitSize(x.config.title, textW, x.dev(22, 'h'), 800);
    const subtitleFit = x.fitSize(x.config.subtitle, textW, x.dev(14, 'h'), 500);
    const labelFitMain = x.fitSize(x.config.label, textW, x.dev(13, 'h'), 700);

    return [
      h('rect', { x: cardX, y: cardY, width: cardW, height: cardH, rx: x.config.radius, fill: x.surface, stroke: x.border, 'stroke-width': 1.4 }),
      shimmerBand(x, { y: cardY, height: cardH, dur: 5.5, opacity: 0.12, width: cardW * 0.35 }),
      h(
        'g',
        {},
        [
          h('circle', { cx: avatarCx, cy: avatarCy, r: avatarR + 9, fill: 'none', stroke: `url(#${x.id('accent')})`, 'stroke-width': 2.5, 'stroke-dasharray': '6 10' }),
          animateTransform('rotate', {
            dur: x.dur(14),
            values: `${avatarCx} ${avatarCy};${avatarCx + 360} ${avatarCy}`,
            repeatCount: 'indefinite',
          }),
        ].join(''),
      ),
      h('circle', { cx: avatarCx, cy: avatarCy, r: avatarR, fill: `url(#${x.id('avatarFill')})` }),
      h('circle', { cx: avatarCx, cy: avatarCy, r: avatarR * 0.42, fill: x.bg, opacity: 0.85 }, [
        animate('r', { dur: x.dur(4), values: `${avatarR * 0.4};${avatarR * 0.46};${avatarR * 0.4}`, repeatCount: 'indefinite' }),
      ].join('')),
      textEl(titleFit.text, {
        x: textX,
        y: cardY + cardH * 0.38,
        size: titleFit.size,
        fill: x.text,
        font: x.font,
        weight: 800,
        anchor: 'start',
        letterSpacing: 0.6,
      }),
      textEl(subtitleFit.text, {
        x: textX,
        y: cardY + cardH * 0.54,
        size: subtitleFit.size,
        fill: x.muted,
        font: x.font,
        weight: 500,
        anchor: 'start',
      }),
      textEl(labelFitMain.text, {
        x: textX,
        y: cardY + cardH * 0.69,
        size: labelFitMain.size,
        fill: x.g1,
        font: x.font,
        weight: 700,
        anchor: 'start',
      }),
      statBlock(0),
      statBlock(1),
      statBlock(2),
    ].join('');
  },
});

export const glassPanel = defineAnimation({
  id: 'glass-panel',
  name: { id: 'Glass Panel', en: 'Glass Panel' },
  blurb: {
    id: 'Panel kaca dengan kilau menyapu dan deretan chip teknologi.',
    en: 'A glass panel with a sweeping sheen and a row of tech chips.',
  },
  tier: 'free',
  group: 'card',
  tags: ['card', 'glass', 'skills', 'clean'],
  aria: 'Animated glass panel with tech chips',
  defaults: { height: 260 },
  body: (x) => {
    const pad = x.dev(30, 'w');
    const boxX = pad;
    const boxY = x.H * 0.14;
    const boxW = x.W - pad * 2;
    const boxH = x.H * 0.72;

    x.addDef(
      linearGradient(
        x.id('glass'),
        [
          { offset: '0%', color: x.text, opacity: 0.09 },
          { offset: '50%', color: x.text, opacity: 0.03 },
          { offset: '100%', color: x.text, opacity: 0.08 },
        ],
        { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
      ),
    );

    return [
      h('rect', { x: boxX, y: boxY, width: boxW, height: boxH, rx: x.config.radius, fill: `url(#${x.id('glass')})`, stroke: x.border, 'stroke-width': 1.3 }),
      h('rect', { x: boxX, y: boxY, width: boxW, height: boxH, rx: x.config.radius, fill: x.surface, opacity: 0.4 }),
      shimmerBand(x, { y: boxY, height: boxH, dur: 4.2, opacity: 0.26, width: boxW * 0.4 }),
      h(
        'g',
        {},
        [
          h('rect', { x: boxX, y: boxY, width: 3, height: boxH, fill: `url(#${x.id('accent')})`, opacity: 0.9 }),
        ].join(''),
      ),
      textEl(x.config.title, {
        x: boxX + 34,
        y: boxY + boxH * 0.3,
        size: x.dev(26, 'h'),
        fill: x.text,
        font: x.font,
        weight: 800,
        anchor: 'start',
      }),
      textEl(x.config.subtitle, {
        x: boxX + 34,
        y: boxY + boxH * 0.47,
        size: x.dev(14, 'h'),
        fill: x.muted,
        font: x.font,
        anchor: 'start',
      }),
      h('g', { transform: `translate(34 0)` }, x.chips(['TypeScript', 'React', 'Node.js', 'Design'], {
        y: boxY + boxH * 0.76,
        size: x.dev(12, 'h'),
        align: 'start',
      })),
      textEl(x.config.label, {
        x: boxX + boxW - 30,
        y: boxY + boxH * 0.3,
        size: x.dev(13, 'h'),
        fill: x.g2,
        font: x.font,
        weight: 700,
        anchor: 'end',
      }),
      x.vignette(0.2),
    ].join('');
  },
});

export const hudFrame = defineAnimation({
  id: 'hud-frame',
  name: { id: 'HUD Frame', en: 'HUD Frame' },
  blurb: {
    id: 'Bingkai HUD futuristik dengan garis pemindai dan penanda sudut.',
    en: 'A futuristic HUD frame with a scanning line and corner markers.',
  },
  tier: 'free',
  group: 'card',
  tags: ['card', 'hud', 'tech', 'frame'],
  aria: 'Animated HUD frame with scanning line',
  defaults: { height: 240 },
  body: (x) => {
    const inset = x.dev(22, 'w');
    const bracket = x.dev(30, 'h');
    const corners = [
      `M${inset} ${inset + bracket} L${inset} ${inset} L${inset + bracket} ${inset}`,
      `M${x.W - inset - bracket} ${inset} L${x.W - inset} ${inset} L${x.W - inset} ${inset + bracket}`,
      `M${x.W - inset} ${x.H - inset - bracket} L${x.W - inset} ${x.H - inset} L${x.W - inset - bracket} ${x.H - inset}`,
      `M${inset + bracket} ${x.H - inset} L${inset} ${x.H - inset} L${inset} ${x.H - inset - bracket}`,
    ];

    const ticks = Array.from({ length: 14 }, (_, index) => {
      const t = (index + 1) / 15;
      const strong = index % 3 === 0;
      return h('rect', {
        x: (x.W * t).toFixed(1),
        y: x.H - inset - (strong ? 16 : 9),
        width: 1.4,
        height: strong ? 16 : 9,
        fill: x.g2,
        opacity: strong ? 0.85 : 0.4,
      });
    }).join('');

    return [
      x.frame({ inset, stroke: x.border, glow: false }),
      h('g', { fill: 'none', stroke: x.g1, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, corners.map((d) => h('path', { d })).join('')),
      ticks,
      h('rect', { x: inset, y: inset, width: x.W - inset * 2, height: 2, fill: x.g3, opacity: 0.9, filter: `url(#${x.id('glow')})` }, [
        animate('y', { dur: x.dur(4.2), values: `${inset};${x.H - inset - 2}`, repeatCount: 'indefinite' }),
        animate('opacity', { dur: x.dur(4.2), values: '0.95;0.25;0.95', repeatCount: 'indefinite' }),
      ].join('')),
      x.scanlines({ spacing: 4, opacity: 0.035 }),
      x.heading(x.config.title, { y: x.H * 0.42, filter: `url(#${x.id('glow')})` }),
      x.subtitleText(x.config.subtitle, { y: x.H * 0.58 }),
      h('circle', { cx: inset + 16, cy: x.H - inset - 20, r: 4, fill: x.g3 }, [
        animate('opacity', { dur: '1.4s', values: '1;0.2;1', repeatCount: 'indefinite' }),
      ].join('')),
      textEl('SYSTEM ONLINE', {
        x: inset + 28,
        y: x.H - inset - 15,
        size: x.dev(11, 'h'),
        fill: x.g3,
        font: x.font,
        weight: 700,
        anchor: 'start',
      }),
      textEl(x.config.label, {
        x: x.W - inset - 16,
        y: x.H - inset - 15,
        size: x.dev(11, 'h'),
        fill: x.muted,
        font: x.font,
        weight: 600,
        anchor: 'end',
      }),
    ].join('');
  },
});

export const typingQuote = defineAnimation({
  id: 'typing-quote',
  name: { id: 'Typing Quote', en: 'Typing Quote' },
  blurb: {
    id: 'Kutipan yang diketik perlahan dengan tanda kutip dekoratif.',
    en: 'A quote typed out slowly behind decorative quote marks.',
  },
  tier: 'free',
  group: 'card',
  tags: ['card', 'quote', 'text', 'typing'],
  aria: 'Animated typing quote card',
  defaults: { height: 240, title: 'Make it work, make it right, make it fast.', label: '— Kent Beck' },
  body: (x) => {
    const quoteSize = x.dev(34, 'h');
    const textSize = x.dev(22, 'h');
    const lineHeight = textSize * 1.5;
    const words = x.config.title.split(' ');
    const lines: string[] = [];
    const maxWidth = x.W * 0.72;
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length * textSize * 0.56 > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);

    const startY = x.H * 0.44 - ((lines.length - 1) * lineHeight) / 2;
    const body = lines
      .map((line, index) => {
        const y = startY + index * lineHeight;
        const width = line.length * textSize * 0.56;
        const startX = x.align === 'left' ? x.anchorX() : x.align === 'right' ? x.anchorX() - width : x.anchorX() - width / 2;
        const maskId = x.id(`quote-${index}`);
        x.addDef(
          h('clipPath', { id: maskId }, h('rect', { x: startX, y: y - textSize, width: 0, height: textSize * 1.5 }, [
            animate('width', { dur: x.dur(1.1), begin: `${(0.4 + index * 1.1).toFixed(2)}s`, values: `0;${width.toFixed(1)}`, repeatCount: '1', fill: 'freeze' }),
          ].join(''))),
        );
        return h('g', { 'clip-path': `url(#${maskId})` }, [
          textEl(line, { x: startX, y, size: textSize, fill: x.text, font: x.font, weight: 600, anchor: 'start' }),
          h('rect', { x: startX + width + 6, y: y - textSize * 0.8, width: 3, height: textSize, fill: x.g3 }, [
            animate('opacity', { dur: '1.1s', begin: `${(0.4 + index * 1.1).toFixed(2)}s`, values: '1;0;1', repeatCount: 'indefinite' }),
          ].join('')),
        ].join(''));
      })
      .join('');

    return [
      textEl('“', {
        x: x.align === 'left' ? x.anchorX(-30) : x.anchorX() - x.W * 0.3,
        y: x.H * 0.34,
        size: quoteSize * 2.6,
        fill: x.g1,
        font: 'Georgia, serif',
        weight: 700,
        anchor: 'middle',
        opacity: 0.35,
      }),
      h('g', {}, body),
      textEl(x.config.label, {
        x: x.align === 'left' ? x.anchorX() : x.align === 'right' ? x.anchorX() : x.anchorX(),
        y: x.H * 0.82,
        size: x.dev(14, 'h'),
        fill: x.g2,
        font: x.font,
        weight: 700,
        anchor: x.align === 'left' ? 'start' : x.align === 'right' ? 'end' : 'middle',
      }),
      x.vignette(0.25),
    ].join('');
  },
});

export const codePreview = defineAnimation({
  id: 'code-preview',
  name: { id: 'Code Preview', en: 'Code Preview' },
  blurb: {
    id: 'Panel kode ringkas dengan baris yang muncul berurutan dan kursor.',
    en: 'A compact code panel whose lines appear in sequence with a caret.',
  },
  tier: 'free',
  group: 'card',
  tags: ['card', 'code', 'developer', 'window'],
  aria: 'Animated code preview panel',
  defaults: { height: 260, width: 820 },
  body: (x) => {
    const pad = x.dev(26, 'w');
    const box = { x: pad, y: x.H * 0.1, width: x.W - pad * 2, height: x.H * 0.8 };
    const inner = { x: box.x + 66, y: box.y + 62 };
    const lineHeight = x.dev(20, 'h');
    const rows = 7;
    const colors = [x.g1, x.g2, x.g3, x.muted, x.text];

    x.addDef(
      linearGradient(x.id('gutter'), [
        { offset: '0%', color: x.text, opacity: 0.06 },
        { offset: '100%', color: x.text, opacity: 0.02 },
      ]),
    );

    const gutter = Array.from({ length: rows }, (_, index) =>
      h(
        'text',
        {
          x: box.x + 32,
          y: inner.y + index * lineHeight,
          'font-family': x.font,
          'font-size': x.dev(12, 'h'),
          fill: x.muted,
          opacity: 0.6,
        },
        String(index + 1),
      ),
    ).join('');

    const items: string[] = [];
    for (let index = 0; index < rows; index += 1) {
      const ratio = 0.3 + x.rng() * 0.6;
      const indent = Math.round(x.rng() * 2) * lineHeight * 0.9;
      const color = colors[index % colors.length] as string;
      const width = (box.width - 110 - indent) * ratio;
      const delay = `${(0.2 + index * 0.34).toFixed(2)}s`;
      items.push(
        h('g', { opacity: 0 }, [
          animate('opacity', { dur: x.dur(0.5), begin: delay, values: '0;1', repeatCount: '1', fill: 'freeze' }),
          h('rect', {
            x: inner.x + indent,
            y: inner.y + index * lineHeight - lineHeight * 0.34,
            width: width.toFixed(1),
            height: Math.max(3, lineHeight * 0.36),
            rx: 2,
            fill: color,
            opacity: 0.85,
          }),
        ].join('')),
      );
    }

    return [
      h('rect', { x: 0, y: 0, width: x.W, height: x.H, fill: `url(#${x.id('bg')})`, rx: x.config.radius }),
      panelChrome(x, { x: box.x, y: box.y, width: box.width, height: box.height, title: x.config.title }),
      h('rect', { x: box.x, y: box.y + 38, width: box.width, height: 1, fill: x.border }),
      h('rect', { x: box.x + 1, y: box.y + 39, width: 54, height: box.height - 40, fill: `url(#${x.id('gutter')})` }),
      h('g', { 'font-family': x.font }, gutter),
      items.join(''),
      h('rect', { x: inner.x, y: inner.y + rows * lineHeight - lineHeight * 0.34, width: x.dev(10, 'h'), height: lineHeight * 0.8, fill: x.g3, opacity: 0.9 }, [
        animate('opacity', { dur: '1s', values: '1;0;1', repeatCount: 'indefinite' }),
      ].join('')),
      textEl(x.config.label, {
        x: box.x + box.width - 22,
        y: box.y + 24.5,
        size: x.dev(12, 'h'),
        fill: x.muted,
        font: x.font,
        weight: 600,
        anchor: 'end',
      }),
    ].join('');
  },
});
