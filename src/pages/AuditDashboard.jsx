import Icon from '../components/Icon.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';

export default function AuditDashboard({
  activeAudit,
  isScanning,
  scanStep,
  targetUrl,
  setTargetUrl,
  handleRunAudit,
  setAiFixModal,
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb className="mb-6" />

      {/* Search Header Bar */}
      <div className="glass-card p-4 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-3 h-3 rounded-full bg-brand-500 animate-ping"></div>
          <span className="text-sm font-semibold text-zinc-300">Target:</span>
          <span className="text-sm font-mono bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 text-brand-500 font-bold">
            {activeAudit ? activeAudit.url : 'No site loaded'}
          </span>
          {activeAudit?.source && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                activeAudit.source === 'live'
                  ? 'bg-brand-500/10 text-brand-500 border-brand-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
              title={
                activeAudit.source === 'live'
                  ? 'Live audit — fetched and analysed server-side'
                  : `Demo data${activeAudit.fallbackReason ? ` (${activeAudit.fallbackReason})` : ''}`
              }
            >
              {activeAudit.source === 'live' ? 'Live' : 'Demo'}
            </span>
          )}
        </div>

        <form onSubmit={handleRunAudit} className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="Audit another URL..."
            className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition"
          >
            Scan
          </button>
        </form>
      </div>

      {isScanning && (
        <div className="glass-card p-16 rounded-3xl text-center max-w-xl mx-auto my-12">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-white mb-2">Analyzing Landing Page</h3>
          <p className="text-brand-500 text-sm font-mono animate-pulse">{scanStep}</p>
        </div>
      )}

      {!isScanning && !activeAudit && (
        <div className="glass-card p-12 rounded-3xl text-center max-w-md mx-auto my-12">
          <Icon name="bar-chart-2" className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Active Audit Loaded</h3>
          <p className="text-zinc-400 text-sm mb-6">
            Enter a website URL above or choose from one of our pre-analyzed demo sites.
          </p>
          <button
            onClick={(e) => handleRunAudit(e, 'stripe.com')}
            className="px-5 py-2.5 bg-brand-500 text-zinc-950 font-bold rounded-xl text-sm glow-emerald"
          >
            Load Stripe.com Audit Demo
          </button>
        </div>
      )}

      {!isScanning && activeAudit && (
        <div className="space-y-8">
          {/* Score Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-card p-5 rounded-2xl text-center border-l-4 border-brand-500">
              <div className="text-3xl font-black text-white mb-1">
                {activeAudit.scores.overall}
                <span className="text-xs text-zinc-500 font-normal">/100</span>
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                Overall Score
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-2xl font-bold text-brand-500 mb-1">{activeAudit.scores.seo}%</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                SEO Health
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-2xl font-bold text-accent-500 mb-1">{activeAudit.scores.copy}%</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                Copy Conversion
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-2xl font-bold text-teal-400 mb-1">{activeAudit.scores.speed}%</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                Page Speed
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-2xl font-bold text-amber-400 mb-1">{activeAudit.scores.ux}%</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                UX Friction
              </div>
            </div>
          </div>

          {/* Diagnostic Findings Section */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Diagnostic Action Items</h3>
                <p className="text-xs text-zinc-400">
                  Prioritized by impact on search ranking and sales conversions.
                </p>
              </div>
              <span className="text-xs bg-zinc-900 text-zinc-300 px-3 py-1 rounded-full border border-zinc-800">
                {activeAudit.issues.length} Checkpoints Evaluated
              </span>
            </div>

            <div className="space-y-4">
              {activeAudit.issues.map((issue, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3">
                    {issue.type === 'critical' && (
                      <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase">
                        Critical
                      </span>
                    )}
                    {issue.type === 'warning' && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase">
                        Warning
                      </span>
                    )}
                    {issue.type === 'passed' && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase">
                        Passed
                      </span>
                    )}

                    <div>
                      <div className="text-sm font-semibold text-white flex items-center space-x-2">
                        <span>{issue.title}</span>
                        <span className="text-xs text-zinc-500 font-mono">[{issue.cat}]</span>
                      </div>
                    </div>
                  </div>

                  {issue.fix && (
                    <button
                      onClick={() => setAiFixModal(issue)}
                      className="px-3.5 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 border border-brand-500/30 text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 self-start md:self-auto"
                    >
                      <Icon name="sparkles" className="w-3.5 h-3.5" />
                      <span>Generate AI Fix</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Educational Disclaimer */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center">
            <p className="text-xs text-zinc-500">
              * Note: Audits are for technical and marketing diagnostic purposes only. Always split-test copy variations in production before full rollout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
