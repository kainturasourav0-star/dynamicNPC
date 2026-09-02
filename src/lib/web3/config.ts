import { http, createConfig } from "wagmi";
import { baseSepolia, mainnet, base } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

/**
 * Wagmi & Viem Web3 Provider Configuration
 * Connects to Base Sepolia (84532) for testnet x402 micropayments, and Base / Ethereum Mainnet.
 */
export const wagmiConfig = createConfig({
  chains: [baseSepolia, base, mainnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f168fa7d3f",
      showQrModal: true,
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});
