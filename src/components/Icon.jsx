import { ICONS } from '../icons.js';

/**
 * Renders a lucide-react icon by its original lucide name
 * (e.g. "arrow-right", "sparkles", "bar-chart-2").
 *
 * This replaces the old global `lucide.createIcons()` call that scanned the
 * DOM for `data-lucide` attributes after every render.
 */
export default function Icon({ name, className = 'w-4 h-4', strokeWidth = 2 }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
