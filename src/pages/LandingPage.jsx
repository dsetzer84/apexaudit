import Icon from '../components/Icon.jsx';

export default function LandingPage({
  handleRunAudit,
  targetUrl,
  setTargetUrl,
  isScanning,
}) {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-brand-500 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <span>Next-Gen AI Website &amp; SEO Auditor</span>
          </span>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Audit Your Website in 10 Seconds. <br />
            <span className="bg-gradient-to-r from-brand-500 via-teal-300 to-accent-500 bg-clip-text text-transparent">
              Fix Weak Copy &amp; SEO Instantly.
            </span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
            Stop guessing why visitors drop off. ApexAudit AI analyzes SEO markup, UX friction, and copy conversion power—and rewrites bad headlines automatically.
          </p>

          {/* Scan Form Box */}
          <form
            onSubmit={handleRunAudit}
            className="max-w-xl mx-auto p-2 glass-card rounded-2xl flex flex-col sm:flex-row gap-2 border border-zinc-800 shadow-2xl"
          >
            <div className="relative flex-1 flex items-center px-3">
              <Icon name="globe" className="w-5 h-5 text-zinc-500 mr-2" />
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="Enter site URL (e.g. linear.app)"
                className="w-full bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none py-3"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isScanning}
              className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-zinc-950 font-bold text-sm transition glow-emerald whitespace-nowrap flex items-center justify-center space-x-2"
            >
              {isScanning ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Run Audit Now</span>
                  <Icon name="sparkles" className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-zinc-500">
            <span>Or try sample:</span>
            <button
              onClick={(e) => handleRunAudit(e, 'stripe.com')}
              className="underline hover:text-brand-500 transition"
            >
              stripe.com
            </button>
            <button
              onClick={(e) => handleRunAudit(e, 'linear.app')}
              className="underline hover:text-brand-500 transition"
            >
              linear.app
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-white mb-3">
              Why Growth Teams Switch To ApexAudit
            </h2>
            <p className="text-zinc-400 text-sm">
              Everything you need to turn visitors into buyers and rank higher on Google.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mb-4">
                <Icon name="zap" className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1-Click AI Copy Rewrites</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Don&apos;t just discover weak headlines. Our contextual LLM engine generates high-converting alternative copy formatted for your landing page.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500 mb-4">
                <Icon name="search" className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Technical SEO &amp; Schema Scan</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Uncover missing OpenGraph tags, truncated titles, broken canonical links, and accessibility gaps in milliseconds.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
                <Icon name="gauge" className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Core Web Vitals Diagnostic</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Pinpoint bloated Javascript bundles, render-blocking stylesheets, and unoptimized hero images slowing down mobile visitors.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
