/**
 * A deliberately small Markdown renderer for the README preview.
 *
 * It only needs to render what NexSolarix itself generates: headings, bold,
 * inline code, links, images, tables, lists, checklists, fences, quotes and a
 * handful of HTML tags GitHub happens to allow (`<div align>`, `<details>`,
 * `<summary>`, `<sub>`, `<br>`).
 *
 * Safety model: everything is escaped first, then a small set of exact tag
 * patterns is un-escaped. Anything a visitor types into a title field stays
 * escaped text, so it can never inject markup.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const ALLOWED_TAG_PATTERNS: [RegExp, string][] = [
  [/&lt;div align=&quot;(center|left|right)&quot;&gt;/g, '<div class="md-align-$1">'],
  [/&lt;\/div&gt;/g, '</div>'],
  [/&lt;details&gt;/g, '<details class="md-details">'],
  [/&lt;\/details&gt;/g, '</details>'],
  [/&lt;summary&gt;/g, '<summary>'],
  [/&lt;\/summary&gt;/g, '</summary>'],
  [/&lt;b&gt;/g, '<b>'],
  [/&lt;\/b&gt;/g, '</b>'],
  [/&lt;i&gt;/g, '<i>'],
  [/&lt;\/i&gt;/g, '</i>'],
  [/&lt;sub&gt;/g, '<sub>'],
  [/&lt;\/sub&gt;/g, '</sub>'],
  [/&lt;br\s*\/?&gt;/g, '<br />'],
  [/&lt;hr\s*\/?&gt;/g, '<hr />'],
  [/&lt;img src=&quot;([^&]+?)&quot;\s*(?:alt=&quot;([^&]*?)&quot;)?\s*(?:width=&quot;([^&]*?)&quot;)?\s*\/?&gt;/g, '<img src="$1" alt="$2" width="$3" loading="lazy" />'],
];

function restoreAllowedTags(escaped: string): string {
  return ALLOWED_TAG_PATTERNS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), escaped);
}

function inline(value: string): string {
  let out = escapeHtml(value);
  // keep raw html tags we generate, then treat everything else as literal text
  out = value.startsWith('<') ? value : out;
  if (value.startsWith('<')) {
    out = value;
  } else {
    out = escapeHtml(value);
  }
  out = out
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" rel="noreferrer noopener" target="_blank">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return out;
}

function inlineSafe(value: string): string {
  const escaped = escapeHtml(value);
  const restored = restoreAllowedTags(escaped);
  return restored
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" rel="noreferrer noopener" target="_blank">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
}

void inline;

function renderTableRow(row: string, cellTag: 'th' | 'td'): string {
  const cells = row
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => `<${cellTag}>${inlineSafe(cell.trim())}</${cellTag}>`)
    .join('');
  return `<tr>${cells}</tr>`;
}

export function renderMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let index = 0;
  let inCode = false;
  let codeLanguage = '';
  let codeBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${paragraph.map(inlineSafe).join('<br />')}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  while (index < lines.length) {
    const line = lines[index] as string;

    if (line.trimStart().startsWith('```')) {
      if (inCode) {
        html.push(
          `<pre class="md-pre"><code data-lang="${escapeHtml(codeLanguage)}">${escapeHtml(codeBuffer.join('\n'))}</code></pre>`,
        );
        inCode = false;
        codeBuffer = [];
        codeLanguage = '';
      } else {
        flushParagraph();
        closeList();
        inCode = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      index += 1;
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      index += 1;
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      closeList();
      index += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      closeList();
      const level = (heading[1] as string).length;
      const content = (heading[2] as string).replace(/^#+\s*/, '');
      html.push(`<h${level}>${inlineSafe(content)}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushParagraph();
      closeList();
      html.push('<hr />');
      index += 1;
      continue;
    }

    // tables
    if (line.trim().startsWith('|') && (lines[index + 1] ?? '').includes('---')) {
      flushParagraph();
      closeList();
      html.push('<table class="md-table"><thead>');
      html.push(renderTableRow(line, 'th'));
      html.push('</thead><tbody>');
      index += 2;
      while (index < lines.length && (lines[index] as string).trim().startsWith('|')) {
        html.push(renderTableRow(lines[index] as string, 'td'));
        index += 1;
      }
      html.push('</tbody></table>');
      continue;
    }

    const checklist = /^(\s*)[-*]\s+\[( |x|X)\]\s+(.*)$/.exec(line);
    if (checklist) {
      flushParagraph();
      if (listType !== 'ul') {
        closeList();
        listType = 'ul';
        html.push('<ul class="md-checklist">');
      }
      const checked = (checklist[2] as string).toLowerCase() === 'x';
      html.push(
        `<li><span class="md-check ${checked ? 'is-checked' : ''}" aria-hidden="true">${checked ? '✓' : ''}</span>${inlineSafe(checklist[3] as string)}</li>`,
      );
      index += 1;
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      if (listType !== 'ul') {
        closeList();
        listType = 'ul';
        html.push('<ul>');
      }
      html.push(`<li>${inlineSafe(bullet[1] as string)}</li>`);
      index += 1;
      continue;
    }

    const ordered = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ordered) {
      flushParagraph();
      if (listType !== 'ol') {
        closeList();
        listType = 'ol';
        html.push('<ol>');
      }
      html.push(`<li>${inlineSafe(ordered[1] as string)}</li>`);
      index += 1;
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      flushParagraph();
      closeList();
      html.push(`<blockquote>${inlineSafe(quote[1] as string)}</blockquote>`);
      index += 1;
      continue;
    }

    if (/^\s*<!--/.test(line)) {
      index += 1;
      continue;
    }

    // raw (whitelisted) html block such as <div align="center"> or <details>
    if (/^\s*<(\/?)(div|details|summary|p|br|img|hr)/i.test(line)) {
      flushParagraph();
      closeList();
      html.push(restoreAllowedTags(escapeHtml(line.trim())));
      index += 1;
      continue;
    }

    paragraph.push(line);
    index += 1;
  }

  flushParagraph();
  closeList();
  if (inCode && codeBuffer.length > 0) {
    html.push(`<pre class="md-pre"><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }

  return html.join('\n');
}
