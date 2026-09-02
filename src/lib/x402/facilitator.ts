import { ethers } from "ethers";
import { env } from "@/lib/env";

export interface PaymentChallenge {
  merchantAddress: string;
  amount: string;
  token: string;
  chainId: number;
  nonce: string;
  requestId: string;
  timestamp: number;
}

export interface VerificationResult {
  valid: boolean;
  recoveredAddress?: string;
  error?: string;
}

/**
 * Creates a standard x402 HTTP Payment Required Challenge
 */
export function createPaymentChallenge({
  amount,
  requestId,
  token = "USDC",
  chainId,
}: {
  amount: string;
  requestId: string;
  token?: string;
  chainId?: number;
}): PaymentChallenge {
  return {
    merchantAddress: env.MERCHANT_ADDRESS,
    amount,
    token,
    chainId: chainId || env.CHAIN_ID,
    nonce: "x402_" + ethers.hexlify(ethers.randomBytes(16)).substring(2),
    requestId,
    timestamp: Date.now(),
  };
}

/**
 * Formats challenge message for EIP-191 Personal Sign
 */
export function formatChallengeMessage(challenge: PaymentChallenge): string {
  return `Pay ${challenge.amount} ${challenge.token} to ${challenge.merchantAddress} on chain ${challenge.chainId} (Request ID: ${challenge.requestId}, Nonce: ${challenge.nonce})`;
}

/**
 * Verifies that the EIP-191 signature was signed by a valid Ethereum key matching the expected message.
 */
export function verifyPaymentSignature(
  message: string,
  signature: string
): VerificationResult {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (!recoveredAddress || !ethers.isAddress(recoveredAddress)) {
      return { valid: false, error: "Recovered address is invalid" };
    }
    return { valid: true, recoveredAddress };
  } catch (err: any) {
    return { valid: false, error: err.message || "Cryptographic signature verification failed" };
  }
}
