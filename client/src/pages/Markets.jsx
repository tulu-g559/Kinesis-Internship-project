import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import OddsCard from "../components/OddsCard";
import MarketFilters from "../components/MarketFilters";

export default function Markets() {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "ALL" });
  const [liveOddsMap, setLiveOddsMap] = useState({});
  const [tradersOnline, setTradersOnline] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const prevOddsRef = useRef({});
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchMarkets();
    pollingRef.current = setInterval(fetchAllLiveOdds, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const fetchMarkets = async () => {
    try {
      const res = await API.get("/markets/");
      setMarkets(res.data);
      const initialLive = {};
      res.data.forEach(m => {
        m.outcomes.forEach(o => {
          initialLive[`${m.id}:${o.id}`] = { 
            votePercentage: o.vote_percentage, 
            change: "stable",
            bettingPrice: o.betting_price
          };
        });
      });
      setLiveOddsMap(initialLive);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLiveOdds = async () => {
    try {
      const res = await API.get("/markets/");
      const newLiveOdds = {};
      let totalVol = 0;
      res.data.forEach(m => {
        m.outcomes.forEach(o => {
          const key = `${m.id}:${o.id}`;
          const prev = prevOddsRef.current[key];
          const change = prev ? (o.vote_percentage > prev.votePercentage ? "up" : o.vote_percentage < prev.votePercentage ? "down" : "stable") : "stable";
          newLiveOdds[key] = { 
            votePercentage: o.vote_percentage, 
            change,
            bettingPrice: o.betting_price
          };
          prevOddsRef.current[key] = { votePercentage: o.vote_percentage };
        });
        totalVol += Math.random() * 50000 + 10000;
      });
      setTotalVolume(totalVol);
      setTradersOnline(Math.floor(Math.random() * 150) + 100);
      setLiveOddsMap(newLiveOdds);
      setTimeout(() => {
        setLiveOddsMap(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(k => { updated[k] = { ...updated[k], change: "stable" }; });
          return updated;
        });
      }, 600);
    } catch (err) {
      console.error("Live odds fetch error:", err);
    }
  };

  const filteredMarkets = markets.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === "ALL" || m.status === filters.status || m.type === filters.status;
    return matchesSearch && matchesStatus;
  });

  const getOddsWithLive = (marketId, outcomeId, defaultOdds) => {
    const key = `${marketId}:${outcomeId}`;
    return liveOddsMap[key]?.votePercentage || defaultOdds;
  };

  const getChange = (marketId, outcomeId) => {
    const key = `${marketId}:${outcomeId}`;
    return liveOddsMap[key]?.change || "stable";
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">AGON Markets</h1>
            <p className="text-zinc-400 mt-2">Real-time prediction markets</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/50 rounded-xl px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 font-bold">{tradersOnline}</span>
              <span className="text-zinc-400 text-sm">traders online</span>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/50 rounded-xl px-4 py-2">
              <span className="text-zinc-400 text-sm">24h Volume</span>
              <span className="text-white font-bold font-mono">${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Dashboard
          </button>
        </div>

        <div className="mb-6">
          <MarketFilters onFilterChange={setFilters} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-3xl p-12 text-center">
            <p className="text-zinc-500 text-xl">No markets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              <div
                key={market.id}
                onClick={() => navigate(`/markets/${market.id}`)}
                className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex-1">{market.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${market.status === "OPEN" ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"}`}>
                      {market.status}
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-5 line-clamp-2">{market.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {market.outcomes.map((outcome) => (
                    <OddsCard
                      key={outcome.id}
                      title={outcome.title}
                      odds={getOddsWithLive(market.id, outcome.id, outcome.vote_percentage) / 100}
                      change={getChange(market.id, outcome.id)}
                      showLive
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}