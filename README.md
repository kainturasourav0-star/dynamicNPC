🎮 Dynamic NPC Dialogue — NPC-402

A pay-per-call AI dialogue engine for games, built on the x402 micropayment protocol.

🧠 Built For

Brainwave 2026 – X402 Blockchain Track — an international hackathon hosted on Devpost, organized by ACTS EDC, Delhi (July 3–31, 2026). The X402 Blockchain Track challenges builders to create real pay-per-call products using the complete x402 payment flow: Challenge → Sign → Retry → Settle.

NPC-402 fits the Gaming + AI API category — every NPC conversation is a metered, blockchain-settled transaction.

💡 What It Does

Traditional games use static, hand-written dialogue trees. NPC-402 replaces that with live AI-generated NPC responses. Every time a player talks to an NPC, the game calls an API, the AI generates a unique response in real time, and the developer pays $0.01 USDC for that single call — no subscriptions, no upfront costs.

⚡ How It Works

Every NPC conversation runs through three automatic steps:

1. Challenge
The game sends a request to /api/generate-dialogue. The server responds with HTTP 402 (Payment Required) containing a payment challenge — how much USDC is owed, to which wallet, on which chain.

2. Sign
The game client signs the challenge using the EIP-191 standard. This cryptographically authorizes the $0.01 charge without any actual transfer yet.

3. Settle & Generate
The signed request is sent back. The server verifies the signature, settles the USDC payment on-chain, calls the AI model (Google Gemini / Nvidia NIM), and returns the NPC's dialogue plus a transaction receipt.

⏱ Full round-trip: ~0.2 seconds

🖥️ Dashboard Features
Section	What It Does
NPC Profiles	Create NPCs with custom backstory, personality, tone, and per-NPC USDC pricing
Dialogue Sandbox	Test live dialogue calls with simulated or real wallet, inspect raw JSON payloads
Interactive Demo Game	Playable 2D RPG in the browser — walk up to NPCs and trigger real AI conversations
API Keys	Generate and manage authentication keys for your game client
Dialogue Logs	Full history of every call — responses, timestamps, payment receipts
Integrations & Docs	Code snippets for cURL, Node.js/TypeScript, and Unity C#
🔗 Live Demo

👉 dynamic-npc-dialogue.vercel.app

🛠️ Tech Stack
Next.js — Server and dashboard UI
x402 Protocol — HTTP-native micropayment standard
Google Gemini / Nvidia NIM — AI dialogue generation
EIP-191 / EIP-712 — Cryptographic payment authorization
Base Sepolia (Testnet) — USDC settlement chain
Drizzle ORM — Database layer
🚀 Run Locally
bash
npm install
# copy .env.example to .env and add your API keys
npm run dev

Open http://localhost:3000
