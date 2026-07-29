"use client";

import React, { useState } from "react";
import { BookOpen, Code, Terminal, Play, ShieldAlert, Cpu, Clipboard, Check } from "lucide-react";

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
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-400" />
          Integration Guide
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Connect your game clients to the metered NPC Dialogue service using the x402 protocol specification.
        </p>
      </div>

      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-200">1. Challenge-Response</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Metered calls to `/api/generate-dialogue` return a standard HTTP 402 Payment Required response containing a payment challenge payload.
          </p>
        </div>

        <div className="space-y-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg w-fit">
            <Code className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-200">2. Client Signature</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The game client signs the challenge using standard EIP-712 / personal_sign, verifying intention to pay $0.01 USDC.
          </p>
        </div>

        <div className="space-y-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit">
            <Play className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-200">3. Settle & Generate</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Client retries the request with the signature. The API verifies the signature, settles the USDC transaction, and executes the LLM generator.
          </p>
        </div>
      </div>

      {/* cURL Example */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            Quick Test (cURL CLI)
          </h3>
          <button
            onClick={() => handleCopy(curlSnippet, "curl")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 transition"
          >
            {copiedId === "curl" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5" />
                Copy Snippet
              </>
            )}
          </button>
        </div>
        <pre className="font-mono text-xs text-indigo-300 bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-800 max-h-[300px]">
          {curlSnippet}
        </pre>
      </div>

      {/* Node/Ethers Example */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Code className="w-4 h-4 text-indigo-400" />
            Node.js / TypeScript Client
          </h3>
          <button
            onClick={() => handleCopy(nodeSnippet, "node")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 transition"
          >
            {copiedId === "node" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5" />
                Copy Snippet
              </>
            )}
          </button>
        </div>
        <pre className="font-mono text-xs text-indigo-300 bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-800 max-h-[300px]">
          {nodeSnippet}
        </pre>
      </div>

      {/* Unity C# Example */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-400" />
            Unity Engine Integration (C#)
          </h3>
          <button
            onClick={() => handleCopy(csharpSnippet, "csharp")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 transition"
          >
            {copiedId === "csharp" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5" />
                Copy Snippet
              </>
            )}
          </button>
        </div>
        <pre className="font-mono text-xs text-indigo-300 bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-800 max-h-[300px]">
          {csharpSnippet}
        </pre>
      </div>
    </div>
  );
}
