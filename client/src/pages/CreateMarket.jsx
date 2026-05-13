import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import OutcomeSelector from "../components/OutcomeSelector";

export default function CreateMarket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "BINARY",
    outcomes: [
      { id: 1, title: "YES", odds: 0.5 },
      { id: 2, title: "NO", odds: 0.5 },
    ],
  });

  const isBinary = form.type === "BINARY";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required");
      return;
    }
    if (form.outcomes.some((o) => !o.title.trim())) {
      setError("All outcomes must have titles");
      return;
    }
    if (isBinary && form.outcomes.length !== 2) {
      setError("Binary markets must have exactly YES and NO");
      return;
    }
    if (!isBinary && form.outcomes.length < 2) {
      setError("At least 2 outcomes required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        outcomes: form.outcomes.map((o) => ({ title: o.title, odds: o.odds })),
      };
      await API.post("/markets/create", payload);
      navigate("/markets");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create market");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType) => {
    setForm({
      ...form,
      type: newType,
      outcomes: newType === "BINARY"
        ? [
            { id: 1, title: "YES", odds: 0.5 },
            { id: 2, title: "NO", odds: 0.5 },
          ]
        : [
            { id: 1, title: "", odds: 0.5 },
            { id: 2, title: "", odds: 0.5 },
          ],
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Create Market</h1>
          <p className="text-zinc-400 mt-2">Build a new prediction market</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6">Market Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Will Bitcoin exceed $100,000 by end of 2025?"
                  className="w-full bg-zinc-900 border border-zinc-700/50 rounded-xl px-5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="This market resolves to YES if Bitcoin (BTC) trades above $100,000 USD on any major exchange before December 31, 2025 23:59 UTC."
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-700/50 rounded-xl px-5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">Market Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleTypeChange("BINARY")}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      isBinary
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-zinc-700/50 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <div className="text-lg font-bold">Binary</div>
                    <div className="text-sm text-zinc-500 mt-1">Yes / No outcome</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange("MULTI_OUTCOME")}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      !isBinary
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-zinc-700/50 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <div className="text-lg font-bold">Multi-Outcome</div>
                    <div className="text-sm text-zinc-500 mt-1">Custom outcomes</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6">Outcomes &amp; Odds</h2>
            <OutcomeSelector
              outcomes={form.outcomes}
              setOutcomes={(outcomes) => setForm({ ...form, outcomes })}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/markets")}
              className="px-6 py-3 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Market
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}