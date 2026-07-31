# Product Requirements Document (PRD)

## 1. Product Vision
Brainwave x402 is a Dynamic NPC Dialogue Platform that allows game developers to integrate rich, context-aware AI characters into their games with pay-per-call blockchain billing. By using the `x402` micropayment standard, players pay fractions of a cent ($0.01 USD equivalent in USDC) per dialogue turn directly from their Web3 wallets, covering the developer's AI inference costs in real-time.

---

## 2. User Personas

### 2.1 Game Developers
*   **Needs**: Simple APIs to fetch NPC dialogue options, a central dashboard to configure characters and keys, and a way to offload LLM costs to players.
*   **Actions**: Registers on the platform, creates a project, configures NPC backstory/tone/style, registers API keys, and tracks billing logs.

### 2.2 Players (Gamers)
*   **Needs**: Immersive, non-repetitive dialogue with NPCs that responds dynamically to player state and context.
*   **Actions**: Connects a Web3 wallet (MetaMask, Unity Wallet, etc.), signs cryptographic payment challenges, and completes micro-transactions to unlock NPC speech.

---

## 3. Functional Requirements

### 3.1 Developer Console & Dashboard
*   **Authentication**: Password-based login with auto-registration on first sign-in (hackathon mode).
*   **Project Management**: Support for creating and switching between multiple game projects.
*   **NPC Dialogue Profiles**:
    *   Create, Read, Update, and Delete NPC configurations.
    *   Fields required: `Name`, `Backstory`, `Tone` (e.g. Friendly, Hostile, Sarcastic), `Speaking Style` (optional), and `Safety Rules` (optional).
*   **API Key Management**: Generate and revoke API keys used by game clients to authenticate. Hashed values are stored in the database for security.
*   **Billing Logs**: Display historic dialogue requests, billing statuses (`CHALLENGE_ISSUED`, `PAID_COMPLETED`, `FAILED`), costs, and transaction hashes.

### 3.2 Dynamic NPC Dialogue API (`/api/generate-dialogue`)
*   **Authentication**: Requires a valid, active API key passed as a `Bearer` token in the `Authorization` header.
*   **Micropayment Enforcement (x402 Protocol)**:
    *   **Phase 1 (Challenge)**: If a request does not contain a signature, the endpoint generates a unique request ID, creates an EIP-191 personal_sign payment challenge ($0.01 USDC cost), saves it in the database, and returns it with a `402 Payment Required` status code.
    *   **Phase 2 (Settlement)**: If the request contains a valid signature (recovering the payer's address) and an on-chain transaction hash, the endpoint processes the payment.
*   **AI Inference Fallback**: Triggers the NVIDIA NIM or Google Gemini model. If APIs are unavailable or keys are invalid, it falls back to a deterministic, context-based mock dialogue generator.
*   **Stateful Conversations**: Saves message history per player address and NPC to ensure subsequent calls maintain continuity.

---

## 4. Non-Functional Requirements

### 4.1 Latency
*   AI dialogue options should be returned in under 2.5 seconds during live game loops.
*   Fallback mock responses should return in under 200 milliseconds to avoid blocking gameplay.

### 4.2 Security & Integrity
*   **Replay Protection**: Nonces in payment challenges must be tracked in the `spent_nonces` table to prevent double-spending signatures.
*   **Hashed Secrets**: API keys must not be stored in plaintext. Hashing (SHA-256) must be performed immediately.
*   **Idempotency**: Requests linked to a `requestId` must not charge the player twice if re-sent due to network timeouts.
