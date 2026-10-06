/**
 * ApexAudit AI — serverless audit endpoint (Vercel Node.js function, ESM).
 *
 * Accepts a target URL, fetches the page server-side, parses the HTML and
 * computes REAL audit signals, then returns a structured JSON result whose
 * shape matches what the frontend already renders:
 *
 *   { url, title, scores: { overall, seo, copy, speed, ux }, issues: [...], meta: {...} }
 *
 * Usage:
 *   GET  /api/audit?url=https://example.com
 *   POST /api/audit   { "url": "https://example.com" }
 *
 * Notes / limitations:
 *   - This is a static-HTML analyser. Signals that require executing JS or
 *     measuring real paint (LCP/CLS/INP, JS bundle weight) cannot be computed
 *     without a headless browser, so "speed" is derived from server response
 *     time, HTML payload size, compression and request counts.
 *   - Some sites block non-browser user agents or bot traffic; those return a
 *     clear 502/403-style error rather than a fabricated score.
 */

const FETCH_TIMEOUT_MS = 12000;
const MAX_HTML_BYTES = 3 * 1024 * 1024; // 3 MB

const UA =
  'Mozilla/5.0 (compatible; ApexAuditBot/1.0; +https://apexaudit-ai.vercel.app)';

/* ------------------------------------------------------------------ *
 * URL handling + SSRF guard
 * ------------------------------------------------------------------ */

function normalizeUrl(input) {
  if (!input || typeof input !== 'string') return null;
  let raw = input.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let u;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  return u;
}

function isBlockedHost(hostname) {
  const h = String(hostname || '')
    .toLowerCase()
    .replace(/^\[|\]$/g, '');
  if (!h) return true;
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  if (h === '::1' || h === '0.0.0.0') return true;
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^fc[0-9a-f]{2}:|^fd[0-9a-f]{2}:/i.test(h)) return true; // unique-local IPv6
  if (/^fe80:/i.test(h)) return true; // link-local IPv6
  return false;
}

/* ------------------------------------------------------------------ *
 * HTML parsing helpers (dependency-free)
 * ------------------------------------------------------------------ */

