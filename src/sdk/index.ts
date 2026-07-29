import { ethers } from "ethers";

export async function fetchNPCDialogue(
  endpoint: string,
  apiKey: string,
  npcId: string,
  context: string,
  wallet: ethers.Signer
) {
  const initialRes = await fetch(`${endpoint}/api/generate-dialogue`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ npcId, context }),
  });

  if (initialRes.status === 402) {
    const data = await initialRes.json();
    const challenge = data.challenge;
    
    // Construct EIP-191 personal_sign message standard
    const messageToSign = `x402 Payment Challenge\nRequest: ${challenge.requestId}\nAmount: ${challenge.amount} ${challenge.token}\nMerchant: ${challenge.merchantAddress}\nChain ID: ${challenge.chainId}\nNonce: ${challenge.nonce}`;
    
    // Request wallet signature
    const signature = await wallet.signMessage(messageToSign);

    // Re-submit with payment verification
    const settleRes = await fetch(`${endpoint}/api/generate-dialogue`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        npcId,
        requestId: challenge.requestId,
        signature,
        transactionHash: "mock_tx_" + ethers.hexlify(ethers.randomBytes(32)).substring(2)
      }),
    });

    return await settleRes.json();
  }

  return await initialRes.json();
}
