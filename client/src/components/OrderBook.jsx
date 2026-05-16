import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import socket from "../socket";

export default function OrderBook({ marketId, onSelectOdds, needsRefresh = false, onRefreshed }) {
  const [orderbook, setOrderbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flashRows, setFlashRows] = useState({});
  const [priceChanges, setPriceChanges] = useState({});
  const prevDataRef = useRef({});
  const pollingRef = useRef(null);

  useEffect(() => {
    if (marketId) {
      fetchOrderbook();
      pollingRef.current = setInterval(fetchOrderbook, 5000);

      socket.on("odds_update", (data) => {
        if (data.market_id === parseInt(marketId)) {
          setPriceChanges(prev => ({
            ...prev,
            [data.outcome_id]: data.change
          }));
          setTimeout(() => {
            setPriceChanges(prev => {
              const updated = { ...prev };
              delete updated[data.outcome_id];
              return updated;
            });
          }, 500);
        }
      });

      socket.on("market_update", (data) => {
        if (data.market_id === parseInt(marketId)) {
          fetchOrderbook();
        }
      });
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      socket.off("odds_update");
      socket.off("market_update");
    };
  }, [marketId]);

  useEffect(() => {
    if (needsRefresh) {
      fetchOrderbook();
      onRefreshed?.();
    }
  }, [needsRefresh]);

  const fetchOrderbook = async () => {
    try {
      const res = await API.get(`/markets/${marketId}/orderbook`);
      const newData = res.data;
      const flashes = {};
      if (prevDataRef.current.outcomes) {
        newData.outcomes.forEach(outcome => {
          const prevOutcome = prevDataRef.current.outcomes?.find(o => o.id === outcome.id);
          if (prevOutcome) {
            const backChanged = JSON.stringify(prevOutcome.back_orders) !== JSON.stringify(outcome.back_orders);
            const layChanged = JSON.stringify(prevOutcome.lay_orders) !== JSON.stringify(outcome.lay_orders);
            if (backChanged || layChanged) {
              flashes[outcome.id] = backChanged ? "back" : "lay";
            }
          }
        });
      }
      if (Object.keys(flashes).length > 0) {
        setFlashRows(flashes);
        setTimeout(() => setFlashRows({}), 400);
      }
      prevDataRef.current = newData;
      setOrderbook(newData);
    } catch (err) {
      console.error("Failed to fetch orderbook:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMaxStake = (orders) => {
    if (!orders || orders.length === 0) return 0;
    return Math.max(...orders.map(o => o.total_stake));
  };

  const getDepthPercentage = (stake, maxStake) => {
    if (maxStake === 0) return 0;
    return (stake / maxStake) * 100;
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-5">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-3 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!orderbook) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-bold text-white">Order Book</h3>
        </div>
        <div className="bg-zinc-800/30 rounded-xl p-8 text-center border border-zinc-700/30 border-dashed">
          <svg className="w-12 h-12 text-zinc-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-zinc-500">No orders yet</p>
          <p className="text-zinc-600 text-sm mt-1">Place a bet to see the order book</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 px-5 py-4 border-b border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-bold text-white">Order Book</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded animate-pulse">
              LIVE
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {orderbook.outcomes.map((outcome) => {
          const maxBackStake = getMaxStake(outcome.back_orders);
          const maxLayStake = getMaxStake(outcome.lay_orders);
          const maxStake = Math.max(maxBackStake, maxLayStake);
          const priceChange = priceChanges[outcome.id];

          return (
            <div
              key={outcome.id}
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                flashRows[outcome.id] ? "ring-2 ring-green-500/50" : "border-zinc-700/50"
              }`}
            >
              <div className="bg-gradient-to-r from-zinc-800/60 to-zinc-800/40 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white">{outcome.title}</h4>
                  {priceChange && priceChange !== "stable" && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      priceChange === "up" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {priceChange === "up" ? "↑ Odds Up" : "↓ Odds Down"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-500">Back: {outcome.back_orders.length}</span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-zinc-500">Lay: {outcome.lay_orders.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-zinc-700/50">
                <div className={`bg-gradient-to-b from-green-500/5 to-transparent transition-colors duration-300 ${
                  flashRows[outcome.id] === "back" ? "bg-green-500/20" : ""
                }`}>
                  <div className="px-3 py-2 bg-zinc-800/40 border-b border-zinc-700/30 flex items-center justify-between">
                    <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Back</span>
                    <span className="text-zinc-500 text-xs">Odds | Volume</span>
                  </div>

                  {outcome.back_orders.length === 0 ? (
                    <div className="px-3 py-6 text-center">
                      <p className="text-zinc-600 text-sm">No back orders</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-700/30">
                      {outcome.back_orders.slice(0, 5).map((order, idx) => {
                        const depthPct = getDepthPercentage(order.total_stake, maxStake);
                        return (
                          <div
                            key={idx}
                            onClick={() => onSelectOdds?.(outcome.id, order.odds, "BACK")}
                            className="relative px-3 py-2.5 hover:bg-green-500/10 cursor-pointer transition-all group"
                          >
                            <div
                              className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ width: `${depthPct}%` }}
                            />
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`font-mono font-bold text-lg transition-all ${
                                  priceChange === "up" ? "text-green-400 scale-105" : "text-green-400"
                                }`}>
                                  {order.odds.toFixed(2)}
                                </span>
                                <div className="flex items-center gap-1">
                                  {[...Array(Math.min(3, Math.ceil(order.count / 2)))].map((_, i) => (
                                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
                                  ))}
                                </div>
                              </div>
                              <span className="text-zinc-400 font-mono text-sm">{order.total_stake.toFixed(0)}</span>
                            </div>
                            <div className="absolute bottom-0 left-0 h-0.5 bg-green-500/30" style={{ width: `${depthPct}%` }} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={`bg-gradient-to-b from-red-500/5 to-transparent transition-colors duration-300 ${
                  flashRows[outcome.id] === "lay" ? "bg-red-500/20" : ""
                }`}>
                  <div className="px-3 py-2 bg-zinc-800/40 border-b border-zinc-700/30 flex items-center justify-between">
                    <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Lay</span>
                    <span className="text-zinc-500 text-xs">Odds | Volume</span>
                  </div>

                  {outcome.lay_orders.length === 0 ? (
                    <div className="px-3 py-6 text-center">
                      <p className="text-zinc-600 text-sm">No lay orders</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-700/30">
                      {outcome.lay_orders.slice(0, 5).map((order, idx) => {
                        const depthPct = getDepthPercentage(order.total_stake, maxStake);
                        return (
                          <div
                            key={idx}
                            onClick={() => onSelectOdds?.(outcome.id, order.odds, "LAY")}
                            className="relative px-3 py-2.5 hover:bg-red-500/10 cursor-pointer transition-all group"
                          >
                            <div
                              className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ width: `${depthPct}%` }}
                            />
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`font-mono font-bold text-lg transition-all ${
                                  priceChange === "down" ? "text-red-400 scale-105" : "text-red-400"
                                }`}>
                                  {order.odds.toFixed(2)}
                                </span>
                                <div className="flex items-center gap-1">
                                  {[...Array(Math.min(3, Math.ceil(order.count / 2)))].map((_, i) => (
                                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
                                  ))}
                                </div>
                              </div>
                              <span className="text-zinc-400 font-mono text-sm">{order.total_stake.toFixed(0)}</span>
                            </div>
                            <div className="absolute bottom-0 right-0 h-0.5 bg-red-500/30" style={{ width: `${depthPct}%` }} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-zinc-800/30 px-4 py-2 border-t border-zinc-700/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    Total Back: <span className="text-green-400 font-mono font-semibold">
                      ${outcome.back_orders.reduce((sum, o) => sum + o.total_stake, 0).toFixed(0)}
                    </span>
                  </span>
                  <div className="h-3 w-px bg-zinc-700" />
                  <span className="text-zinc-500">
                    Total Lay: <span className="text-red-400 font-mono font-semibold">
                      ${outcome.lay_orders.reduce((sum, o) => sum + o.total_stake, 0).toFixed(0)}
                    </span>
                  </span>
                  <div className="h-3 w-px bg-zinc-700" />
                  <span className="text-zinc-500">
                    Spread: <span className="text-yellow-400 font-mono font-semibold">
                      {outcome.back_orders.length && outcome.lay_orders.length
                        ? ((outcome.lay_orders[0]?.odds - outcome.back_orders[0]?.odds) || 0).toFixed(2)
                        : "N/A"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}