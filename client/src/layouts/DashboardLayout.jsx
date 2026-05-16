import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import socket from "../socket";

export default function DashboardLayout({ children }) {
  const [globalStats, setGlobalStats] = useState({
    tradersOnline: 0,
    totalVolume: 0,
    activeMarkets: 0
  });

  useEffect(() => {
    const updateStats = () => {
      setGlobalStats(prev => ({
        tradersOnline: prev.tradersOnline + Math.floor(Math.random() * 10) - 5,
        totalVolume: prev.totalVolume + Math.random() * 5000,
        activeMarkets: prev.activeMarkets
      }));
    };

    setGlobalStats({
      tradersOnline: Math.floor(Math.random() * 100) + 50,
      totalVolume: Math.floor(Math.random() * 100000) + 50000,
      activeMarkets: Math.floor(Math.random() * 10) + 5
    });

    const interval = setInterval(updateStats, 5000);

    socket.on("live_activity", () => {
      setGlobalStats(prev => ({
        ...prev,
        tradersOnline: prev.tradersOnline + Math.floor(Math.random() * 3) - 1,
        totalVolume: prev.totalVolume + Math.random() * 2000
      }));
    });

    return () => {
      clearInterval(interval);
      socket.off("live_activity");
    };
  }, []);

  return (
    <div className="flex bg-black text-white min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="bg-zinc-900/60 border-b border-zinc-800/60 px-6 py-2">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 font-bold">{globalStats.tradersOnline}</span>
                <span className="text-zinc-500">traders online</span>
              </div>
              <div className="h-3 w-px bg-zinc-700" />
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Platform Volume</span>
                <span className="text-white font-mono font-semibold">
                  ${globalStats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="h-3 w-px bg-zinc-700" />
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Active Markets</span>
                <span className="text-white font-semibold">{globalStats.activeMarkets}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Powered by</span>
              <span className="text-xs font-bold text-green-400">AGON</span>
            </div>
          </div>
        </div>

        <Navbar />

        <div className="p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}