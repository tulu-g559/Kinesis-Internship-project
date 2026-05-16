import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import socket from "../socket";
import DashboardLayout from "../layouts/DashboardLayout";
import BetSlip from "../components/BetSlip";
import OrderBook from "../components/OrderBook";
import OpenPositions from "../components/OpenPositions";
import LiveActivityTicker from "../components/LiveActivityTicker";

export default function BettingMarket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [market, setMarket] = useState(null);
  const [liveOdds, setLiveOdds] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradersOnline, setTradersOnline] = useState(0);
  const [liquidity, setLiquidity] = useState(0);
  const [volume24h, setVolume24h] = useState(0);
  const [oddsChanges, setOddsChanges] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const prevOddsRef = useRef({});
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchMarket();
    fetchLiveOdds();
    pollingRef.current = setInterval(fetchLiveOdds, 5000);

    socket.on("odds_update", (data) => {
      if (data.market_id === parseInt(id)) {
        setLiveOdds((prev) => {
          if (!prev) return prev;
          const updated = { ...prev };
          const outcomeIndex = updated.outcomes?.findIndex(o => o.id === data.outcome_id);
          if (outcomeIndex !== -1) {
            updated.outcomes = [...updated.outcomes];
            updated.outcomes[outcomeIndex] = {
              ...updated.outcomes[outcomeIndex],
              odds: data.odds,
              change: data.change
            };
            const changes = { ...oddsChanges };
            changes[data.outcome_id] = data.change;
            setOddsChanges(changes);
            setLastUpdate(new Date());
            setTimeout(() => {
              setOddsChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[data.outcome_id];
                return newChanges;
              });
            }, 800);
          }
          return updated;
        });
      }
    });

    socket.on("market_update", (data) => {
      if (data.market_id === parseInt(id)) {
        setOrderbookNeedsRefresh(true);
        setLastUpdate(new Date());
      }
    });

    socket.on("bet_matched", (data) => {
      if (data.market_id === parseInt(id)) {
        setLastUpdate(new Date());
      }
    });

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      socket.off("odds_update");
      socket.off("market_update");
      socket.off("bet_matched");
    };
  }, [id]);

  const [orderbookNeedsRefresh, setOrderbookNeedsRefresh] = useState(false);

  const fetchMarket = async () => {
    try {
      const res = await API.get(`/markets/${id}`);
      setMarket(res.data);
      if (res.data.outcomes?.length > 0 && !selectedOutcome) {
        setSelectedOutcome(res.data.outcomes[0]);
      }
      const initialChanges = {};
      res.data.outcomes.forEach(o => { initialChanges[o.id] = "stable"; });
      setOddsChanges(initialChanges);
    } catch (err) {
      console.error("Failed to fetch market:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveOdds = async () => {
    try {
      const res = await API.get(`/markets/live-odds/${id}`);
      const data = res.data;
      setLiveOdds(data);
      setTradersOnline(data.traders_online);
      setLiquidity(data.total_liquidity);
      setVolume24h(data.volume_24h);
      const changes = {};
      data.outcomes.forEach(o => {
        const prev = prevOddsRef.current[o.id];
        changes[o.id] = prev ? (o.odds > prev ? "up" : o.odds < prev ? "down" : "stable") : "stable";
        prevOddsRef.current[o.id] = o.odds;
      });
      setOddsChanges(changes);
      setLastUpdate(new Date());
      setTimeout(() => setOddsChanges({}), 800);
    } catch (err) {
      console.error("Failed to fetch live odds:", err);
    }
  };

  const handleSelectOdds = (outcomeId, odds, side) => {
    const outcome = liveOdds?.outcomes?.find(o => o.id === outcomeId) || market?.outcomes?.find(o => o.id === outcomeId);
    if (outcome) {
      const decimalOdds = (1 / (outcome.odds || odds)).toFixed(2);
      setSelectedOutcome({ ...outcome, odds: parseFloat(decimalOdds) });
      document.getElementById("odds-input")?.focus();
    }
  };

  const handleBetPlaced = () => {
    fetchMarket();
    fetchLiveOdds();
    setOrderbookNeedsRefresh(true);
    setLastUpdate(new Date());
  };

  const getDisplayOdds = (outcomeId) => {
    const live = liveOdds?.outcomes?.find(o => o.id === outcomeId);
    return live?.odds || market?.outcomes?.find(o => o.id === outcomeId)?.odds || 0;
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return "...";
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000);
    if (diff < 5) return "just now";
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Loading market data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!market) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Market not found</h2>
          <p className="text-zinc-500 mb-6">The market you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/markets")}
            className="px-6 py-2.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-xl transition-colors font-semibold"
          >
            Back to Markets
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate("/markets")}
          className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 hover:border-zinc-600 transition-all"
        >
          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">{market.title}</h1>
            <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
              LIVE
            </span>
          </div>
          <p className="text-zinc-400 text-sm">{market.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider border ${
            market.status === "OPEN"
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-zinc-700/50 text-zinc-400 border-zinc-600/30"
          }`}>
            {market.status}
          </span>
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Updated {formatLastUpdate()}</span>
          </div>
        </div>
      </div>

      <LiveActivityTicker />

      <div className="flex flex-wrap items-center gap-3 mb-6 bg-gradient-to-r from-zinc-900/80 to-zinc-900/60 border border-zinc-800/60 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-white font-bold">{tradersOnline}</span>
          <span className="text-zinc-400 text-sm">Traders Online</span>
        </div>

        <div className="h-5 w-px bg-zinc-700/50 hidden sm:block" />

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-zinc-400 text-sm">Liquidity</span>
          <span className="text-white font-mono font-semibold">${liquidity.toLocaleString()}</span>
        </div>

        <div className="h-5 w-px bg-zinc-700/50 hidden sm:block" />

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-zinc-400 text-sm">24h Volume</span>
          <span className="text-white font-mono font-semibold">${volume24h.toLocaleString()}</span>
        </div>

        <div className="h-5 w-px bg-zinc-700/50 hidden sm:block" />

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-zinc-400 text-sm">Outcomes</span>
          <span className="text-white font-semibold">{market.outcomes?.length || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <BetSlip
            marketId={id}
            selectedOutcome={selectedOutcome}
            onBetPlaced={handleBetPlaced}
          />
          <OpenPositions />
        </div>

        <div className="xl:col-span-3 space-y-6">
          <OrderBook
            marketId={id}
            onSelectOdds={handleSelectOdds}
            needsRefresh={orderbookNeedsRefresh}
            onRefreshed={() => setOrderbookNeedsRefresh(false)}
          />

          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 px-5 py-4 border-b border-zinc-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h3 className="text-lg font-bold text-white">Market Outcomes</h3>
                </div>
                <span className="px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg animate-pulse">
                  LIVE ODDS
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {market.outcomes.map((outcome) => {
                  const displayOdds = getDisplayOdds(outcome.id);
                  const decimalOdds = (1 / displayOdds).toFixed(2);
                  const change = oddsChanges[outcome.id] || "stable";

                  return (
                    <button
                      key={outcome.id}
                      onClick={() => setSelectedOutcome({ ...outcome, odds: parseFloat(decimalOdds) })}
                      className={`relative p-5 rounded-xl border transition-all duration-300 ${
                        selectedOutcome?.id === outcome.id
                          ? "bg-gradient-to-br from-green-500/15 to-green-500/5 border-green-500/50 shadow-[0_0_25px_rgba(34,197,94,0.2)]"
                          : "bg-zinc-800/40 border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/60"
                      }`}
                    >
                      {change !== "stable" && (
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          change === "up" ? "bg-green-500/20 text-green-400 animate-bounce" : "bg-red-500/20 text-red-400 animate-bounce"
                        }`}>
                          {change === "up" ? "↑" : "↓"}
                        </div>
                      )}

                      <div className="text-center">
                        <p className="text-white font-semibold text-base mb-3">{outcome.title}</p>

                        <div className={`text-4xl font-bold tracking-tight mb-2 transition-all duration-300 ${
                          change === "up" ? "text-green-400 scale-[1.05]" : change === "down" ? "text-red-400 scale-[0.95]" : "text-green-400"
                        }`}>
                          {(displayOdds * 100).toFixed(1)}%
                        </div>

                        <div className="flex items-center justify-center gap-3 text-xs text-zinc-500">
                          <span className="px-2 py-1 bg-zinc-700/50 rounded">Dec: {decimalOdds}</span>
                        </div>

                        {selectedOutcome?.id === outcome.id && (
                          <div className="mt-3 pt-3 border-t border-green-500/20">
                            <span className="text-green-400 text-xs font-semibold">Selected for betting</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}