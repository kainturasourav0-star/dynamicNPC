"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWallet, SUPPORTED_NETWORKS } from "@/context/WalletContext";
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  Check, 
  ExternalLink, 
  LogOut, 
  Sparkles, 
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";

export function WalletConnectButton({ className = "" }: { className?: string }) {
  const {
    address,
    chainId,
    networkName,
    balance,
    walletType,
    isConnected,
    isConnecting,
    error,
    connectBrowserWallet,
    connectSimulatedWallet,
    disconnectWallet,
    switchNetwork,
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowNetworkMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const explorerUrl = address && SUPPORTED_NETWORKS[chainId]
    ? `${SUPPORTED_NETWORKS[chainId].blockExplorer}/address/${address}`
    : "#";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      {!isConnected ? (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isConnecting}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-400 border border-cyan-500/40 hover:border-cyan-400 rounded-none text-xs font-mono font-bold tracking-wider uppercase transition shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95"
          >
            <Wallet className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0c0c0c] border border-cyan-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 p-3 fade-in-slide">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 px-1 font-bold">
                Select Wallet Provider
              </div>

              {error && (
                <div className="mb-2 p-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-mono">
                  {error}
                </div>
              )}

              <button
                onClick={async () => {
                  await connectBrowserWallet();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 mb-1.5 bg-[#141414] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/50 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-none bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    🦊
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-400">
                      Browser Wallet
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      MetaMask, Coinbase, Brave
                    </div>
                  </div>
                </div>
                <Zap className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => {
                  connectSimulatedWallet();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 bg-[#141414] hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/50 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-none bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono text-xs font-black">
                    ⚡
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-200 group-hover:text-blue-400">
                      Simulated Wallet
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Instant ephemeral key (Zero setup)
                    </div>
                  </div>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#0e131f] border border-cyan-500/40 hover:border-cyan-400 text-xs font-mono text-slate-200 transition shadow-[0_0_12px_rgba(6,182,212,0.1)] hover:shadow-[0_0_18px_rgba(6,182,212,0.25)]"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-cyan-400 font-bold tracking-tight">
                {truncatedAddress}
              </span>
              {balance && (
                <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-slate-400 px-1.5 py-0.5">
                  {balance} ETH
                </span>
              )}
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0c0c0c] border border-cyan-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.9)] z-50 p-3 fade-in-slide">
              {/* Account Info Header */}
              <div className="p-2.5 bg-[#141414] border border-white/5 mb-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{walletType === "browser" ? "Browser Wallet" : "Simulated Key"}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 border border-cyan-500/20">
                    {networkName}
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-100 break-all">
                  {address}
                </div>
                {balance && (
                  <div className="text-[11px] font-mono text-emerald-400 mt-1 font-semibold">
                    Balance: {balance} ETH
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-1">
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-mono text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 border border-transparent hover:border-cyan-500/20 transition"
                >
                  <span className="flex items-center gap-2">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Address Copied!" : "Copy Address"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">EIP-55</span>
                </button>

                {/* Network Switch Button / Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowNetworkMenu(!showNetworkMenu)}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-mono text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 border border-transparent hover:border-blue-500/20 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" />
                      Switch Network
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold">{networkName}</span>
                  </button>

                  {showNetworkMenu && (
                    <div className="mt-1 p-1 bg-[#161616] border border-white/10 space-y-1">
                      {Object.values(SUPPORTED_NETWORKS).map((net) => (
                        <button
                          key={net.chainId}
                          onClick={async () => {
                            await switchNetwork(net.chainId);
                            setShowNetworkMenu(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 text-xs font-mono flex items-center justify-between ${
                            chainId === net.chainId
                              ? "bg-cyan-500/20 text-cyan-300 font-bold"
                              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                          }`}
                        >
                          <span>{net.name}</span>
                          <span className="text-[10px] text-slate-500">{net.chainId}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {walletType === "browser" && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-mono text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 border border-transparent hover:border-cyan-500/20 transition"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View on Explorer
                    </span>
                  </a>
                )}

                <div className="border-t border-white/10 pt-1 mt-1">
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-mono text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
