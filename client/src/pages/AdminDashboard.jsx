import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import useAuthStore from "../store/authStore";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [markets, setMarkets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMarket, setNewMarket] = useState({
    title: "",
    description: "",
    type: "BINARY",
    outcomes: [
      { title: "YES", odds: 0.5 },
      { title: "NO", odds: 0.5 }
    ]
  });

  useEffect(() => {
    fetchMarkets();
    fetchStats();
  }, []);

  const fetchMarkets = async () => {
    try {
      const res = await API.get("/admin/markets/all");
      setMarkets(res.data.markets || []);
    } catch (err) {
      console.error("Failed to fetch markets:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data.stats);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleCreateMarket = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/markets/create", {
        title: newMarket.title,
        description: newMarket.description,
        type: newMarket.type,
        outcomes: newMarket.outcomes.map(o => ({
          title: o.title,
          odds: parseFloat(o.odds)
        }))
      });
      setShowCreateModal(false);
      setNewMarket({
        title: "",
        description: "",
        type: "BINARY",
        outcomes: [{ title: "YES", odds: 0.5 }, { title: "NO", odds: 0.5 }]
      });
      fetchMarkets();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create market");
    }
  };

  const handleResolveMarket = async (marketId, outcomeId) => {
    if (!confirm("Are you sure you want to resolve this market?")) return;
    try {
      await API.post(`/admin/markets/${marketId}/resolve`, { outcome_id: outcomeId });
      fetchMarkets();
      fetchStats();
      alert("Market resolved successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to resolve market");
    }
  };

  const handleCloseMarket = async (marketId) => {
    if (!confirm("Are you sure you want to close this market? All bets will be refunded.")) return;
    try {
      await API.post(`/admin/markets/${marketId}/close`);
      fetchMarkets();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to close market");
    }
  };

  const isBinary = newMarket.type === "BINARY";

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-zinc-400 mt-2">Manage markets and platform</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Market
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4">
              <div className="text-zinc-500 text-xs uppercase tracking-wider">Total Users</div>
              <div className="text-2xl font-bold text-white mt-1">{stats.total_users}</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4">
              <div className="text-zinc-500 text-xs uppercase tracking-wider">Total Markets</div>
              <div className="text-2xl font-bold text-purple-400 mt-1">{stats.total_markets}</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4">
              <div className="text-zinc-500 text-xs uppercase tracking-wider">Open Markets</div>
              <div className="text-2xl font-bold text-green-400 mt-1">{stats.open_markets}</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4">
              <div className="text-zinc-500 text-xs uppercase tracking-wider">Resolved</div>
              <div className="text-2xl font-bold text-blue-400 mt-1">{stats.resolved_markets}</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4">
              <div className="text-zinc-500 text-xs uppercase tracking-wider">Total Bets</div>
              <div className="text-2xl font-bold text-yellow-400 mt-1">{stats.total_bets}</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4">
              <div className="text-zinc-500 text-xs uppercase tracking-wider">Volume</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">${stats.total_volume?.toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-6">All Markets</h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : markets.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">No markets created yet</div>
          ) : (
            <div className="space-y-4">
              {markets.map((market) => (
                <div key={market.id} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">{market.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        market.status === "OPEN" ? "bg-green-500/20 text-green-400" :
                        market.status === "RESOLVED" ? "bg-blue-500/20 text-blue-400" :
                        "bg-zinc-600 text-zinc-400"
                      }`}>
                        {market.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-sm">{market.total_bets} bets</span>
                      {market.status === "OPEN" && (
                        <>
                          <button
                            onClick={() => {
                              const outcome = market.outcomes[0];
                              if (outcome && confirm(`Resolve with "${outcome.title}" as winner?`)) {
                                handleResolveMarket(market.id, outcome.id);
                              }
                            }}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleCloseMarket(market.id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                          >
                            Close
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {market.outcomes.map((outcome) => (
                      <div key={outcome.id} className="bg-zinc-900/50 rounded-lg p-3 text-center">
                        <div className="text-zinc-400 text-sm">{outcome.title}</div>
                        <div className="text-green-400 font-bold">{(outcome.odds * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create Market</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateMarket} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={newMarket.title}
                  onChange={(e) => setNewMarket({ ...newMarket, title: e.target.value })}
                  placeholder="Will BTC exceed $100k by end of 2025?"
                  className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={newMarket.description}
                  onChange={(e) => setNewMarket({ ...newMarket, description: e.target.value })}
                  placeholder="Market description..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">Market Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewMarket({ ...newMarket, type: "BINARY", outcomes: [{ title: "YES", odds: 0.5 }, { title: "NO", odds: 0.5 }] })}
                    className={`p-3 rounded-xl border-2 transition-all ${isBinary ? "border-purple-500 bg-purple-500/10 text-purple-400" : "border-zinc-700/50 text-zinc-400"}`}
                  >
                    Binary
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMarket({ ...newMarket, type: "MULTI_OUTCOME", outcomes: [{ title: "", odds: 0.5 }, { title: "", odds: 0.5 }, { title: "", odds: 0.5 }] })}
                    className={`p-3 rounded-xl border-2 transition-all ${!isBinary ? "border-purple-500 bg-purple-500/10 text-purple-400" : "border-zinc-700/50 text-zinc-400"}`}
                  >
                    Multi-Outcome
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">Outcomes</label>
                <div className="space-y-3">
                  {newMarket.outcomes.map((outcome, idx) => (
                    <div key={idx} className="flex gap-3">
                      <input
                        type="text"
                        value={outcome.title}
                        onChange={(e) => {
                          const newOutcomes = [...newMarket.outcomes];
                          newOutcomes[idx].title = e.target.value;
                          setNewMarket({ ...newMarket, outcomes: newOutcomes });
                        }}
                        placeholder="Outcome name"
                        className="flex-1 bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="0.99"
                        value={outcome.odds}
                        onChange={(e) => {
                          const newOutcomes = [...newMarket.outcomes];
                          newOutcomes[idx].odds = e.target.value;
                          setNewMarket({ ...newMarket, outcomes: newOutcomes });
                        }}
                        placeholder="0.50"
                        className="w-24 bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                  ))}
                </div>
                {newMarket.type === "MULTI_OUTCOME" && (
                  <button
                    type="button"
                    onClick={() => setNewMarket({ ...newMarket, outcomes: [...newMarket.outcomes, { title: "", odds: 0.5 }] })}
                    className="mt-3 text-purple-400 text-sm hover:text-purple-300"
                  >
                    + Add Outcome
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-zinc-400 hover:text-white border border-zinc-700/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold"
                >
                  Create Market
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}