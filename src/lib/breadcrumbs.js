import { COMPETITORS } from '../data/competitors.js';

/**
 * Single source of truth for the site's breadcrumb trail.
 *
 * Both the visible <Breadcrumb> component and the JSON-LD `BreadcrumbList`
 * emitted by `useSchema` consume `getBreadcrumbs()`, so the trail a visitor
 * sees can never drift from the structured data search engines read.
 *
 * The trail is derived purely from the current pathname (react-router
 * `useLocation().pathname`), which keeps it correct on client-side navigation
 * and on a hard load of a deep link.
 */

/** Canonical origin used for the JSON-LD `item` URLs. */
export const SITE_ORIGIN = 'https://apexaudit.ai';

/**
 * Resolve the breadcrumb trail for a pathname.
 *
 * @param {string} pathname e.g. "/compare/ahrefs"
 * @returns {{ name: string, path: string }[]} ordered trail, root first.
 *   Returns an empty array for the landing page (no breadcrumb there).
 */
export function getBreadcrumbs(pathname) {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';

  // The landing page is the root — a breadcrumb would be redundant.
  if (path === '/') return [];

  if (path === '/app') {
    return [
      { name: 'Home', path: '/' },
      { name: 'Audit Dashboard', path: '/app' },
    ];
  }

  if (path === '/history') {
    return [
      { name: 'Home', path: '/' },
      { name: 'Sample Scans', path: '/history' },
    ];
  }

  if (path === '/compare') {
    return [
      { name: 'Home', path: '/' },
      { name: 'Comparisons', path: '/compare' },
    ];
  }

  const match = /^\/compare\/([^/]+)$/.exec(path);
  if (match) {
    const comp = COMPETITORS.find((c) => c.slug === match[1]);
    if (comp) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Comparisons', path: '/compare' },
        { name: `ApexAudit vs ${comp.name}`, path: `/compare/${comp.slug}` },
      ];
    }
  }

  // Unknown route (the catch-all 404).
  return [
    { name: 'Home', path: '/' },
    { name: 'Page not found', path },
  ];
}

/**
 * Build the schema.org `BreadcrumbList` node for a pathname, or `null` when
 * the route has no trail (the landing page).
 */
export function breadcrumbJsonLd(pathname) {
  const items = getBreadcrumbs(pathname);
  if (!items.length) return null;

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_ORIGIN}${item.path === '/' ? '/' : item.path}`,
    })),
  };
}

export default getBreadcrumbs;
