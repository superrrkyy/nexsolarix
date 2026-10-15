/**
 * Dev-only: boots the preview server and checks that every route answers with
 * the app shell and no runtime error markers.
 *   node tools/smoke-http.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = 'dist';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let file = join(root, url.pathname);
  if (!existsSync(file) || url.pathname === '/') file = join(root, 'index.html');
  try {
    const body = readFileSync(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('missing');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const routes = ['/', '/templates', '/templates/aurora-profile', '/templates/holo-profile', '/animations', '/animations/aurora-banner', '/animations/holo-card', '/premium', '/guide', '/owner', '/nope'];
let failed = 0;
for (const route of routes) {
  const response = await fetch(`http://127.0.0.1:${port}${route}`);
  const html = await response.text();
  const ok = response.status === 200 && html.includes('<div id="root">');
  if (!ok) failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${response.status} ${route} (${html.length} bytes)`);
}
server.close();
console.log(failed === 0 ? 'route smoke: all good' : `route smoke: ${failed} failures`);
process.exit(failed === 0 ? 0 : 1);
