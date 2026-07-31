# Security & Integrity Design

This document details the security model, cryptographic protocols, and data protection policies implemented in the Brainwave x402 platform.

---

## 1. Cryptographic Challenge Verification (EIP-191)

To verify payments without centralized login credentials, we use Web3 signature verification.

### 1.1 Personal Sign Message Standard
The message signed by players uses the standard Ethereum prefix `\x19Ethereum Signed Message:\n` combined with the character length of the payload, preventing phishing attacks.
The message contains:
*   **Request ID**: Mapped to a single DB record to prevent reuse.
*   **Merchant Address**: Ensures funds are routed to the developer's registered wallet.
*   **Amount + Token**: Verifies consent for the specified billing rate (e.g. `0.0100 USDC`).
*   **Chain ID**: Restricts signatures to a single network (Base Sepolia `84532`).
*   **Nonce**: High-entropy 32-byte string.

### 1.2 Nonce Replay Protection
*   Every challenge payload includes a unique random cryptographic nonce.
*   Upon receipt of the signature, the server checks the `spent_nonces` table.
*   If a nonce exists, the request is immediately aborted with a `Signature replay error`.
*   If valid, the nonce is saved to prevent any subsequent reuse of the same signature.

---

## 2. API Key Management & Hashing

*   Game clients authenticate requests using a custom bearer token (e.g., `dnd_...`).
*   **One-Way Hashing**: The API key is hashed using **SHA-256** before database storage.
*   Incoming keys are hashed at the API edge and compared using a strict query comparison. If a developer database is leaked, the attacker cannot recover the API keys.
*   **Revocation**: Keys can be instantly disabled from the dashboard by setting `isActive` to `false` in the database.

---

## 3. On-chain Transaction Verification

*   The transaction hash (`txHash`) provided by the client is verified against the Base Sepolia RPC endpoint (`https://sepolia.base.org`).
*   **Receipt Verification**:
    ```typescript
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      throw new Error("Transaction reverted or is pending");
    }
    ```
*   Ensures that only successfully finalized blockchain blocks can unlock LLM dialogue generations.
*   *Note*: A local fallback operates during test runs if a mock prefix is provided (e.g., `mock_tx_...`).

---

## 4. Environment Variables & API Safety

*   **Server-Only Execution**: The OpenAI/Nvidia/Gemini API keys are never exposed to the frontend or embedded inside game clients.
*   **Client Boundary**: Game clients only talk to `/api/generate-dialogue`, which acts as an authentication proxy protecting underlying AI keys.
*   **JSON-RPC Endpoints**: The RPC provider endpoints are kept secret, avoiding denial-of-service vector vulnerabilities on public node infrastructure.
