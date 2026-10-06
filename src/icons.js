import {
  ArrowRight,
  Sparkles,
  Globe,
  Zap,
  Search,
  Gauge,
  BarChart2,
  ChevronRight,
} from 'lucide-react';

// Named lucide icon components used by the original markup.
// Keyed by the exact strings passed to the old `data-lucide` / Icon `name` prop
// so every call site is a straight swap with no behaviour change.
export const ICONS = {
  'arrow-right': ArrowRight,
  sparkles: Sparkles,
  globe: Globe,
  zap: Zap,
  search: Search,
  gauge: Gauge,
  'bar-chart-2': BarChart2,
  'chevron-right': ChevronRight,
};

export default ICONS;
