#!/usr/bin/env node
/**
 * ApexAudit AI - post-build validation.
 *
 * The project is a Vite + React SPA (JSX compiled at build time, Tailwind
 * compiled via PostCSS, react-router for deep links). This script validates
 * that `vite build` produced a deployable `dist/` and that the source tree is
 * free of the old in-browser Babel / CDN setup, so a broken push fails CI /
 * Vercel instead of shipping a blank page.
 *
 * Run after `npm run build`:  node scripts/build.mjs
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const checks = [];

function check(label, condition, detail = '') {
  checks.push({ label, ok: !!condition, detail });
  if (!condition) failures.push(label);
}

const distDir = join(root, 'dist');
const distIndex = join(distDir, 'index.html');
const srcIndex = join(root, 'index.html');
const vercelPath = join(root, 'vercel.json');
const pkgPath = join(root, 'package.json');

// 1. required files exist
for (const [label, p] of [
  ['dist/index.html present (run npm run build first)', distIndex],
  ['source index.html present', srcIndex],
  ['vercel.json present', vercelPath],
  ['package.json present', pkgPath],
]) check(label, existsSync(p));

// 2. source index.html is the Vite module entry (no Babel / CDN)
if (existsSync(srcIndex)) {
  const html = readFileSync(srcIndex, 'utf8');
  check('source index.html has #root mount', /id="root"/.test(html));
  check('source index.html loads /src/main.jsx as a module', /type="module"[^>]*src="\/src\/main\.jsx"/.test(html));
  check('source index.html has NO Babel standalone', !/@babel\/standalone/.test(html));
  check('source index.html has NO type="text/babel"', !/type="text\/babel"/.test(html));
  check('source index.html has NO Tailwind CDN', !/cdn\.tailwindcss\.com/.test(html));
  check('source index.html has NO React UMD CDN', !/unpkg\.com\/react@/.test(html));
}

// 3. dist/ is a real Vite build (hashed assets, no Babel/CDN)
if (existsSync(distIndex)) {
  const html = readFileSync(distIndex, 'utf8');
  const assetsDir = join(distDir, 'assets');
  const assets = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
  const js = assets.filter((f) => f.endsWith('.js'));
  const css = assets.filter((f) => f.endsWith('.css'));

  check('dist/index.html has #root mount', /id="root"/.test(html));
  check('dist/index.html references a hashed JS bundle', /assets\/index-[\w-]+\.js/.test(html));
  check('dist/index.html references a hashed CSS bundle', /assets\/index-[\w-]+\.css/.test(html));
  check('dist has a JS bundle', js.length > 0, js.join(', '));
  check('dist has a CSS bundle', css.length > 0, css.join(', '));
  check('dist/index.html has NO Babel standalone', !/@babel\/standalone/.test(html));
  check('dist/index.html has NO Tailwind CDN', !/cdn\.tailwindcss\.com/.test(html));

  // bundle must not carry the old CDN/Babel runtime
  let bundle = '';
  for (const f of js) bundle += readFileSync(join(assetsDir, f), 'utf8');
  check('bundle has NO text/babel', !/text\/babel/.test(bundle));
  check('bundle has NO cdn.tailwindcss.com', !/cdn\.tailwindcss\.com/.test(bundle));
  check('bundle has NO unpkg.com', !/unpkg\.com/.test(bundle));
  check('bundle has NO lucide.createIcons', !/createIcons/.test(bundle));
  // react-router internals survive minification (the package name string does not)
  check(
    'bundle includes react-router (history + hooks)',
    /popstate/.test(bundle) && /pushState/.test(bundle) && /useNavigate/.test(bundle),
  );
  check('bundle includes app content (ApexAudit)', /ApexAudit/.test(bundle));
}

// 4. vercel.json parses and routes the SPA correctly
if (existsSync(vercelPath)) {
  let v = null;
  try { v = JSON.parse(readFileSync(vercelPath, 'utf8')); } catch (e) { failures.push('vercel.json is valid JSON: ' + e.message); }
  if (v) {
    check('vercel.json valid JSON', true);
    check('vercel.json outputDirectory = "dist"', v.outputDirectory === 'dist');
    check('vercel.json buildCommand wired', typeof v.buildCommand === 'string' && v.buildCommand.length > 0);
    check(
      'vercel.json has SPA rewrite to /index.html',
      Array.isArray(v.rewrites) && v.rewrites.some((r) => (r.destination || '').endsWith('/index.html')),
    );
  }
}

// 5. package.json has the expected scripts + router dependency
if (existsSync(pkgPath)) {
  let p = null;
  try { p = JSON.parse(readFileSync(pkgPath, 'utf8')); } catch (e) { failures.push('package.json is valid JSON: ' + e.message); }
  if (p) {
    check('package.json valid JSON', true);
    check('package.json build script', typeof p.scripts?.build === 'string');
    check('package.json dev script', typeof p.scripts?.dev === 'string');
    check('package.json preview script', typeof p.scripts?.preview === 'string');
    check('package.json depends on react-router-dom', typeof p.dependencies?.['react-router-dom'] === 'string');
  }
}

for (const c of checks) console.log(`${c.ok ? 'OK  ' : 'FAIL'}  ${c.label}${c.detail ? '  (' + c.detail + ')' : ''}`);

if (failures.length) {
  console.error(`\nValidation failed: ${failures.length} check(s) did not pass.`);
  process.exit(1);
}
console.log(`\nVite build OK - ${checks.length}/${checks.length} checks passed.`);
