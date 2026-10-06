import Icon from './Icon.jsx';

export default function AiFixModal({ aiFixModal, setAiFixModal }) {
  if (!aiFixModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-zinc-700 shadow-2xl relative">
        <button
          onClick={() => setAiFixModal(null)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        <div className="flex items-center space-x-2 text-brand-500 mb-4 font-semibold text-sm">
          <Icon name="sparkles" className="w-4 h-4" />
          <span>Apex AI Suggestion Engine</span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{aiFixModal.title}</h3>
        <p className="text-xs text-zinc-400 mb-4">Category: {aiFixModal.cat}</p>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed mb-6">
          {aiFixModal.fix}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              navigator.clipboard.writeText(aiFixModal.fix);
              alert('AI Fix code copied to clipboard!');
            }}
            className="px-4 py-2 rounded-lg bg-brand-500 text-zinc-950 font-bold text-xs glow-emerald"
          >
            Copy Code Snippet
          </button>
          <button
            onClick={() => setAiFixModal(null)}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
