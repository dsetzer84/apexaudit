import { Link, useParams } from 'react-router-dom';
import { COMPETITORS } from '../data/competitors.js';

export default function CompareDetail() {
  const { slug } = useParams();
  const comp = COMPETITORS.find((c) => c.slug === slug) || COMPETITORS[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-zinc-500 mb-6">
        <Link to="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link to="/compare" className="hover:text-white">
          Comparisons
        </Link>
        <span>/</span>
        <span className="text-zinc-300">ApexAudit vs {comp.name}</span>
      </div>

      {/* Headline & Title */}
      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
        ApexAudit AI vs {comp.name}: Features, Pricing &amp; Which is Better in 2026?
      </h1>

      <p className="text-zinc-400 text-md leading-relaxed mb-8">
        Looking for the right SEO and conversion audit platform? Here is an unfiltered, data-backed comparison between ApexAudit AI and {comp.name}.
      </p>

      {/* Quick Summary Box */}
      <div className="glass-card p-6 rounded-2xl mb-10 border-l-4 border-brand-500">
        <h3 className="text-md font-bold text-white mb-2">The Bottom Line Verdict</h3>
        <p className="text-sm text-zinc-300 leading-relaxed">{comp.verdict}</p>
      </div>

      {/* Comparison Table */}
      <div className="glass-card rounded-2xl overflow-hidden mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900/80 border-b border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <th className="p-4">Feature / Metric</th>
              <th className="p-4 text-brand-500 font-extrabold">ApexAudit AI</th>
              <th className="p-4">{comp.name}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-sm">
            <tr>
              <td className="p-4 text-zinc-300 font-medium">Monthly Pricing</td>
              <td className="p-4 text-brand-500 font-bold">{comp.ourPrice}</td>
              <td className="p-4 text-zinc-400">{comp.price}</td>
            </tr>
            {comp.features.map((f, i) => (
              <tr key={i}>
                <td className="p-4 text-zinc-300">{f.name}</td>
                <td className="p-4">
                  {f.us ? (
                    <span className="text-brand-500 font-bold">✓ Included</span>
                  ) : (
                    <span className="text-zinc-600">✗ No</span>
                  )}
                </td>
                <td className="p-4">
                  {f.them ? (
                    <span className="text-emerald-400">✓ Included</span>
                  ) : (
                    <span className="text-zinc-600">✗ No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 mb-12">
        <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
        {comp.faq.map((item, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl">
            <h3 className="text-md font-bold text-white mb-2">{item.q}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      {/* Bottom CTA Banner */}
      <div className="glass-card p-8 rounded-3xl text-center bg-gradient-to-br from-brand-950/40 via-zinc-900 to-zinc-950 border border-brand-500/30">
        <h3 className="text-2xl font-black text-white mb-2">Ready To Audit Your Site?</h3>
        <p className="text-zinc-400 text-sm mb-6 max-w-lg mx-auto">
          Try ApexAudit AI today and fix your headline copy and technical SEO issues in minutes.
        </p>
        <Link
          to="/app"
          className="inline-block px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-zinc-950 font-bold text-sm glow-emerald transition"
        >
          Start Free Audit
        </Link>
      </div>
    </div>
  );
}
