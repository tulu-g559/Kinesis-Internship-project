import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import useWalletStore from "../store/walletStore";
import API from "../api/axios";

export default function WalletConnect() {
  const { address, isConnected, chainId } = useAccount();
  const { setWallet, clearWallet } = useWalletStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      setWallet(address, chainId);
      setIsModalOpen(false);

      API.post("/wallet/connect", {
        wallet_address: address,
        chain_id: chainId,
      })
        .then((res) => {
          console.log("Wallet synced to backend:", res.data);
        })
        .catch((err) => {
          console.error("Failed to sync wallet:", err);
        });
    } else if (!isConnected) {
      clearWallet();
    }
  }, [isConnected, address, chainId, setWallet, clearWallet]);

  return (
    <div className="relative">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {!connected ? (
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    openConnectModal();
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center gap-2 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-20 transition-opacity" />
                  <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="relative z-10">Connect Wallet</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {chain?.id !== 11155111 && (
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                        openChainModal();
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-colors border border-red-500/50 animate-pulse"
                    >
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                      Wrong Network
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      openAccountModal();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/50 rounded-xl transition-all font-medium"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">
                        {account.addressSlice?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-white text-sm font-bold">
                        {account.displayName}
                      </span>
                      {account.displayBalance && (
                        <span className="text-emerald-400 text-xs">
                          {account.displayBalance}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>

      {/* Overlay backdrop for modal visibility */}
      <style jsx>{`
        :global(.rainbowkit-modal-content) {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
        }

        :global(.rainbowkit-modal-heading) {
          color: #fff !important;
          font-weight: 700 !important;
          font-size: 1.5rem !important;
        }

        :global(.rainbowkit-wallet-option) {
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
          background: rgba(0, 0, 0, 0.4) !important;
          border-radius: 0.75rem !important;
          transition: all 0.3s ease !important;
        }

        :global(.rainbowkit-wallet-option:hover) {
          background: rgba(16, 185, 129, 0.1) !important;
          border-color: rgba(16, 185, 129, 0.5) !important;
          transform: translateY(-2px) !important;
        }

        :global(.rainbowkit-wallet-option:active) {
          background: rgba(16, 185, 129, 0.15) !important;
        }

        :global(.rainbowkit-chain-option) {
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
          background: rgba(0, 0, 0, 0.4) !important;
          border-radius: 0.75rem !important;
        }

        :global(.rainbowkit-chain-option:hover) {
          background: rgba(16, 185, 129, 0.1) !important;
          border-color: rgba(16, 185, 129, 0.5) !important;
        }

        :global(.rainbowkit-modal-close-button) {
          background: rgba(16, 185, 129, 0.2) !important;
          border: none !important;
          color: #10b981 !important;
          border-radius: 0.5rem !important;
          width: 2rem !important;
          height: 2rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }

        :global(.rainbowkit-modal-close-button:hover) {
          background: rgba(16, 185, 129, 0.3) !important;
        }
      `}</style>
    </div>
  );
}