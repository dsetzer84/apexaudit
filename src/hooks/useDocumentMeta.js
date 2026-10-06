import { useEffect } from 'react';
import { COMPETITORS } from '../data/competitors.js';

/**
 * Per-route document head management.
 *
 * Keeps `<title>`, `<meta name="description">`, the canonical link and the
 * Open Graph / Twitter card tags in sync with the current route on every
 * client-side navigation (not just on a hard load), and removes them again
 * when the route no longer defines them so nothing leaks between routes.
 *
 * Social cards: every route resolves to a real 1200x630 image under
 * `public/og/` (copied verbatim into `dist/og/` by Vite). The comparison
 * pages each get their own bespoke card (`/og/<competitor-slug>.jpg`); the
 * remaining routes share the general ApexAudit card (`/og/apexaudit.jpg`).
 * OG image URLs must be absolute, so they are prefixed with `SITE_URL`.
 *
 * Dependency-light by design: the app already injects its JSON-LD by hand in
 * `useSchema`, so this follows the same pattern instead of pulling in
 * `react-helmet-async` for a handful of tags.
 */

export const SITE_URL = 'https://apexaudit-ai.vercel.app';
export const SITE_NAME = 'ApexAudit AI';

/** Social card dimensions \u2014 must match the files committed under public/og/. */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Shared default social card, used by every route without a bespoke one. */
const DEFAULT_OG_IMAGE_PATH = '/og/apexaudit.jpg';

/** Route table: pathname -> { title, description }. */
export const ROUTE_META = {
  '/': {
    title: 'ApexAudit AI - Instant Website & SEO AI Auditor',
    description:
      'Audit your website for SEO, speed, UX friction, and copy conversion in 10 seconds. Get 1-click AI content rewrites.',
  },
  '/app': {
    title: 'Free Website Audit Tool - SEO, Speed & Copy Scanner | ApexAudit AI',
    description:
      'Run a free instant audit of any URL. ApexAudit AI scans SEO markup, page speed, UX friction and conversion copy, then generates 1-click AI fixes.',
  },
  '/history': {
    title: 'Sample Audit Reports - Pre-Seeded Scans | ApexAudit AI',
    description:
      'Browse pre-seeded ApexAudit AI reports for baseline SaaS sites and see exactly how the SEO, speed, UX and copy scoring works.',
  },
  '/compare': {
    title: 'SEO & Audit Tool Comparisons (2026) | ApexAudit AI',
    description:
      'Honest, feature-by-feature comparisons of ApexAudit AI against Surfer SEO, Ahrefs, Semrush, Clearscope and Sitechecker.',
  },
};

/**
 * Route table: pathname -> social card path (relative to the site root).
 * Comparison detail pages are handled dynamically in `resolveMeta`.
 */
export const ROUTE_OG_IMAGE = {
  '/': DEFAULT_OG_IMAGE_PATH,
  '/app': DEFAULT_OG_IMAGE_PATH,
  '/history': DEFAULT_OG_IMAGE_PATH,
  '/compare': DEFAULT_OG_IMAGE_PATH,
};

const NOT_FOUND_META = {
  title: '404 - Page not found | ApexAudit AI',
  description:
    'The URL you requested is not part of ApexAudit AI. Head back to the audit dashboard and scan a site instead.',
};

/** Resolve the meta for a pathname, including dynamic /compare/:slug routes. */
export function resolveMeta(pathname) {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';

  if (ROUTE_META[path]) {
    return {
      ...ROUTE_META[path],
      path,
      noindex: false,
      ogImage: ROUTE_OG_IMAGE[path] || DEFAULT_OG_IMAGE_PATH,
      ogImageAlt: ROUTE_META[path].title,
    };
  }

  const match = /^\/compare\/([^/]+)$/.exec(path);
  if (match) {
    const comp = COMPETITORS.find((c) => c.slug === match[1]);
    if (comp) {
      return {
        title: `ApexAudit AI vs ${comp.name}: Features, Pricing & Which is Better in 2026?`,
        description: `ApexAudit AI vs ${comp.name} compared: pricing, features and verdict. ${comp.tagline}. See which SEO and conversion audit tool fits your team.`,
        path,
        noindex: false,
        ogImage: `/og/${comp.slug}.jpg`,
        ogImageAlt: `ApexAudit AI vs ${comp.name} - features, pricing and verdict`,
      };
    }
  }

  return {
    ...NOT_FOUND_META,
    path,
    noindex: true,
    ogImage: DEFAULT_OG_IMAGE_PATH,
    ogImageAlt: `${SITE_NAME} - page not found`,
  };
}

/** Create-or-update a <meta> tag, keyed by name or property. */
function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Create-or-update the canonical <link>. */
function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Create-or-update the robots <meta>. */
function setRobots(noindex) {
  setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
}

export function useDocumentMeta(pathname) {
  useEffect(() => {
    const meta = resolveMeta(pathname);
    const canonical = `${SITE_URL}${meta.path === '/' ? '/' : meta.path}`;
    const ogImage = `${SITE_URL}${meta.ogImage}`;

    document.title = meta.title;
    setMeta('name', 'description', meta.description);
    setCanonical(canonical);
    setRobots(meta.noindex);

    // Open Graph
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:image:type', 'image/jpeg');
    setMeta('property', 'og:image:width', String(OG_IMAGE_WIDTH));
    setMeta('property', 'og:image:height', String(OG_IMAGE_HEIGHT));
    setMeta('property', 'og:image:alt', meta.ogImageAlt);

    // Twitter card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', meta.title);
    setMeta('name', 'twitter:description', meta.description);
    setMeta('name', 'twitter:image', ogImage);
    setMeta('name', 'twitter:image:alt', meta.ogImageAlt);
  }, [pathname]);
}

export default useDocumentMeta;
