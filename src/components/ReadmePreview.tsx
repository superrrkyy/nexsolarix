import { useMemo } from 'react';
import { renderMarkdown } from '../lib/markdown';

/**
 * Renders the generated README with a GitHub-ish look. The markdown goes
 * through our own small renderer (escape-first + tag whitelist), so the
 * preview cannot execute anything a visitor typed.
 */
export function ReadmePreview({ markdown }: { markdown: string }) {
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />;
}
