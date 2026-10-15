/** Dev-only: writes one ZIP per template so it can be checked by external tools. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ALL_TEMPLATES } from '../src/templates';
import { templateFiles } from '../src/lib/exporter';
import { createZip } from '../src/lib/zip';
import { slugify } from '../src/lib/exporter';

const outDir = resolve(process.argv[2] ?? '/tmp/zips');
mkdirSync(outDir, { recursive: true });

for (const template of ALL_TEMPLATES) {
  const files = templateFiles(template, null, { includeGuide: true });
  const bytes = await createZip(files.map((file) => ({ path: file.path, content: file.content })), { compress: true });
  const target = resolve(outDir, `nexsolarix-${slugify(template.name.en)}.zip`);
  writeFileSync(target, bytes);
}
console.log(`wrote ${ALL_TEMPLATES.length} archives to ${outDir}`);
