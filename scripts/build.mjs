#!/usr/bin/env node
/**
 * ApexAudit AI - static site build (validation step).
 *
 * This project ships a single self-contained `index.html` (React 18 + Babel
 * standalone + Tailwind CDN loaded from <script> tags), so there is no bundle
 * to produce. The "build" therefore validates that the deployable site is
 * present and internally consistent, so a broken push fails CI / Vercel
 * instead of shipping a blank page.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const checks = [];

function check(label, condition, detail = '') {
  checks.push({ label, ok: !!condition, detail });
  if (!condition) failures.push(label);
}

const indexPath = join(root, 'index.html');
const vercelPath = join(root, 'vercel.json');
const pkgPath = join(root, 'package.json');
const notFoundPath = join(root, '404.html');

// 1. required files exist
for (const [label, p] of [
  ['index.html present', indexPath],
  ['vercel.json present', vercelPath],
  ['package.json present', pkgPath],
  ['404.html present', notFoundPath],
]) check(label, existsSync(p));

// 2. index.html is non-trivial
let html = '';
if (existsSync(indexPath)) {
  html = readFileSync(indexPath, 'utf8');
  const bytes = statSync(indexPath).size;
  check('index.html non-trivial (>10KB)', bytes > 10 * 1024, `${bytes} bytes`);
  check('index.html has #root mount', /id="root"/.test(html));
  check('index.html loads React 18 UMD', /react@18\/umd\/react\.production\.min\.js/.test(html));
  check('index.html loads Babel standalone', /@babel\/standalone/.test(html));
  check('index.html loads Tailwind CDN', /cdn\.tailwindcss\.com/.test(html));
  check('index.html renders into root', /createRoot\(document\.getElementById\('root'\)\)/.test(html));
  check('index.html closes </html>', /<\/html>\s*$/.test(html.trim()));

  // unresolved merge markers / placeholders would break the page
  check('no git conflict markers', !/^(<{7}|={7}|>{7})/m.test(html));
}

// 3. vercel.json parses and routes the SPA correctly
if (existsSync(vercelPath)) {
  let v = null;
  try { v = JSON.parse(readFileSync(vercelPath, 'utf8')); } catch (e) { failures.push('vercel.json is valid JSON: ' + e.message); }
  if (v) {
    check('vercel.json valid JSON', true);
    check('vercel.json outputDirectory = "."', v.outputDirectory === '.');
    check('vercel.json buildCommand wired', typeof v.buildCommand === 'string' && v.buildCommand.length > 0);
    check(
      'vercel.json has SPA rewrite to /index.html',
      Array.isArray(v.rewrites) && v.rewrites.some((r) => (r.destination || '').endsWith('/index.html')),
    );
    check('vercel.json cleanUrls enabled', v.cleanUrls === true);
  }
}

// 4. package.json has the expected scripts
if (existsSync(pkgPath)) {
  let p = null;
  try { p = JSON.parse(readFileSync(pkgPath, 'utf8')); } catch (e) { failures.push('package.json is valid JSON: ' + e.message); }
  if (p) {
    check('package.json valid JSON', true);
    check('package.json build script', typeof p.scripts?.build === 'string');
    check('package.json start script', typeof p.scripts?.start === 'string');
    check('package.json lint script', typeof p.scripts?.lint === 'string');
  }
}

for (const c of checks) console.log(`${c.ok ? 'OK  ' : 'FAIL'}  ${c.label}${c.detail ? '  (' + c.detail + ')' : ''}`);

if (failures.length) {
  console.error(`\nBuild failed: ${failures.length} check(s) did not pass.`);
  process.exit(1);
}
console.log(`\nStatic site OK - ${checks.length}/${checks.length} checks passed.`);
