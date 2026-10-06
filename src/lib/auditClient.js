/**
 * ApexAudit AI — audit client.
 *
 * `runAudit(url)` calls the real serverless backend (`/api/audit`), which
 * fetches the target page server-side and computes genuine SEO / speed / UX /
 * copy signals.
 *
 * `fallbackAudit(url, reason)` reproduces the original deterministic demo
 * engine (seeded presets + hash-based generation) and is used only when the
 * backend is unreachable — e.g. local `vite dev` without `vercel dev`, or a
 * network failure — so the UI always renders a result.
 */
import { PRESET_SITES } from '../data/presetSites.js';

const API_ENDPOINT = '/api/audit';

/** Normalise user input to the bare host form used as a preset key. */
export function normalizeInput(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');
}

/** Ensure the input is an absolute http(s) URL. */
export function toAbsoluteUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

/**
 * Call the live audit backend.
 * @returns {Promise<object>} the audit result (with `source: 'live'`)
 * @throws {Error} on network failure or a non-2xx backend response
 */
export async function runAudit(input) {
  const url = toAbsoluteUrl(input);
  if (!url) throw new Error('Enter a URL to audit.');

  let res;
  try {
    res = await fetch(`${API_ENDPOINT}?url=${encodeURIComponent(url)}`, {
      headers: { accept: 'application/json' },
    });
  } catch (err) {
    throw new Error(`Audit service unreachable: ${err.message}`);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    throw new Error(
      payload?.error || `Audit request failed (HTTP ${res.status}).`,
    );
  }
  if (!payload || !payload.scores) {
    throw new Error('Audit service returned an unexpected response.');
  }

  return { ...payload, source: 'live' };
}

/**
 * Deterministic demo result — the original seed-based engine, preserved as a
 * fallback so the landing-page demo and offline dev keep working.
 */
export function fallbackAudit(input, reason) {
  const normalized = normalizeInput(input);
  const reasonText = reason ? String(reason.message || reason) : null;

  if (PRESET_SITES[normalized]) {
    return { ...PRESET_SITES[normalized], source: 'demo', fallbackReason: reasonText };
  }

  const hash = normalized
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const scoreBase = 70 + (hash % 25);

  return {
    url: toAbsoluteUrl(input),
    title: `${normalized.charAt(0).toUpperCase() + normalized.slice(1)} - Official Site`,
    scores: {
      overall: scoreBase,
      seo: Math.min(99, scoreBase + 5),
      copy: Math.max(55, scoreBase - 8),
      speed: Math.min(98, scoreBase + 3),
      ux: Math.min(95, scoreBase + 2),
    },
    issues: [
      {
        type: 'critical',
        cat: 'Copy',
        title: 'Hero Headline lacks emotional transformation hook',
        fix: `Original: "Welcome to ${normalized}"\nAI Fix: "Boost Your Conversion Rates by 34% with Automated ${normalized.split('.')[0]} AI Workflows."`,
      },
      {
        type: 'warning',
        cat: 'SEO',
        title: 'OpenGraph Image Tag is missing or invalid',
        fix: `<meta property="og:image" content="https://${normalized}/og-image.png" />`,
      },
      {
        type: 'warning',
        cat: 'UX',
        title: 'Primary CTA button visual hierarchy is diluted',
        fix: 'Increase padding to 14px 28px and apply dark-mode contrast accent background (#10b981).',
      },
      {
        type: 'passed',
        cat: 'Speed',
        title: 'SSL Encryption & HTTP/2 protocol active',
        fix: null,
      },
    ],
    source: 'demo',
    fallbackReason: reasonText,
  };
}

export default runAudit;
