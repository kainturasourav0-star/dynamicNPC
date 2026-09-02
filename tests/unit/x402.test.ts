import { describe, it, expect } from "vitest";
import { ethers } from "ethers";
import { 
  createPaymentChallenge, 
  formatChallengeMessage, 
  verifyPaymentSignature 
} from "@/lib/x402/facilitator";

describe("x402 Micropayments Protocol Facilitator", () => {
  it("should create a valid payment challenge with unique nonce", () => {
    const challenge = createPaymentChallenge({
      amount: "0.0100",
      requestId: "req_test_123",
    });

    expect(challenge.amount).toBe("0.0100");
    expect(challenge.requestId).toBe("req_test_123");
    expect(challenge.nonce).toContain("x402_");
    expect(challenge.merchantAddress).toBeDefined();
  });

  it("should format challenge message correctly for EIP-191 signing", () => {
    const challenge = createPaymentChallenge({
      amount: "0.0500",
      requestId: "req_test_456",
    });
    const message = formatChallengeMessage(challenge);

    expect(message).toContain("Pay 0.0500 USDC");
    expect(message).toContain("req_test_456");
  });

  it("should successfully verify a signed challenge from a valid Ethereum wallet", async () => {
    const wallet = ethers.Wallet.createRandom();
    const challenge = createPaymentChallenge({
      amount: "0.0100",
      requestId: "req_verify_789",
    });
    const message = formatChallengeMessage(challenge);
    const signature = await wallet.signMessage(message);

    const verification = verifyPaymentSignature(message, signature);

    expect(verification.valid).toBe(true);
    expect(verification.recoveredAddress?.toLowerCase()).toBe(wallet.address.toLowerCase());
  });

  it("should reject an invalid signature", () => {
    const message = "Some altered message";
    const fakeSignature = "0x" + "00".repeat(65);

    const verification = verifyPaymentSignature(message, fakeSignature);
    expect(verification.valid).toBe(false);
  });
});
