import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import socket from "../socket";

export default function OpenPositions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchPositions();
    pollingRef.current = setInterval(fetchPositions, 5000);

    socket.on("bet_matched", () => {
      fetchPositions();
    });

    socket.on("odds_update", () => {
    });

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      socket.off("bet_matched");
      socket.off("odds_update");
    };
  }, []);

  const fetchPositions = async () => {
    try {
      const res = await API.get("/bets/my");
      setPositions(res.data.bets || []);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PARTIAL":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "MATCHED":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "WON":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "LOST":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const calculateExposure = (position) => {
    return position.stake;
  };

  const calculatePotentialPL = (position) => {
    if (position.side === "BACK") {
      return position.status === "MATCHED" || position.status === "WON"
        ? (position.matched_amount * position.odds - position.matched_amount).toFixed(2)
        : ((position.remaining_amount || 0) * position.odds - (position.remaining_amount || 0)).toFixed(2);
    } else {
      return position.status === "MATCHED" || position.status === "WON"
        ? (position.matched_amount - position.matched_amount * position.odds).toFixed(2)
        : 0;
    }
  };

  const getMatchedPercentage = (position) => {
    if (!position.stake || position.stake === 0) return 0;
    return ((position.matched_amount / position.stake) * 100).toFixed(0);
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-green-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <h3 className="text-lg font-bold text-white">Open Positions</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-zinc-800/60 rounded-xl" />
          <div className="h-20 bg-zinc-800/60 rounded-xl" />
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 className="text-lg font-bold text-white">Open Positions</h3>
          </div>
          <span className="px-2 py-0.5 bg-zinc-700/50 text-zinc-400 text-xs font-bold rounded">
            {positions.length} Active
          </span>
        </div>
      </div>

      <div className="p-4">
        {positions.length === 0 ? (
          <div className="bg-zinc-800/30 rounded-xl p-6 text-center border border-zinc-700/30 border-dashed">
            <svg className="w-10 h-10 text-zinc-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4M12 4v16" />
            </svg>
            <p className="text-zinc-500 font-semibold">No open positions</p>
            <p className="text-zinc-600 text-sm mt-1">Your active bets will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((position) => {
              const matchedPct = getMatchedPercentage(position);
              const exposure = calculateExposure(position);
              const potentialPL = calculatePotentialPL(position);
              const isExpanded = expandedId === position.id;

              return (
                <div
                  key={position.id}
                  className={`bg-zinc-800/40 border rounded-xl overflow-hidden transition-all duration-300 hover:border-zinc-600 ${
                    position.status === "MATCHED" ? "border-blue-500/30" : position.status === "WON" ? "border-emerald-500/30" : position.status === "LOST" ? "border-red-500/30" : "border-zinc-700/50"
                  }`}
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : position.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            position.side === "BACK" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}>
                            {position.side}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getStatusColor(position.status)}`}>
                            {position.status}
                          </span>
                        </div>
                        <p className="text-white font-semibold text-sm">{position.outcome_title || `Outcome #${position.outcome_id}`}</p>
                        <p className="text-zinc-400 text-xs">{position.market_title || `Market #${position.market_id}`}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-mono font-bold">${position.stake}</p>
                        <p className="text-zinc-500 text-xs">@ {position.odds.toFixed(2)}</p>
                      </div>
                    </div>

                    {position.status !== "OPEN" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-500">Matched</span>
                          <span className="text-white font-mono">${(position.matched_amount || 0).toFixed(0)} / ${position.stake}</span>
                        </div>
                        <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              position.status === "MATCHED" ? "bg-blue-500" : position.status === "PARTIAL" ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${matchedPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-zinc-600 text-xs">{matchedPct}% matched</span>
                          {potentialPL > 0 && (
                            <span className="text-emerald-400 text-xs font-mono font-semibold">
                              +${potentialPL}
                            </span>
                          )}
                          {potentialPL < 0 && (
                            <span className="text-red-400 text-xs font-mono font-semibold">
                              -${Math.abs(potentialPL)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700/30">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-zinc-500 text-xs">Exposure: ${exposure.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500">
                        <span className="text-xs">{isExpanded ? "Less" : "More"}</span>
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-zinc-700/30">
                      <div className="bg-zinc-800/50 rounded-lg p-3 mt-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-zinc-500 mb-1">Bet ID</p>
                            <p className="text-white font-mono">#{position.id}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 mb-1">Potential Payout</p>
                            <p className="text-green-400 font-mono font-semibold">
                              ${(position.potential_payout || 0).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500 mb-1">Remaining</p>
                            <p className="text-yellow-400 font-mono">
                              ${(position.remaining_amount || 0).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500 mb-1">Matched</p>
                            <p className="text-blue-400 font-mono">
                              ${(position.matched_amount || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {position.created_at && (
                          <p className="text-zinc-600 text-xs mt-3 pt-3 border-t border-zinc-700/30">
                            Placed: {new Date(position.created_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}