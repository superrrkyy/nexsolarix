/**
 * Dev-only helper: renders one template's assets (plus its README) to a folder
 * so a change to the builder can be eyeballed without opening the site.
 *
 *   npx vite-node tools/render-template.ts -- aurora-profile /tmp/tpl
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getTemplate } from '../src/templates';
import { templateFiles } from '../src/lib/exporter';

const id = process.argv[2] ?? 'aurora-profile';
const outDir = resolve(process.argv[3] ?? 'samples/template');
const template = getTemplate(id);
if (!template) throw new Error(`unknown template: ${id}`);

const height = Number(process.env.HEIGHT ?? 0) || undefined;
const files = templateFiles(template, height ? { height } : null, { includeGuide: false });
mkdirSync(outDir, { recursive: true });
for (const file of files) {
  const target = resolve(outDir, file.path.replace(/\//g, '__'));
  writeFileSync(target, file.content);
}
console.log(`${template.id}: wrote ${files.length} files to ${outDir}`);
