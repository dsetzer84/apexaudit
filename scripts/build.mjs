#!/usr/bin/env node
/**
 * ApexAudit AI — project validation (runs in CI as `npm run lint`).
 *
 * The production bundle is produced by `vite build` (see `npm run build`).
 * This script is a fast, dependency-free sanity check that the source tree is
 * coherent and that the old in-browser Babel / CDN setup has not crept back in.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const checks = [];

function check(label, condition, detail = '') {
  checks.push({ label, ok: !!condition, detail });
  if (!condition) failures.push(label);
}

// 1. required files exist
const required = [
  'index.html',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'vercel.json',
  'package.json',
  'api/audit.js',
  'src/main.jsx',
  'src/App.jsx',
  'src/index.css',
  'src/lib/auditClient.js',
];
for (const rel of required) check(`${rel} present`, existsSync(join(root, rel)));

// 2. index.html must be the Vite entry, not the old Babel/CDN page
const indexPath = join(root, 'index.html');
if (existsSync(indexPath)) {
  const html = readFileSync(indexPath, 'utf8');
  check(
    'index.html loads /src/main.jsx as a module',
    /<script[^>]+type="module"[^>]+src="\/src\/main\.jsx"/.test(html),
  );
  check('index.html has #root mount', /id="root"/.test(html));
  check('no Babel standalone in index.html', !/@babel\/standalone/.test(html));
  check('no type="text/babel" in index.html', !/type="text\/babel"/.test(html));
  check('no Tailwind CDN in index.html', !/cdn\.tailwindcss\.com/.test(html));
  check('no React UMD globals in index.html', !/unpkg\.com\/react@18\/umd/.test(html));
  check('no git conflict markers', !/^(<{7}|={7}|>{7})/m.test(html));
}

// 3. vercel.json parses and keeps /api out of the SPA rewrite
const vercelPath = join(root, 'vercel.json');
if (existsSync(vercelPath)) {
  let v = null;
  try {
    v = JSON.parse(readFileSync(vercelPath, 'utf8'));
  } catch (e) {
    failures.push('vercel.json is valid JSON: ' + e.message);
  }
  if (v) {
    check('vercel.json valid JSON', true);
    check('vercel.json outputDirectory = "dist"', v.outputDirectory === 'dist');
    check(
      'vercel.json buildCommand wired',
      typeof v.buildCommand === 'string' && v.buildCommand.length > 0,
    );
    check(
      'vercel.json SPA rewrite excludes /api',
      Array.isArray(v.rewrites) &&
        v.rewrites.some(
          (r) => /api/.test(r.source || '') && (r.destination || '').endsWith('/index.html'),
        ),
    );
  }
}

// 4. package.json has the expected scripts
const pkgPath = join(root, 'package.json');
if (existsSync(pkgPath)) {
  let p = null;
  try {
    p = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch (e) {
    failures.push('package.json is valid JSON: ' + e.message);
  }
  if (p) {
    check('package.json valid JSON', true);
    check('package.json build script', typeof p.scripts?.build === 'string');
    check('package.json dev script', typeof p.scripts?.dev === 'string');
    check('package.json lint script', typeof p.scripts?.lint === 'string');
  }
}

for (const c of checks) {
  console.log(`${c.ok ? 'OK  ' : 'FAIL'}  ${c.label}${c.detail ? '  (' + c.detail + ')' : ''}`);
}

if (failures.length) {
  console.error(`\nValidation failed: ${failures.length} check(s) did not pass.`);
  process.exit(1);
}
console.log(`\nProject OK — ${checks.length}/${checks.length} checks passed.`);
