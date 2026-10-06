import Icon from '../components/Icon.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import { PRESET_SITES } from '../data/presetSites.js';

export default function HistoryDashboard({ handleRunAudit }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Breadcrumb className="mb-6" />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Pre-Seeded Audit Reports</h1>
        <p className="text-zinc-400 text-sm">
          Select any baseline SaaS application below to view detailed breakdown logs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {Object.keys(PRESET_SITES).map((key) => {
          const item = PRESET_SITES[key];
          return (
            <div
              key={key}
              className="glass-card p-6 rounded-2xl hover:border-brand-500/50 transition cursor-pointer"
              onClick={(e) => handleRunAudit(e, key)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-brand-500 font-bold bg-brand-500/10 px-2.5 py-1 rounded border border-brand-500/20">
                  {item.url}
                </span>
                <span className="text-xl font-black text-white">{item.scores.overall}/100</span>
              </div>
              <h3 className="text-md font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-zinc-400 mb-4">
                {item.issues.length} Diagnostic check findings recorded.
              </p>
              <button className="text-xs text-brand-500 font-bold hover:underline flex items-center space-x-1">
                <span>Open Detailed Report</span>
                <Icon name="chevron-right" className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
