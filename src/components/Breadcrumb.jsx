import { Link, useLocation } from 'react-router-dom';
import { getBreadcrumbs } from '../lib/breadcrumbs.js';

/**
 * Visible breadcrumb trail.
 *
 * Renders the exact same trail as the JSON-LD `BreadcrumbList` (both come from
 * `getBreadcrumbs()` in `src/lib/breadcrumbs.js`), so the visible navigation
 * and the structured data can never drift apart.
 *
 * Semantic + accessible: a `<nav aria-label="Breadcrumb">` wrapping an ordered
 * list, with `aria-current="page"` on the final (non-link) item. Renders
 * nothing on the landing page, where a breadcrumb would be redundant.
 *
 * The component is intentionally container-less — each page places it at the
 * top of its own max-width wrapper so it lines up with that page's content.
 */
export default function Breadcrumb({ className = '' }) {
  const { pathname } = useLocation();
  const items = getBreadcrumbs(pathname);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-x-2">
              {isLast ? (
                <span aria-current="page" className="text-zinc-300 font-medium">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="rounded transition hover:text-white focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
                >
                  {item.name}
                </Link>
              )}
              {!isLast && (
                <span aria-hidden="true" className="select-none text-zinc-700">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
