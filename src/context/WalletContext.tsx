"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

export interface NetworkConfig {
  chainId: number;
  name: string;
  hexChainId: string;
  rpcUrl: string;
  blockExplorer: string;
  symbol: string;
}

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  84532: {
    chainId: 84532,
    name: "Base Sepolia",
    hexChainId: "0x14a34",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    symbol: "ETH",
  },
  8453: {
    chainId: 8453,
    name: "Base Mainnet",
    hexChainId: "0x2105",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    symbol: "ETH",
  },
  11155111: {
    chainId: 11155111,
    name: "Sepolia",
    hexChainId: "0xaa36a7",
    rpcUrl: "https://rpc.sepolia.org",
    blockExplorer: "https://sepolia.etherscan.io",
    symbol: "ETH",
  },
};

interface WalletContextType {
  address: string | null;
  chainId: number;
  networkName: string;
  balance: string | null;
  walletType: "browser" | "simulated" | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectBrowserWallet: () => Promise<void>;
  connectSimulatedWallet: () => void;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<boolean>;
  signMessage: (message: string) => Promise<string>;
  getSigner: () => Promise<ethers.Signer | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(84532);
  const [balance, setBalance] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<"browser" | "simulated" | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulatedWallet, setSimulatedWallet] = useState<ethers.HDNodeWallet | null>(null);

  // Helper to fetch ETH balance
  const updateBalance = useCallback(async (addr: string, currentChain: number) => {
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const bal = await provider.getBalance(addr);
        setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
      } else {
        setBalance("1.2500");
      }
    } catch {
      setBalance("1.0000");
    }
  }, []);

  // Connect via Browser Extension (MetaMask, Coinbase, etc.)
  const connectBrowserWallet = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("No Web3 browser wallet detected (e.g. MetaMask). You can use Simulated Wallet.");
      setIsConnecting(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found in wallet");
      }

      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      const primaryAddress = accounts[0];

      setAddress(primaryAddress);
      setChainId(currentChainId);
      setWalletType("browser");
      if (typeof window !== "undefined") {
        localStorage.setItem("npc402_wallet_pref", "browser");
      }

      await updateBalance(primaryAddress, currentChainId);
    } catch (err: any) {
      console.error("[WalletConnect Error]", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [updateBalance]);

  // Connect via Ephemeral Simulated Wallet (for demoing without extension)
  const connectSimulatedWallet = useCallback(() => {
    setError(null);
    let wallet = simulatedWallet;
    if (!wallet) {
      wallet = ethers.Wallet.createRandom();
      setSimulatedWallet(wallet);
    }
    setAddress(wallet.address);
    setChainId(84532);
    setWalletType("simulated");
    setBalance("5.0000");
    if (typeof window !== "undefined") {
      localStorage.setItem("npc402_wallet_pref", "simulated");
    }
  }, [simulatedWallet]);

  // Disconnect
  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setWalletType(null);
    setBalance(null);
    setError(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("npc402_wallet_pref");
    }
  }, []);

  // Switch Chain
  const switchNetwork = useCallback(async (targetChainId: number): Promise<boolean> => {
    if (walletType === "simulated") {
      setChainId(targetChainId);
      return true;
    }

    if (typeof window === "undefined" || !(window as any).ethereum) {
      setChainId(targetChainId);
      return true;
    }

    const netConfig = SUPPORTED_NETWORKS[targetChainId];
    if (!netConfig) return false;

    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: netConfig.hexChainId }],
      });
      setChainId(targetChainId);
      return true;
    } catch (switchError: any) {
      // 4902 code means network is not added to user's wallet
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: netConfig.hexChainId,
                chainName: netConfig.name,
                rpcUrls: [netConfig.rpcUrl],
                nativeCurrency: { name: netConfig.symbol, symbol: netConfig.symbol, decimals: 18 },
                blockExplorerUrls: [netConfig.blockExplorer],
              },
            ],
          });
          setChainId(targetChainId);
          return true;
        } catch (addError) {
          console.error("Failed to add network:", addError);
          return false;
        }
      }
      console.error("Failed to switch network:", switchError);
      return false;
    }
  }, [walletType]);

  // Get Signer
  const getSigner = useCallback(async (): Promise<ethers.Signer | null> => {
    if (walletType === "browser" && typeof window !== "undefined" && (window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      return await provider.getSigner();
    }
    if (walletType === "simulated" && simulatedWallet) {
      return simulatedWallet;
    }
    return null;
  }, [walletType, simulatedWallet]);

  // Sign challenge message directly
  const signMessage = useCallback(async (message: string): Promise<string> => {
    const signer = await getSigner();
    if (!signer) {
      throw new Error("No wallet connected to sign message");
    }
    return await signer.signMessage(message);
  }, [getSigner]);

  // Auto-reconnect on mount if previously connected
  useEffect(() => {
    if (typeof window === "undefined") return;

    const pref = localStorage.getItem("npc402_wallet_pref");
    if (pref === "browser" && (window as any).ethereum) {
      connectBrowserWallet();
    } else if (pref === "simulated") {
      connectSimulatedWallet();
    }

    // Listen to account and chain change events
    if ((window as any).ethereum?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setWalletType("browser");
          if (address) updateBalance(accounts[0], chainId);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = (hexChainId: string) => {
        const parsed = parseInt(hexChainId, 16);
        setChainId(parsed);
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if ((window as any).ethereum?.removeListener) {
          (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
          (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [connectBrowserWallet, connectSimulatedWallet, disconnectWallet, updateBalance, address, chainId]);

  const networkName = SUPPORTED_NETWORKS[chainId]?.name || `Chain ${chainId}`;

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        networkName,
        balance,
        walletType,
        isConnected: Boolean(address),
        isConnecting,
        error,
        connectBrowserWallet,
        connectSimulatedWallet,
        disconnectWallet,
        switchNetwork,
        signMessage,
        getSigner,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
