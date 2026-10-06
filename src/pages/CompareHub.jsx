import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import { COMPETITORS } from '../data/competitors.js';

export default function CompareHub() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumb className="mb-6" />

      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-black text-white mb-3">
          SEO &amp; Audit Tool Comparisons (2026)
        </h1>
        <p className="text-zinc-400 text-sm">
          Honest, feature-by-feature breakdowns comparing ApexAudit AI against top industry alternatives.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMPETITORS.map((comp) => (
          <div key={comp.slug} className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">ApexAudit vs {comp.name}</h3>
                <span className="text-xs font-mono text-zinc-400">{comp.price}</span>
              </div>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{comp.tagline}</p>
            </div>

            <Link
              to={`/compare/${comp.slug}`}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-800 transition flex items-center justify-center space-x-2"
            >
              <span>View Full Matrix</span>
              <Icon name="arrow-right" className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
