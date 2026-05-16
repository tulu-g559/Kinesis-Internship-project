import { useEffect, useState, useRef } from "react";
import socket from "../socket";

const fakeActivities = [
  { trader: "CryptoKing_99", action: "backed", outcome: "YES", odds: 2.4, type: "bet" },
  { trader: "MarketMaker_X", action: "laid", outcome: "NO", odds: 1.85, type: "bet" },
  { trader: "TraderBot_72", action: "backed", outcome: "Over 2.5", odds: 1.95, type: "odds_change" },
  { trader: "Emma_W", action: "backed", outcome: "YES", odds: 2.35, type: "bet" },
  { trader: "AlgoTrader", action: "laid", outcome: "Under 1.5", odds: 2.1, type: "odds_change" },
  { trader: "Alex_M", action: "backed", outcome: "NO", odds: 1.9, type: "bet" },
  { trader: "SmartMoney", action: "laid", outcome: "YES", odds: 2.5, type: "bet" },
  { trader: "WhaleWatcher", action: "backed", outcome: "Over 3.5", odds: 1.75, type: "odds_change" },
  { trader: "QuantAlpha", action: "laid", outcome: "NO", odds: 1.88, type: "bet" },
  { trader: "Sofia_B", action: "backed", outcome: "YES", odds: 2.42, type: "bet" },
  { trader: "HighRoller_99", action: "backed", outcome: "Under 2.5", odds: 2.15, type: "bet" },
  { trader: "BetaTrader", action: "laid", outcome: "Over 1.5", odds: 1.95, type: "bet" }
];

export default function LiveActivityTicker() {
  const [activities, setActivities] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const initialActivity = fakeActivities.slice(0, 4).map((a, i) => ({
      ...a,
      id: Date.now() + i,
      timestamp: new Date(Date.now() - i * 12000).toISOString()
    }));
    setActivities(initialActivity);

    const interval = setInterval(() => {
      if (isPaused) return;
      const randomActivity = fakeActivities[Math.floor(Math.random() * fakeActivities.length)];
      const newActivity = {
        ...randomActivity,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 15));
    }, 2500 + Math.random() * 3000);

    socket.on("live_activity", (data) => {
      const activity = {
        trader: data.trader,
        action: data.action,
        outcome: data.outcome,
        odds: data.odds,
        type: data.type,
        id: Date.now(),
        timestamp: data.timestamp
      };
      setActivities(prev => [activity, ...prev].slice(0, 15));
    });

    socket.on("bet_matched", (data) => {
      const activity = {
        trader: "System",
        action: "matched",
        outcome: `Bet #${data.bet_id}`,
        odds: "-",
        type: "matched",
        id: Date.now(),
        timestamp: data.timestamp
      };
      setActivities(prev => [activity, ...prev].slice(0, 15));
    });

    return () => {
      clearInterval(interval);
      socket.off("live_activity");
      socket.off("bet_matched");
    };
  }, [isPaused]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const getActionColor = (action) => {
    switch (action) {
      case "backed": return "text-green-400";
      case "laid": return "text-red-400";
      case "matched": return "text-blue-400";
      default: return "text-zinc-400";
    }
  };

  const getBorderColor = (action) => {
    switch (action) {
      case "backed": return "border-green-500/30";
      case "laid": return "border-red-500/30";
      case "matched": return "border-blue-500/30";
      default: return "border-zinc-700/30";
    }
  };

  const getBgColor = (action) => {
    switch (action) {
      case "backed": return "bg-green-500/10";
      case "laid": return "bg-red-500/10";
      case "matched": return "bg-blue-500/10";
      default: return "bg-zinc-800/40";
    }
  };

  return (
    <div className="mb-4 bg-zinc-900/80 border border-zinc-800/60 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-zinc-800/60 to-zinc-900/60 border-b border-zinc-700/50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-zinc-300 text-xs font-bold uppercase tracking-wider">Live Activity</span>
          <span className="text-zinc-600 text-xs">|</span>
          <span className="text-zinc-500 text-xs">{activities.length} events</span>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
        >
          {isPaused ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.574z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 py-3 min-w-max">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${getBgColor(activity.action)} ${getBorderColor(activity.action)} text-xs whitespace-nowrap transition-all hover:scale-[1.02] ${
                index === 0 ? "animate-[fadeSlideIn_0.4s_ease-out]" : ""
              }`}
            >
              <span className="text-zinc-500 font-mono text-[10px]">{formatTime(activity.timestamp)}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span className="text-white font-semibold max-w-[100px] truncate">{activity.trader}</span>
              <span className={`${getActionColor(activity.action)} font-bold uppercase text-[10px]`}>
                {activity.action}
              </span>
              <span className="text-zinc-300 max-w-[80px] truncate">{activity.outcome}</span>
              {activity.odds !== "-" && (
                <>
                  <span className="text-zinc-600">@</span>
                  <span className="text-yellow-400 font-mono font-bold">{typeof activity.odds === 'number' ? activity.odds.toFixed(2) : activity.odds}</span>
                </>
              )}
            </div>
          ))}
          {activities.length === 0 && (
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <div className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" />
              <span>Waiting for market activity...</span>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}