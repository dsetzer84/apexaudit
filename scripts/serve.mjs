#!/usr/bin/env node
/**
 * ApexAudit AI - local preview server with SPA fallback.
 *
 * Mirrors the Vercel behaviour declared in vercel.json: known static files are
 * served as-is; any extension-less path (/app, /history, /compare/ahrefs, ...)
 * falls back to index.html so the client router takes over. Unknown extension
 * paths return the styled 404.html with status 404.
 *
 * Usage: node scripts/serve.mjs [port]   (default 3000, or $PORT)
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

// Serve the compiled Vite output (run `npm run build` first).
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.argv[2] || process.env.PORT || 3000);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function send(res, status, body, type = 'text/html; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'public, max-age=0, must-revalidate' });
  res.end(body);
}

const server = createServer((req, res) => {
  let pathname = '/';
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
  } catch {
    return send(res, 400, 'Bad Request', 'text/plain; charset=utf-8');
  }

  // normalize + block traversal
  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const direct = join(root, safe);

  // 1. exact static file (e.g. /robots.txt, /sitemap.xml, /index.html)
  if (existsSync(direct) && statSync(direct).isFile()) {
    const ext = extname(direct).toLowerCase();
    return send(res, 200, readFileSync(direct), MIME[ext] || 'application/octet-stream');
  }

  // 2. clean URL -> <path>.html (mirrors Vercel cleanUrls)
  const htmlCandidate = join(root, `${safe.replace(/\/$/, '')}.html`);
  if (!extname(safe) && existsSync(htmlCandidate) && statSync(htmlCandidate).isFile()) {
    return send(res, 200, readFileSync(htmlCandidate), MIME['.html']);
  }

  // 3. SPA fallback for extension-less routes (/app, /history, /compare/*)
  if (!extname(safe)) {
    const indexPath = join(root, 'index.html');
    if (existsSync(indexPath)) return send(res, 200, readFileSync(indexPath), MIME['.html']);
  }

  // 4. real 404 for unknown asset paths
  const notFound = join(root, '404.html');
  const body = existsSync(notFound) ? readFileSync(notFound) : 'Not Found';
  return send(res, 404, body, MIME['.html']);
});

server.listen(port, () => {
  console.log(`ApexAudit AI preview running at http://localhost:${port}`);
  console.log(`  /            -> landing page`);
  console.log(`  /app         -> audit dashboard (SPA fallback)`);
  console.log(`  /history     -> sample scans (SPA fallback)`);
  console.log(`  /compare/*   -> SEO comparison funnel (SPA fallback)`);
});
