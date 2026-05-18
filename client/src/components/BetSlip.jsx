import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import useWalletStore from "../store/walletStore";
import { useAccount } from "wagmi";

const QUICK_STAKES = [10, 25, 50, 100, 250, 500];

export default function BetSlip({ marketId, selectedOutcome, onBetPlaced }) {
  const [side, setSide] = useState("BACK");
  const [stake, setStake] = useState("");
  const [odds, setOdds] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const prevOutcomeRef = useRef(null);

  const { isConnected } = useAccount();
  const walletAddress = useWalletStore((state) => state.walletAddress);

  useEffect(() => {
    if (selectedOutcome) {
      if (prevOutcomeRef.current?.id !== selectedOutcome.id) {
        setOdds(selectedOutcome.odds ? (1 / selectedOutcome.odds).toFixed(2) : "");
      }
      prevOutcomeRef.current = selectedOutcome;
    }
  }, [selectedOutcome]);

  const decimalOdds = odds ? parseFloat(odds) : 0;
  const stakeValue = stake ? parseFloat(stake) : 0;

  const potentialWinnings = side === "BACK"
    ? (stakeValue * decimalOdds).toFixed(2)
    : (stakeValue / decimalOdds).toFixed(2);

  const potentialLoss = side === "BACK"
    ? stakeValue.toFixed(2)
    : (stakeValue * (decimalOdds - 1)).toFixed(2);

  const handleQuickStake = (amount) => {
    setStake(amount.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isConnected || !walletAddress) {
      setError("Please connect your wallet before placing bets");
      return;
    }

    if (!selectedOutcome) {
      setError("Please select an outcome");
      return;
    }

    if (!stake || parseFloat(stake) <= 0) {
      setError("Please enter a valid stake");
      return;
    }

    if (!odds || parseFloat(odds) < 1.01) {
      setError("Odds must be at least 1.01");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/bets/place", {
        market_id: parseInt(marketId),
        outcome_id: selectedOutcome.id,
        side,
        stake: parseFloat(stake),
        odds: parseFloat(odds),
        wallet_address: walletAddress
      });

      setSuccess(`Bet placed successfully! ${side === "BACK" ? "Backing" : "Laying"} ${selectedOutcome.title} @ ${odds}`);
      setShowSuccess(true);
      setStake("");
      setOdds("");

      setTimeout(() => setShowSuccess(false), 3000);
      onBetPlaced?.(res.data.bet);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to place bet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 px-5 py-4 border-b border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-bold text-white">Bet Slip</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-xs font-bold uppercase tracking-wider">LIVE</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSide("BACK")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
              side === "BACK"
                ? "bg-green-500 text-black shadow-[0_0_25px_rgba(34,197,94,0.5)] transform scale-[1.02]"
                : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              BACK
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSide("LAY")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
              side === "LAY"
                ? "bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] transform scale-[1.02]"
                : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              LAY
            </span>
          </button>
        </div>

        {selectedOutcome ? (
          <div className="bg-gradient-to-r from-zinc-800/60 to-zinc-800/40 rounded-xl p-4 mb-4 border border-zinc-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Selected Outcome</p>
                <p className="text-white font-bold text-lg">{selectedOutcome.title}</p>
              </div>
              <div className={`text-right px-3 py-1.5 rounded-lg ${
                side === "BACK" ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                <p className={`text-xs font-bold uppercase ${
                  side === "BACK" ? "text-green-400" : "text-red-400"
                }`}>{side}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-800/30 rounded-xl p-4 mb-4 border border-zinc-700/30 border-dashed">
            <p className="text-zinc-500 text-sm text-center">Select an outcome to place a bet</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2 font-semibold">
              Odds (Decimal)
            </label>
            <div className="relative">
              <input
                id="odds-input"
                type="number"
                step="0.01"
                min="1.01"
                value={odds}
                onChange={(e) => setOdds(e.target.value)}
                className={`w-full bg-zinc-800/80 border rounded-xl py-4 px-4 text-white font-mono text-xl font-bold focus:outline-none transition-all ${
                  side === "BACK"
                    ? "border-green-500/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    : "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                }`}
                placeholder="1.00"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setOdds((parseFloat(odds || 1) - 0.01).toFixed(2))}
                  className="w-8 h-8 bg-zinc-700/50 rounded-lg text-zinc-400 hover:bg-zinc-600 flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setOdds((parseFloat(odds || 1) + 0.01).toFixed(2))}
                  className="w-8 h-8 bg-zinc-700/50 rounded-lg text-zinc-400 hover:bg-zinc-600 flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2 font-semibold">
              Stake (GU)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-lg">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className={`w-full bg-zinc-800/80 border rounded-xl py-4 pl-10 pr-20 text-white font-mono text-xl font-bold focus:outline-none transition-all ${
                  side === "BACK"
                    ? "border-green-500/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    : "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                }`}
                placeholder="0.00"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">GU</span>
            </div>
            <div className="flex gap-2 mt-2">
              {QUICK_STAKES.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickStake(amount)}
                  className="flex-1 py-2 bg-zinc-800/50 hover:bg-zinc-700/70 rounded-lg text-zinc-400 hover:text-white text-xs font-mono font-semibold transition-all"
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {stakeValue > 0 && decimalOdds > 1 && (
            <div className="bg-gradient-to-r from-zinc-800/60 to-zinc-900/80 rounded-xl p-4 border border-zinc-700/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Potential Winnings</span>
                <span className={`font-mono font-bold text-xl ${
                  side === "BACK" ? "text-green-400" : "text-red-400"
                }`}>
                  ${potentialWinnings}
                </span>
              </div>
              <div className="h-px bg-zinc-700/50" />
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">
                  {side === "BACK" ? "Stake" : "Liability"}
                </span>
                <span className="text-white font-mono font-bold">${potentialLoss}</span>
              </div>
              {side === "LAY" && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Liability</span>
                  <span className="text-red-400 font-mono font-bold">${potentialLoss}</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm font-semibold">{error}</p>
              </div>
            </div>
          )}

          {showSuccess && success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-400 text-sm font-semibold">{success}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedOutcome || !isConnected}
            className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              side === "BACK"
                ? "bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]"
                : "bg-gradient-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-300 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.5)]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Placing Bet...
              </span>
            ) : !isConnected ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Connect Wallet to Bet
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Place {side} Bet
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}