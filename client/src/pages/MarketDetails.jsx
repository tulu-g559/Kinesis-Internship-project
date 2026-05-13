import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";

function OutcomeCard({ outcome, marketId, isBinary }) {
  const [odds, setOdds] = useState(outcome.odds);
  const [prevOdds, setPrevOdds] = useState(outcome.odds);
  const [flashClass, setFlashClass] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.08;
      const newOdds = Math.max(0.01, Math.min(0.99, odds + change));
      const diff = newOdds - odds;
      setPrevOdds(odds);
      setOdds(newOdds);
      setFlashClass(diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "");
      setTimeout(() => setFlashClass(""), 600);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(intervalRef.current);
  }, [odds]);

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-5 hover:border-green-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-400 text-sm uppercase tracking-wider">{outcome.title}</span>
        {isBinary && (
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>
      <div className={`text-4xl font-bold transition-colors duration-300 ${flashClass || "text-green-400"}`}>
        {(odds * 100).toFixed(1)}%
      </div>
      <div className="text-zinc-500 text-sm mt-2">
        {odds >= prevOdds ? "+" : ""}{((odds - prevOdds) * 100).toFixed(2)}%
      </div>
      <button className="w-full mt-4 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 font-semibold transition-all border border-green-500/30 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]">
        Trade
      </button>
    </div>
  );
}

export default function MarketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [volume] = useState(() => Math.floor(Math.random() * 50000) + 10000);
  const [liquidity] = useState(() => Math.floor(Math.random() * 100000) + 50000);
  const [traders] = useState(() => Math.floor(Math.random() * 500) + 100);

  useEffect(() => {
    fetchMarket();
  }, [id]);

  const fetchMarket = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/markets/${id}`);
      setMarket(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load market");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
          <p className="text-red-400 text-xl">{error}</p>
          <Link to="/markets" className="mt-4 inline-block text-green-400 hover:underline">
            Back to Markets
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isBinary = market.type === "BINARY";

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/markets" className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{market.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${market.status === "OPEN" ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"}`}>
                {market.status}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-zinc-400 mt-2">{market.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-4">
            <div className="text-zinc-500 text-sm uppercase tracking-wider">24h Volume</div>
            <div className="text-2xl font-bold text-green-400 mt-1">${volume.toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-4">
            <div className="text-zinc-500 text-sm uppercase tracking-wider">Liquidity</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">${liquidity.toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-4">
            <div className="text-zinc-500 text-sm uppercase tracking-wider">Active Traders</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">{traders}</div>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-4">
            <div className="text-zinc-500 text-sm uppercase tracking-wider">Market Type</div>
            <div className="text-2xl font-bold text-zinc-300 mt-1">{market.type}</div>
          </div>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Current Odds</h2>
            <span className="text-zinc-500 text-sm">Updating every 3-5 seconds</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {market.outcomes.map((outcome) => (
              <OutcomeCard key={outcome.id} outcome={outcome} marketId={market.id} isBinary={isBinary} />
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { user: "0x7a3...f2e", action: "Bought YES", amount: "$250", time: "2m ago" },
              { user: "0x3b9...a1c", action: "Sold NO", amount: "$100", time: "5m ago" },
              { user: "0x9c2...d4f", action: "Bought YES", amount: "$500", time: "8m ago" },
              { user: "0x1e5...b8g", action: "Sold YES", amount: "$75", time: "12m ago" },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
                <div className="flex items-center gap-4">
                  <span className="text-zinc-500 font-mono text-sm">{tx.user}</span>
                  <span className={`text-sm font-semibold ${tx.action.includes("YES") ? "text-green-400" : "text-red-400"}`}>
                    {tx.action}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-zinc-300 font-semibold">{tx.amount}</span>
                  <span className="text-zinc-500 text-sm">{tx.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}