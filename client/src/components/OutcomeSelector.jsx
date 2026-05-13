import { useState } from "react";

export default function OutcomeSelector({ outcomes, setOutcomes }) {
  const [error, setError] = useState("");

  const addOutcome = () => {
    setOutcomes([...outcomes, { id: Date.now(), title: "", odds: 0.5 }]);
  };

  const removeOutcome = (id) => {
    if (outcomes.length <= 2) {
      setError("Minimum 2 outcomes required");
      setTimeout(() => setError(""), 2000);
      return;
    }
    setOutcomes(outcomes.filter((o) => o.id !== id));
  };

  const updateOutcome = (id, field, value) => {
    setOutcomes(outcomes.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider">Outcomes</label>
        {error && <span className="text-red-400 text-sm">{error}</span>}
      </div>
      <div className="space-y-3">
        {outcomes.map((outcome, index) => (
          <div key={outcome.id} className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={outcome.title}
                  onChange={(e) => updateOutcome(outcome.id, "title", e.target.value)}
                  placeholder={`Outcome ${index + 1}`}
                  className="mt-1 w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Odds (0-1)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.99"
                  value={outcome.odds}
                  onChange={(e) => updateOutcome(outcome.id, "odds", parseFloat(e.target.value) || 0.5)}
                  placeholder="0.50"
                  className="mt-1 w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                />
              </div>
            </div>
            <button
              onClick={() => removeOutcome(outcome.id)}
              className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/30 hover:border-red-500/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addOutcome}
        className="w-full py-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 font-semibold transition-all border border-green-500/30 hover:border-green-500/50 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Outcome
      </button>
    </div>
  );
}