function decodeEntities(str = '') {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripTags(html = '') {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function getAttr(tag = '', name = '') {
  const re = new RegExp(
    `(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`,
    'i',
  );
  const m = tag.match(re);
  if (!m) return null;
  return decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
}

function metaContent(html, name) {
  const re = new RegExp(
    `<meta\\b[^>]*\\b(?:name|property)\\s*=\\s*["']${name}["'][^>]*>`,
    'i',
  );
  const m = html.match(re);
  if (!m) return null;
  return getAttr(m[0], 'content');
}

function extractHeadings(html) {
  const counts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
  const h1Texts = [];
  for (const level of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
    const re = new RegExp(`<${level}\\b[^>]*>([\\s\\S]*?)<\\/${level}>`, 'gi');
    let m;
    while ((m = re.exec(html))) {
      counts[level] += 1;
      if (level === 'h1') h1Texts.push(stripTags(m[1]).slice(0, 200));
    }
  }
  return { counts, h1Texts };
}

function extractImages(html) {
  const re = /<img\b[^>]*>/gi;
  let total = 0;
  let withAlt = 0;
  let emptyAlt = 0;
  let m;
  while ((m = re.exec(html))) {
    total += 1;
    const alt = getAttr(m[0], 'alt');
    if (alt === null) continue;
    if (alt.trim() === '') emptyAlt += 1;
    else withAlt += 1;
  }
  return { total, withAlt, emptyAlt, missingAlt: total - withAlt - emptyAlt };
}

function parseHtml(html, finalUrl, responseTimeMs, headers, bytes) {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : '';
  const metaDescription = metaContent(html, 'description') || '';
  const { counts: headings, h1Texts } = extractHeadings(html);
  const images = extractImages(html);

  const canonicalMatch = html.match(
    /<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/i,
  );
  const canonical = canonicalMatch ? getAttr(canonicalMatch[0], 'href') : null;

  const langMatch = html.match(/<html\b[^>]*\blang\s*=\s*["']([^"']+)["']/i);

  const og = {
    title: metaContent(html, 'og:title'),
    description: metaContent(html, 'og:description'),
    image: metaContent(html, 'og:image'),
    type: metaContent(html, 'og:type'),
    url: metaContent(html, 'og:url'),
  };
  const twitter = {
    card: metaContent(html, 'twitter:card'),
    title: metaContent(html, 'twitter:title'),
    description: metaContent(html, 'twitter:description'),
    image: metaContent(html, 'twitter:image'),
  };

  const text = stripTags(html);
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  return {
    url: finalUrl,
    title,
    titleLength: title.length,
    metaDescription,
    metaDescriptionLength: metaDescription.length,
    headings,
    h1Count: headings.h1,
    h1Texts,
    images,
    altCoverage: images.total
      ? Math.round((images.withAlt / images.total) * 100)
      : 100,
    canonical,
    robotsMeta: metaContent(html, 'robots'),
    viewport: metaContent(html, 'viewport'),
    lang: langMatch ? langMatch[1] : null,
    og,
    twitter,
    hasJsonLd: /<script\b[^>]*type\s*=\s*["']application\/ld\+json["']/i.test(html),
    hasFavicon: /<link\b[^>]*\brel\s*=\s*["'][^"']*icon[^"']*["']/i.test(html),
    scriptCount: (html.match(/<script\b/gi) || []).length,
    styleCount: (html.match(/<style\b/gi) || []).length,
    stylesheetCount: (
      html.match(/<link\b[^>]*rel\s*=\s*["']stylesheet["']/gi) || []
    ).length,
    wordCount,
    pageSizeBytes: bytes,
    responseTimeMs,
    isHttps: finalUrl.startsWith('https://'),
    compressed: !!headers['content-encoding'],
    contentEncoding: headers['content-encoding'] || null,
    server: headers['server'] || null,
    cacheControl: headers['cache-control'] || null,
  };
}

/* ------------------------------------------------------------------ *
 * Scoring
 * ------------------------------------------------------------------ */

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const crit = (cat, title, fix) => ({ type: 'critical', cat, title, fix });
const warn = (cat, title, fix) => ({ type: 'warning', cat, title, fix });
const pass = (cat, title) => ({ type: 'passed', cat, title, fix: null });
const rank = (t) => (t === 'critical' ? 0 : t === 'warning' ? 1 : 2);

function scoreSeo(s) {
  let score = 100;
  const issues = [];

  if (!s.title) {
    score -= 25;
    issues.push(crit('SEO', 'Missing <title> tag', 'Add a unique, keyword-rich <title> of 30–60 characters.'));
  } else if (s.titleLength < 30 || s.titleLength > 60) {
    score -= 8;
    issues.push(warn('SEO', `Title length is ${s.titleLength} chars (ideal 30–60)`, `Rewrite the title to 30–60 characters. Current: "${s.title}"`));
  } else {
    issues.push(pass('SEO', `Title tag present and well-sized (${s.titleLength} chars)`));
  }

  if (!s.metaDescription) {
    score -= 20;
    issues.push(crit('SEO', 'Missing meta description', 'Add a compelling 120–160 character meta description.'));
  } else if (s.metaDescriptionLength < 120 || s.metaDescriptionLength > 160) {
    score -= 6;
    issues.push(warn('SEO', `Meta description is ${s.metaDescriptionLength} chars (ideal 120–160)`, 'Trim or expand the description to 120–160 characters.'));
  } else {
    issues.push(pass('SEO', `Meta description present (${s.metaDescriptionLength} chars)`));
  }

  if (s.h1Count === 0) {
    score -= 15;
    issues.push(crit('SEO', 'No <h1> heading found', 'Add exactly one <h1> containing your primary keyword.'));
  } else if (s.h1Count > 1) {
    score -= 6;
    issues.push(warn('SEO', `${s.h1Count} <h1> tags found (should be 1)`, 'Demote the extra H1s to H2 so the page has a single primary heading.'));
  } else {
    issues.push(pass('SEO', 'Exactly one <h1> heading'));
  }

  if (!s.canonical) {
    score -= 8;
    issues.push(warn('SEO', 'Missing canonical link', 'Add <link rel="canonical" href="…"> to prevent duplicate-content dilution.'));
  } else {
    issues.push(pass('SEO', 'Canonical link present'));
  }

  if (!s.og.title || !s.og.image) {
    score -= 5;
    issues.push(warn('SEO', 'Open Graph tags incomplete', 'Add og:title, og:description and og:image so shares render a rich card.'));
  } else {
    issues.push(pass('SEO', 'Open Graph tags present'));
  }

  if (!s.twitter.card) {
    score -= 4;
    issues.push(warn('SEO', 'Missing Twitter card tag', 'Add <meta name="twitter:card" content="summary_large_image">.'));
  }

  if (!s.hasJsonLd) {
    score -= 5;
    issues.push(warn('SEO', 'No JSON-LD structured data', 'Add Schema.org JSON-LD (Product/FAQPage) to earn rich results.'));
  } else {
    issues.push(pass('SEO', 'JSON-LD structured data present'));
  }

  if (!s.lang) {
    score -= 4;
    issues.push(warn('SEO', 'Missing <html lang> attribute', 'Set lang on the <html> element for accessibility and i18n.'));
  }

  return { score: clamp(score), issues };
}

function scoreSpeed(s) {
  let score = 100;
  const issues = [];

  const rt = s.responseTimeMs;
  if (rt > 2000) {
    score -= 30;
    issues.push(crit('Speed', `Slow server response (${rt} ms)`, 'Target a TTFB under 500 ms — put a CDN/cache in front of the origin.'));
  } else if (rt > 800) {
    score -= 15;
    issues.push(warn('Speed', `Server response is ${rt} ms`, 'Aim for < 500 ms TTFB with edge caching.'));
  } else {
    issues.push(pass('Speed', `Fast server response (${rt} ms)`));
  }

  const kb = Math.round(s.pageSizeBytes / 1024);
  if (kb > 1500) {
    score -= 20;
    issues.push(crit('Speed', `Large HTML payload (${kb} KB)`, 'Reduce inline markup/scripts; the HTML alone should stay well under 500 KB.'));
  } else if (kb > 500) {
    score -= 8;
    issues.push(warn('Speed', `HTML payload is ${kb} KB`, 'Trim inline scripts/styles to shrink the document.'));
  } else {
    issues.push(pass('Speed', `Lean HTML payload (${kb} KB)`));
  }

  if (!s.compressed) {
    score -= 10;
    issues.push(warn('Speed', 'Response is not compressed', 'Enable gzip/brotli compression on the server.'));
  } else {
    issues.push(pass('Speed', `Compression enabled (${s.contentEncoding})`));
  }

  if (s.scriptCount > 20) {
    score -= 12;
    issues.push(warn('Speed', `${s.scriptCount} <script> tags`, 'Bundle and defer scripts to cut render-blocking requests.'));
  }
  if (s.stylesheetCount > 8) {
    score -= 8;
    issues.push(warn('Speed', `${s.stylesheetCount} stylesheets`, 'Combine stylesheets to reduce blocking requests.'));
  }

  return { score: clamp(score), issues };
}

function scoreUx(s) {
  let score = 100;
  const issues = [];

  if (!s.viewport) {
    score -= 25;
    issues.push(crit('UX', 'Missing viewport meta tag', 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for mobile rendering.'));
  } else {
    issues.push(pass('UX', 'Responsive viewport meta present'));
  }

  if (s.images.total > 0) {
    if (s.altCoverage < 60) {
      score -= 20;
      issues.push(crit('UX', `Only ${s.altCoverage}% of images have alt text`, 'Add descriptive alt text to every meaningful image for accessibility.'));
    } else if (s.altCoverage < 90) {
      score -= 10;
      issues.push(warn('UX', `${s.altCoverage}% image alt coverage`, 'Fill in the remaining alt attributes.'));
    } else {
      issues.push(pass('UX', `Strong image alt coverage (${s.altCoverage}%)`));
    }
  }

  if (!s.lang) {
    score -= 8;
    issues.push(warn('UX', 'Missing <html lang>', 'Declare the page language for screen readers.'));
  }
  if (!s.hasFavicon) {
    score -= 5;
    issues.push(warn('UX', 'No favicon declared', 'Add a favicon link so the tab is recognisable.'));
  }
  if (s.h1Count === 0) {
    score -= 8;
    issues.push(warn('UX', 'No H1 to anchor the page', 'Add a single H1 so users and assistive tech can orient quickly.'));
  }

  return { score: clamp(score), issues };
}

function scoreCopy(s) {
  let score = 100;
  const issues = [];

  const wc = s.wordCount;
  if (wc < 150) {
    score -= 30;
    issues.push(crit('Copy', `Thin content (${wc} words)`, 'Expand the page to at least 300 words of substantive copy.'));
  } else if (wc < 300) {
    score -= 15;
    issues.push(warn('Copy', `Light content (${wc} words)`, 'Aim for 300+ words to give search engines and buyers enough context.'));
  } else if (wc > 3000) {
    score -= 8;
    issues.push(warn('Copy', `Very long page (${wc} words)`, 'Consider splitting into focused sections or pages.'));
  } else {
    issues.push(pass('Copy', `Healthy content length (${wc} words)`));
  }

  const h1 = s.h1Texts[0] || '';
  if (h1 && h1.length > 70) {
    score -= 8;
    issues.push(warn('Copy', 'H1 headline is long', 'Tighten the H1 to a punchy, benefit-led headline under 70 characters.'));
  }
  if (h1 && h1.split(' ').length < 4) {
    score -= 6;
    issues.push(warn('Copy', 'H1 is very short', 'Make the H1 a specific value proposition, not a bare label.'));
  }

  if (!s.metaDescription) {
    score -= 10;
    issues.push(warn('Copy', 'No meta description to sell the click', 'Write a benefit-driven 120–160 char description.'));
  }

  return { score: clamp(score), issues };
}

/* ------------------------------------------------------------------ *
 * Request body
 * ------------------------------------------------------------------ */

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Handler
 * ------------------------------------------------------------------ */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
    return;
  }

  let input = req.query?.url || null;
  if (!input && req.method === 'POST') {
    const body = await readBody(req);
    input = body?.url || null;
  }

  const target = normalizeUrl(input);
  if (!target) {
    res.status(400).json({
      error: 'A valid http(s) URL is required (e.g. ?url=https://example.com).',
    });
    return;
  }
  if (isBlockedHost(target.hostname)) {
    res.status(400).json({ error: 'That host is not allowed.' });
    return;
  }

  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let resp;
  try {
    resp = await fetch(target.href, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    });
  } catch (err) {
    clearTimeout(timer);
    const aborted = err?.name === 'AbortError';
    res.status(aborted ? 504 : 502).json({
      error: aborted
        ? `Timed out after ${FETCH_TIMEOUT_MS} ms fetching ${target.href}.`
        : `Could not reach ${target.href}: ${err.message}`,
      url: target.href,
    });
    return;
  }
  clearTimeout(timer);

  const responseTimeMs = Date.now() - started;
  const finalUrl = resp.url || target.href;

  if (!resp.ok) {
    res.status(502).json({
      error: `Target returned HTTP ${resp.status}${resp.statusText ? ' ' + resp.statusText : ''}.`,
      status: resp.status,
      url: finalUrl,
    });
    return;
  }

  const contentType = resp.headers.get('content-type') || '';
  if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
    res.status(415).json({
      error: `Target is not an HTML page (content-type: ${contentType || 'unknown'}).`,
      url: finalUrl,
    });
    return;
  }

  const contentLength = Number(resp.headers.get('content-length') || 0);
  if (contentLength && contentLength > MAX_HTML_BYTES) {
    res.status(413).json({
      error: `Page is too large to audit (${Math.round(contentLength / 1024)} KB).`,
      url: finalUrl,
    });
    return;
  }

  let html = '';
  try {
    html = await resp.text();
  } catch (err) {
    res.status(502).json({ error: `Failed to read response body: ${err.message}`, url: finalUrl });
    return;
  }

  const bytes = Buffer.byteLength(html, 'utf8');
  if (bytes > MAX_HTML_BYTES) html = html.slice(0, MAX_HTML_BYTES);

  const headers = {};
  for (const [k, v] of resp.headers.entries()) headers[k.toLowerCase()] = v;

  const signals = parseHtml(html, finalUrl, responseTimeMs, headers, bytes);
  const seo = scoreSeo(signals);
  const speed = scoreSpeed(signals);
  const ux = scoreUx(signals);
  const copy = scoreCopy(signals);

  const overall = clamp(
    seo.score * 0.35 + speed.score * 0.2 + ux.score * 0.2 + copy.score * 0.25,
  );

  const issues = [...seo.issues, ...speed.issues, ...ux.issues, ...copy.issues].sort(
    (a, b) => rank(a.type) - rank(b.type),
  );

  res.status(200).json({
    url: signals.url,
    title: signals.title || signals.url,
    scores: {
      overall,
      seo: seo.score,
      copy: copy.score,
      speed: speed.score,
      ux: ux.score,
    },
    issues,
    meta: {
      ...signals,
      fetchedAt: new Date().toISOString(),
      source: 'live',
    },
  });
}
