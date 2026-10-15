import { ALL_TEMPLATES } from '../src/templates';
import { templateReadme } from '../src/lib/exporter';
const t = ALL_TEMPLATES[0]!;
const readme = templateReadme(t, null);
console.log('--- FIRST 900 CHARS of', t.id, '---');
console.log(readme.slice(0, 900));
console.log('--- contains <svg?', readme.includes('<svg'));
console.log('--- img srcs:', [...readme.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]));
