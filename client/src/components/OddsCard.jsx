import { useState, useEffect, useRef } from "react";

export default function OddsCard({
  title,
  odds,
  onClick,
  showLive = false
}) {
  const [displayOdds, setDisplayOdds] = useState(odds);
  const [flashClass, setFlashClass] = useState("");
  const prevOddsRef = useRef(odds);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!showLive) return;
    intervalRef.current = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.06;
      const newOdds = Math.max(0.01, Math.min(0.99, displayOdds + change));
      const diff = newOdds - prevOddsRef.current;
      setFlashClass(diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "");
      setDisplayOdds(newOdds);
      setTimeout(() => setFlashClass(""), 500);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(intervalRef.current);
  }, [displayOdds, showLive]);

  useEffect(() => {
    prevOddsRef.current = odds;
    setDisplayOdds(odds);
  }, [odds]);

  const percentage = (displayOdds * 100).toFixed(1);

  return (
    <div
      onClick={onClick}
      className={`bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] ${onClick ? "hover:bg-zinc-800/80" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-400 text-sm uppercase tracking-wider">{title}</span>
        {showLive && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
      </div>
      <div className={`text-4xl font-bold transition-colors duration-300 ${flashClass || "text-green-400"}`}>
        {percentage}%
      </div>
      {showLive && (
        <div className="text-zinc-600 text-xs mt-1">
          Simulated live odds
        </div>
      )}
    </div>
  );
}