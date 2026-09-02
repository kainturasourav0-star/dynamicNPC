"use client";

import React, { useState } from "react";
import { BookOpen, Code, Terminal, Play, ShieldAlert, Cpu, Copy, Check, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/console/ConsoleUI";

export default function DocsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const curlSnippet = `# 1. Challenge Phase: Trigger the initial call
curl -X POST http://localhost:3000/api/generate-dialogue \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "npcId": "YOUR_NPC_ID",
    "context": "The player just completed the tutorial dungeon and is low on health.",
    "playerState": { "level": 1, "health": 15 }
  }'

# Expected response: HTTP 402 Payment Required
# {
#   "status": "payment_required",
#   "requestId": "dialogue_req_uuid...",
#   "challenge": {
#     "requestId": "dialogue_req_uuid...",
#     "merchantAddress": "0x9876...",
#     "amount": "0.0100",
#     "token": "USDC",
#     "chainId": 84532,
#     "nonce": "0xabc123..."
#   }
# }

# 2. Settle Phase: Sign the challenge message and retry the call
curl -X POST http://localhost:3000/api/generate-dialogue \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestId": "dialogue_req_uuid...",
    "signature": "0xSIGNATURE_FROM_PLAYER_WALLET"
  }'

# Expected response: HTTP 200 Success
# {
#   "status": "success",
#   "dialogue": [
#     { "text": "Take this potion, traveler...", "emotion": "Friendly" }
#   ],
#   "receipt": { "transactionHash": "0x...", "amount": "0.0100" }
# }`;

  const nodeSnippet = `import { ethers } from "ethers";

const API_KEY = "YOUR_API_KEY";
const NPC_ID = "YOUR_NPC_ID";
const API_URL = "http://localhost:3000/api/generate-dialogue";

async function requestNpcDialogue(wallet: ethers.Signer) {
  // --- PHASE 1: CHALLENGE ---
  console.log("Requesting dialogue challenge...");
  const challengeRes = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      npcId: NPC_ID,
      context: "The player approaches seeking arcane advice.",
      playerState: { class: "Mage" }
    })
  });

  if (challengeRes.status !== 402) {
    throw new Error("Expected 402 Payment Required from metered endpoint");
  }

  const { requestId, challenge } = await challengeRes.json();
  
  // Reconstruct the message to sign
  const message = \`x402 Payment Challenge\\nRequest: \${challenge.requestId}\\nAmount: \${challenge.amount} \${challenge.token}\\nMerchant: \${challenge.merchantAddress}\\nChain ID: \${challenge.chainId}\\nNonce: \${challenge.nonce}\`;

  // --- PHASE 2: SIGN ---
  console.log("Signing payment authorization...");
  const signature = await wallet.signMessage(message);

  // --- PHASE 3: SETTLE ---
  console.log("Submitting signature for payment settlement...");
  const settleRes = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      requestId,
      signature
    })
  });

  const output = await settleRes.json();
  console.log("NPC Dialogues:", output.dialogue);
  console.log("Transaction Receipt:", output.receipt);
}`;

  const csharpSnippet = `using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

public class NpcDialogueClient : MonoBehaviour
{
    private const string ApiKey = "YOUR_API_KEY";
    private const string NpcId = "YOUR_NPC_ID";
    private const string ApiUrl = "http://localhost:3000/api/generate-dialogue";

    public void TriggerDialogue(string contextJson)
    {
        StartCoroutine(RunX402DialogueFlow(contextJson));
    }

    private IEnumerator RunX402DialogueFlow(string contextJson)
    {
        // 1. Send Challenge Request
        var request = new UnityWebRequest(ApiUrl, "POST");
        byte[] bodyRaw = Encoding.UTF8.GetBytes(contextJson);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Authorization", "Bearer " + ApiKey);
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.responseCode == 402)
        {
            var responseJson = request.downloadHandler.text;
            // Parse requestId and challenge parameters
            // Sign the challenge payload with Game Wallet or player key...
            string mockSignature = "0xSIGNATURE_GENERATED_BY_CLIENT";
            
            // 2. Settle Request
            yield return StartCoroutine(SettleDialoguePayment(challenge.requestId, mockSignature));
        }
    }

    private IEnumerator SettleDialoguePayment(string requestId, string signature)
    {
        string settleJson = $"{{\\"requestId\\":\\"{requestId}\\",\\"signature\\":\\"{signature}\\"}}";
        // Call ApiUrl again with signature, yielding HTTP 200 containing NPC responses...
        yield return null;
    }
}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ─── Page Header ────────────────────────────────────────── */}
      <PageHeader
        badge="Protocol Specification"
        title="Integration Guide & API Reference"
        description="Connect your game clients to the metered NPC Dialogue service using the x402 HTTP standard and EIP-191 signatures."
      />

      {/* ─── 3-Step Overview Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 space-y-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-sm">01. Challenge-Response</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Metered calls to <code className="text-cyan-400 font-mono text-[11px]">/api/generate-dialogue</code> return HTTP 402 Payment Required containing the challenge payload.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 space-y-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Code className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-sm">02. Client Signature</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The game client or player wallet signs the challenge using EIP-191 personal_sign, authorizing the USDC micropayment.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 space-y-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Play className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-sm">03. Settle & Stream</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Client retries with signature. API verifies, settles the USDC transaction, and executes the low-latency LLM generator.
          </p>
        </div>
      </div>

      {/* ─── cURL CLI Snippet ───────────────────────────────────── */}
      <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2 text-xs">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Quick Test (cURL CLI)
          </h3>
          <button
            onClick={() => handleCopy(curlSnippet, "curl")}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#07090C] px-3 py-1.5 rounded-xl border border-white/[0.08] transition"
          >
            {copiedId === "curl" ? (
              <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
            ) : (
              <><Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Snippet</>
            )}
          </button>
        </div>
        <pre className="font-mono text-xs text-cyan-300 bg-[#07090C] p-4 rounded-xl overflow-x-auto border border-white/[0.06] max-h-[300px]">
          {curlSnippet}
        </pre>
      </div>

      {/* ─── Node.js / TypeScript Example ───────────────────────── */}
      <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2 text-xs">
            <Code className="w-4 h-4 text-cyan-400" />
            Node.js / TypeScript Client
          </h3>
          <button
            onClick={() => handleCopy(nodeSnippet, "node")}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#07090C] px-3 py-1.5 rounded-xl border border-white/[0.08] transition"
          >
            {copiedId === "node" ? (
              <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
            ) : (
              <><Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Snippet</>
            )}
          </button>
        </div>
        <pre className="font-mono text-xs text-cyan-300 bg-[#07090C] p-4 rounded-xl overflow-x-auto border border-white/[0.06] max-h-[300px]">
          {nodeSnippet}
        </pre>
      </div>

      {/* ─── Unity Engine (C#) Example ──────────────────────────── */}
      <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2 text-xs">
            <Code className="w-4 h-4 text-emerald-400" />
            Unity Engine Integration (C#)
          </h3>
          <button
            onClick={() => handleCopy(csharpSnippet, "csharp")}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#07090C] px-3 py-1.5 rounded-xl border border-white/[0.08] transition"
          >
            {copiedId === "csharp" ? (
              <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
            ) : (
              <><Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Snippet</>
            )}
          </button>
        </div>
        <pre className="font-mono text-xs text-cyan-300 bg-[#07090C] p-4 rounded-xl overflow-x-auto border border-white/[0.06] max-h-[300px]">
          {csharpSnippet}
        </pre>
      </div>
    </div>
  );
}

