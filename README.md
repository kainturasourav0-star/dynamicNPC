# x402 Protocol - Dynamic NPC Dialogue Platform

This application is a Web3-integrated pay-per-call AI Dialogue generation platform. It implements the **x402 Micropayment Protocol** which permits game clients to pay dynamic USDC micropayments (settled via cryptographic signatures) per AI dialogue turn.

---

## 🛰️ What Does This App Do?

Traditional games use static dialogue trees or bear high cloud LLM hosting costs. This platform resolves both by:
1. **Dynamic Dialogue Generation**: Routes player actions and backstory context through advanced LLM models (Gemini / Nvidia NeMo) to generate adaptive, stateful dialogue options in real-time.
2. **Cryptographic Micro-Billing (x402)**: Returns an `HTTP 402 Payment Required` challenge when a dialogue request is initiated. The game client must sign this challenge using an EIP-191 personal signature and settle the challenge (a mock USDC transfer representation) to recover the LLM output.
3. **Conversational Memory**: Stores dialogue Turn logs in the database to maintain context across multi-turn interactions.

---

## ⚡ How the Options and Customizations Work

The platform provides several developer tools, playgrounds, and configurable options:

### 1. Dynamic NPC Custom Pricing
*   **What it is**: Developers can configure unique USDC fee rates per dialogue turn on an NPC-by-NPC basis (e.g. `$0.0100` USDC for standard villager dialogue, or `$0.0500` USDC for rare quest givers).
*   **How it works**: Setting the price in the NPC Creator form stores the `cost` column in the database. When the game queries dialogue for that NPC, the x402 protocol returns a payment challenge matching the exact rate configured.

### 2. NPC Presets (Templates)
*   **What it is**: Auto-population options inside the Create NPC form.
*   **How it works**: Select templates like *Garrick the Bartender* or *Archmage Vaelathor* to pre-fill character backstory, tone constraints, speaking style, safety guidelines, and default billing fees automatically.

### 3. Dialogue Sandbox Configuration
*   **What it is**: An interactive test-bench playground (`/dashboard/sandbox`) to run dialogues step-by-step and inspect JSON payloads.
*   **Configurable Parameters**:
    *   **Chain Selection Dropdown**: Test cryptographic signatures across different test networks (Base Sepolia, Optimism Sepolia, Arbitrum Sepolia).
    *   **Stateful Prompt / Context**: Modify the narrative scenario dynamically.
    *   **Player Attributes**: Add mock player levels or items in JSON format (e.g. `{"level": 3, "gold": 120}`).
    *   **Reset History button**: Clears active dialogue history log records matching the selected NPC and player wallet to start Turn 1 anew.
    *   **Wallet toggle**: Swap between an on-page simulated signing wallet or connecting a live Web3 browser-extension wallet (e.g. MetaMask).

### 4. Interactive 2D RPG Simulator
*   **What it is**: A playable 2D game canvas inside the dashboard (`/dashboard/game`).
*   **How it works**: Walk a character using **WASD / Arrow keys** adjacent to custom NPCs and press **[SPACE]** to trigger the live x402 payment challenge and LLM settlement sequence.
*   *Note: A standalone copy is available at [testgame.html](testgame.html) which can be double-clicked and run directly in any browser.*

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure:
```env
# Optional Gemini/Nvidia API Keys
GEMINI_API_KEY=your_key_here
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the console.

### 4. Execute Tests
To run the automated sandbox integration tests:
```bash
npx tsx scratch/test-sandbox-api.ts
```
