import { useEffect, useState, useRef } from "react";

export default function OddsCard({
  title,
  odds,
  onClick,
  change = "stable",
  showLive = false,
  marketDepth = null,
  showDecimal = false
}) {
  const [flashClass, setFlashClass] = useState("");
  const prevOddsRef = useRef(odds);
  const flashTimeoutRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (change !== "stable") {
      setFlashClass(change === "up" ? "ring-2 ring-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.4)]" : "ring-2 ring-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)]");
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => setFlashClass(""), 600);
    }
    prevOddsRef.current = odds;
  }, [odds, change]);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  const displayOdds = showDecimal ? odds : (odds * 100).toFixed(1);
  const displaySuffix = showDecimal ? "" : "%";
  const decimalOdds = showDecimal ? odds : (1 / odds).toFixed(2);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:-translate-y-0.5 ${onClick ? "hover:bg-zinc-800/80" : ""} ${flashClass}`}
      style={{ transition: "box-shadow 0.3s ease, transform 0.3s ease, ring-color 0.3s ease" }}
    >
      {change !== "stable" && (
        <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
          change === "up" ? "bg-green-500 text-black" : "bg-red-500 text-white"
        }`}>
          <span>{change === "up" ? "↑" : "↓"}</span>
          <span>{Math.abs((odds - prevOddsRef.current) * 100).toFixed(1)}%</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-400 text-sm uppercase tracking-wider font-semibold">{title}</span>
        {showLive && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-xs font-bold">LIVE</span>
          </div>
        )}
      </div>

      <div className={`text-4xl font-bold tracking-tight transition-all duration-300 ${
        change === "up" ? "text-green-400 scale-[1.03]" : change === "down" ? "text-red-400 scale-[0.97]" : "text-green-400"
      }`}>
        {displayOdds}{displaySuffix}
      </div>

      {showDecimal && (
        <div className="text-zinc-500 text-sm mt-1 font-mono">
          Decimal: {decimalOdds}
        </div>
      )}

      {marketDepth && (
        <div className="mt-3 pt-3 border-t border-zinc-700/50">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-zinc-500">Back Depth</span>
            <span className="text-green-400 font-mono">{marketDepth.backDepth || 0}%</span>
          </div>
          <div className="h-1.5 bg-zinc-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${marketDepth.backDepth || 0}%` }}
            />
          </div>
        </div>
      )}

      {showLive && (
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-center">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/30 to-transparent animate-pulse rounded-full" />
        </div>
      )}
    </div>
  );
}