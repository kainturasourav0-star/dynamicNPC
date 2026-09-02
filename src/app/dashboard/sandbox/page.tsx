"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Terminal, 
  Coins, 
  Key, 
  Layers, 
  Play, 
  ShieldAlert, 
  CheckCircle2, 
  Wallet, 
  ChevronRight, 
  Sparkles, 
  AlertCircle,
  Copy,
  Check
} from "lucide-react";
import { ethers } from "ethers";

import { useWallet } from "@/context/WalletContext";
import { WalletConnectButton } from "@/components/WalletConnectButton";

interface NpcProfile {
  id: string;
  name: string;
  backstory: string;
  tone: string;
  style: string;
  safetyRules: string;
}

interface Message {
  role: "user" | "model";
  text: string;
  emotion?: string;
  isPendingPayment?: boolean;
  challenge?: any;
}

export default function SandboxPage() {
  const walletContext = useWallet();
  const [npcs, setNpcs] = useState<NpcProfile[]>([]);
  const [selectedNpcId, setSelectedNpcId] = useState("");
  const [loadingNpcs, setLoadingNpcs] = useState(true);
  const [simulatedWallet] = useState(() => ethers.Wallet.createRandom());
  
  // Game Context config
  const [context, setContext] = useState("The player walks into the dusty shop looking for a sword.");
  const [playerStateRaw, setPlayerStateRaw] = useState(JSON.stringify({ level: 3, gold: 120, health: 90 }, null, 2));
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogueChoices, setDialogueChoices] = useState<any[]>([]);
  
  // Pipeline tracking
  const [pipelineStep, setPipelineStep] = useState<"idle" | "requesting" | "challenged" | "signing" | "settling" | "completed" | "error">("idle");
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  
  // Stored JSON payload logs
  const [logs, setLogs] = useState<{
    requestInit?: any;
    challengeResponse?: any;
    settlementRequest?: any;
    settlementResponse?: any;
  }>({});
  const [activeLogTab, setActiveLogTab] = useState<"requestInit" | "challengeResponse" | "settlementRequest" | "settlementResponse">("requestInit");
  
  const [copiedText, setCopiedText] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadNpcs() {
      try {
        const res = await fetch("/api/npcs");
        const data = await res.json();
        if (data.status === "success") {
          setNpcs(data.npcs);
          if (data.npcs.length > 0) {
            setSelectedNpcId(data.npcs[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load NPCs", err);
      } finally {
        setLoadingNpcs(false);
      }
    }
    loadNpcs();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, dialogueChoices, pipelineStep]);


  const handleCopyLogs = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const activeNpc = npcs.find(n => n.id === selectedNpcId);

  // Initial Send (Phase 1: Challenge Trigger)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedNpcId || !inputValue.trim() || loading) return;

    const userMsg = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    setDialogueChoices([]);
    setPipelineError(null);
    setPipelineStep("requesting");
    
    // Parse player state
    let parsedState = {};
    try {
      parsedState = JSON.parse(playerStateRaw);
    } catch (e) {
      setPipelineError("Invalid Player State JSON. Please correct it.");
      setPipelineStep("error");
      setLoading(false);
      return;
    }

    const payload = {
      npcId: selectedNpcId,
      context: `${context} [Player action: ${userMsg}]`,
      playerState: parsedState,
      chainId: walletContext.chainId || 84532,
    };

    setLogs({ requestInit: payload });
    setActiveLogTab("requestInit");

    try {
      const res = await fetch("/api/sandbox/generate-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.status === 402) {
        const data = await res.json();
        setLogs(prev => ({ ...prev, challengeResponse: data }));
        setActiveLogTab("challengeResponse");
        
        // Add pending payment message
        setMessages(prev => [
          ...prev,
          { 
            role: "model", 
            text: "x402 payment challenge issued: Signature required to unlock dialogue.",
            isPendingPayment: true,
            challenge: data.challenge
          }
        ]);
        setPipelineStep("challenged");
      } else {
        const data = await res.json();
        if (data.status === "success") {
          setDialogueChoices(data.dialogue);
          setPipelineStep("completed");
        } else {
          throw new Error(data.message || "Failed to initiate dialogue request");
        }
      }
    } catch (err: any) {
      console.error(err);
      setPipelineError(err.message || "Error starting payment challenge flow");
      setPipelineStep("error");
      setLoading(false);
    }
  };

  // Phase 2: Sign Challenge and Settle Payment
  const handleSignAndSettle = async (pendingMsgIndex: number, challenge: any) => {
    setPipelineStep("signing");
    setPipelineError(null);

    // Reconstruct the message to sign
    const messageToSign = `x402 Payment Challenge\nRequest: ${challenge.requestId}\nAmount: ${challenge.amount} ${challenge.token}\nMerchant: ${challenge.merchantAddress}\nChain ID: ${challenge.chainId}\nNonce: ${challenge.nonce}`;

    try {
      let signature = "";
      let payerAddress = "";

      if (walletContext.isConnected && walletContext.walletType === "browser") {
        signature = await walletContext.signMessage(messageToSign);
        payerAddress = walletContext.address || "";
      } else {
        // Sign using persisted simulated wallet
        signature = await simulatedWallet.signMessage(messageToSign);
        payerAddress = simulatedWallet.address;
      }


      setPipelineStep("settling");
      
      const settlePayload = {
        npcId: selectedNpcId,
        requestId: challenge.requestId,
        signature,
        transactionHash: "mock_tx_" + ethers.hexlify(ethers.randomBytes(32)).substring(2)
      };

      setLogs(prev => ({ ...prev, settlementRequest: settlePayload }));
      setActiveLogTab("settlementRequest");

      const res = await fetch("/api/sandbox/generate-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settlePayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Settlement failed on the server");
      }

      setLogs(prev => ({ ...prev, settlementResponse: data }));
      setActiveLogTab("settlementResponse");

      // Replace the payment challenge alert message with the actual returned options
      setMessages(prev => {
        const copy = [...prev];
        copy.splice(pendingMsgIndex, 1); // remove challenge alert
        return copy;
      });

      setDialogueChoices(data.dialogue);
      setPipelineStep("completed");
    } catch (err: any) {
      console.error("Sign and Settle error:", err);
      setPipelineError(err.message || "Cryptographic signature or settlement failed");
      setPipelineStep("error");
    } finally {
      setLoading(false);
    }
  };

  // Select Dialogue Choice
  const handleSelectChoice = (choice: any) => {
    // Add chosen response to messages
    setMessages(prev => [...prev, { role: "model", text: choice.text, emotion: choice.emotion }]);
    
    // Append to context for conversational continuation
    setContext(prev => `${prev}\nNPC (${activeNpc?.name}): "${choice.text}"`);
    setDialogueChoices([]);
    setPipelineStep("idle");
  };

  const handleResetHistory = async () => {
    if (!selectedNpcId) return;
    
    const playerAddress = (walletContext.isConnected && walletContext.address)
      ? walletContext.address
      : simulatedWallet.address;
    
    setLoading(true);
    setPipelineError(null);
    
    try {
      const res = await fetch(`/api/sandbox/history?npcId=${selectedNpcId}&playerAddress=${playerAddress}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.status === "success") {
        setMessages([]);
        setDialogueChoices([]);
        setPipelineStep("idle");
        alert("Conversation history reset successfully!");
      } else {
        throw new Error(data.message || "Failed to reset conversation history");
      }
    } catch (err: any) {
      console.error(err);
      setPipelineError(err.message || "Error resetting conversation history");
      setPipelineStep("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[11px] font-semibold">
              Live Testbed
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Dialogue Sandbox
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Test and trace NPC conversational models using simulated or live cryptographic USDC billing.
          </p>
        </div>

        {/* Wallet Connector */}
        <div className="flex items-center gap-2">
          <WalletConnectButton />
        </div>
      </div>

      {loadingNpcs ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : npcs.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-2xl bg-[#0a0e18] border border-dashed border-white/15 max-w-2xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No NPC Profiles Configured</h3>
          <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto leading-relaxed">
            You must create at least one NPC profile in the console first to test interactive dialogue and settlement.
          </p>
          <a
            href="/dashboard/npcs"
            className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
          >
            Create NPC Profile
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Column */}
          <div className="space-y-6">
            
            {/* Context & State Configuration Panel */}
            <div className="rounded-2xl bg-[#0a0e18] border border-white/10 p-6 space-y-4 shadow-xl">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Prompt & Context Setup
              </h2>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Target NPC Profile</label>
                <select
                  value={selectedNpcId}
                  onChange={(e) => {
                    setSelectedNpcId(e.target.value);
                    setMessages([]);
                    setDialogueChoices([]);
                    setPipelineStep("idle");
                  }}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                >
                  {npcs.map(n => (
                    <option key={n.id} value={n.id} className="bg-[#0d121f]">{n.name} (Tone: {n.tone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Target Settlement Chain</label>
                <select
                  value={walletContext.chainId}
                  onChange={async (e) => {
                    await walletContext.switchNetwork(Number(e.target.value));
                    setPipelineStep("idle");
                  }}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value={84532} className="bg-[#0d121f]">Base Sepolia (84532)</option>
                  <option value={8453} className="bg-[#0d121f]">Base Mainnet (8453)</option>
                  <option value={11155111} className="bg-[#0d121f]">Sepolia (11155111)</option>
                </select>
              </div>

              {activeNpc && (
                <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                    <span className="text-slate-400 font-semibold">Persona Lore</span>
                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      ${(activeNpc as any).cost || "0.0100"} USDC
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 italic">
                    "{activeNpc.backstory}"
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Stateful Prompt / Context</label>
                <textarea
                  rows={3}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition resize-none placeholder-slate-600"
                  placeholder="Describe the initial environment scenario..."
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Player Attributes (JSON)</label>
                <textarea
                  rows={4}
                  value={playerStateRaw}
                  onChange={(e) => setPlayerStateRaw(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 transition resize-none font-mono"
                  placeholder='{"level": 1}'
                />
              </div>
            </div>

            {/* Wallet Signer Status Card */}
            <div className="rounded-2xl bg-[#0a0e18] border border-white/10 p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  Settlement Signer
                </h2>
                <span className="text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  {walletContext.networkName}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="truncate">
                  <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Signer Address</div>
                  <div className="text-xs font-mono font-bold text-slate-200 truncate">
                    {walletContext.isConnected && walletContext.address
                      ? `${walletContext.address.slice(0, 10)}...${walletContext.address.slice(-6)}`
                      : `${simulatedWallet.address.slice(0, 10)}...${simulatedWallet.address.slice(-6)} (Simulated)`}
                  </div>
                </div>

                <WalletConnectButton />
              </div>

              <div className="text-[11px] font-mono text-slate-400 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                <span>Mode: {walletContext.isConnected && walletContext.walletType === "browser" ? "Browser Web3 (MetaMask)" : "Simulated Ephemeral Key"}</span>
                <span className="text-emerald-400 font-bold">● Ready</span>
              </div>
            </div>

            {/* Step Pipeline Tracker */}
            <div className="rounded-2xl bg-[#0a0e18] border border-white/10 p-6 space-y-4 shadow-xl">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                <Layers className="w-4 h-4 text-cyan-400" />
                x402 Protocol Tracker
              </h2>

              <div className="space-y-4 text-xs font-mono">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                      pipelineStep === "requesting" 
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 animate-pulse"
                        : pipelineStep !== "idle" && pipelineStep !== "error"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "border-white/10 text-slate-600"
                    }`}>
                      1
                    </div>
                    <div className="w-0.5 h-6 bg-white/10"></div>
                  </div>
                  <div>
                    <span className="text-slate-200 block font-semibold">1. Request Initiation</span>
                    <span className="text-[10px] text-slate-500">POST payload to endpoint</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                      pipelineStep === "challenged" 
                        ? "bg-amber-600/20 border-amber-500 text-amber-400 animate-pulse"
                        : pipelineStep === "signing" || pipelineStep === "settling" || pipelineStep === "completed"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "border-white/10 text-slate-600"
                    }`}>
                      2
                    </div>
                    <div className="w-0.5 h-6 bg-white/10"></div>
                  </div>
                  <div>
                    <span className="text-slate-200 block font-semibold">2. Payment challenge (402)</span>
                    <span className="text-[10px] text-slate-500">API returns micropayment challenge</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                      pipelineStep === "signing" 
                        ? "bg-amber-600/20 border-amber-500 text-amber-400 animate-pulse"
                        : pipelineStep === "settling" || pipelineStep === "completed"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "border-white/10 text-slate-600"
                    }`}>
                      3
                    </div>
                    <div className="w-0.5 h-6 bg-white/10"></div>
                  </div>
                  <div>
                    <span className="text-slate-200 block font-semibold">3. Cryptographic Signature</span>
                    <span className="text-[10px] text-slate-500">Client signs challenge payload</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                      pipelineStep === "settling" 
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 animate-pulse"
                        : pipelineStep === "completed"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "border-white/10 text-slate-600"
                    }`}>
                      4
                    </div>
                    <div className="w-0.5 h-6 bg-white/10"></div>
                  </div>
                  <div>
                    <span className="text-slate-200 block font-semibold">4. Settlement Retry</span>
                    <span className="text-[10px] text-slate-500">Resubmit request with signature</span>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                      pipelineStep === "completed" 
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "border-white/10 text-slate-600"
                    }`}>
                      5
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-200 block font-semibold">5. Inference Output (200)</span>
                    <span className="text-[10px] text-slate-500">Receipt settled, dialogue generated</span>
                  </div>
                </div>
              </div>

              {pipelineError && (
                <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl text-rose-400 text-xs flex gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <span className="font-bold block font-mono uppercase tracking-wider">Pipeline Interrupted</span>
                    {pipelineError}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Chat Playground & Developer Raw Console */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Dialogue Chat Board */}
            <div className="rounded-2xl bg-[#0a0e18] border border-white/10 overflow-hidden flex flex-col h-[520px] shadow-xl">
              
              {/* Top status */}
              <div className="bg-white/[0.01] p-4 border-b border-white/10 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span className="font-bold text-white tracking-tight">Interactive Dialogue Terminal</span>
                </div>
                <div className="flex items-center gap-3">
                  {messages.length > 0 && (
                    <button
                      onClick={handleResetHistory}
                      className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg transition font-mono uppercase font-bold hover:bg-rose-500/20"
                    >
                      Reset History
                    </button>
                  )}
                  {activeNpc && (
                    <span className="text-slate-400 font-mono text-xs">NPC: {activeNpc.name}</span>
                  )}
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Greeting / Default */}
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 bg-cyan-500/10 flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-slate-300 text-xs leading-relaxed">
                    <p className="font-bold text-cyan-400 text-[10px] mb-1 font-mono uppercase">{activeNpc?.name || "System"}</p>
                    Greetings, Developer. I'm ready. Type something in the prompt bar below to trigger my dynamic dialogue generation and x402 payment flow.
                  </div>
                </div>

                {messages.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 ${
                      msg.role === "user" 
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" 
                        : "bg-white/[0.02] text-cyan-400 border border-white/10"
                    }`}>
                      {msg.role === "user" ? "P" : <Bot className="w-4 h-4" />}
                    </div>

                    {msg.isPendingPayment ? (
                      /* x402 Cryptographic Challenge Alert inside Chat */
                      <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl text-xs font-mono space-y-3 w-full shadow-lg">
                        <div className="flex justify-between items-center text-amber-400 font-bold border-b border-amber-500/20 pb-2">
                          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <Coins className="w-4 h-4" />
                            x402 Micropayment Required
                          </span>
                          <span className="text-[10px] bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">HTTP 402</span>
                        </div>

                        <div className="space-y-1 text-slate-300 text-xs">
                          <div>Request ID: <span className="text-slate-400">{msg.challenge.requestId.substring(0, 10)}...</span></div>
                          <div>Cost: <span className="text-emerald-400 font-bold">${msg.challenge.amount} USDC</span></div>
                          <div>Merchant Contract: <span className="text-slate-400 truncate">{msg.challenge.merchantAddress.substring(0, 12)}...</span></div>
                        </div>

                        <button
                          onClick={() => handleSignAndSettle(index, msg.challenge)}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-2.5 rounded-xl text-xs transition uppercase tracking-wider font-mono shadow-md"
                        >
                          <Wallet className="w-4 h-4" />
                          Sign EIP-191 & Settle
                        </button>
                      </div>
                    ) : (
                      /* Plain text dialogue bubbles */
                      <div className={`p-4 rounded-2xl text-xs ${
                        msg.role === "user" 
                          ? "bg-cyan-500/10 border border-cyan-500/20 text-white" 
                          : "bg-white/[0.02] border border-white/5 text-slate-200"
                      }`}>
                        <p className="font-bold text-[10px] mb-1 text-slate-400 font-mono uppercase tracking-wider">
                          {msg.role === "user" ? "Player" : activeNpc?.name}
                          {msg.emotion && (
                            <span className="ml-2 font-normal font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full text-[10px]">
                              {msg.emotion}
                            </span>
                          )}
                        </p>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading state indicator */}
                {loading && pipelineStep !== "challenged" && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pl-11">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    Pipeline executing: <span className="text-cyan-400 font-bold uppercase">{pipelineStep}...</span>
                  </div>
                )}

                {/* Multiple alternative generated choices */}
                {dialogueChoices.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl space-y-3 font-sans">
                    <p className="text-xs font-bold text-slate-300 border-b border-white/10 pb-2 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Inference Options — Select one to continue narrative:
                    </p>
                    <div className="space-y-2">
                      {dialogueChoices.map((choice, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectChoice(choice)}
                          className="w-full text-left p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition group text-xs"
                        >
                          <div className="flex justify-between items-center text-[10px] mb-1 font-mono uppercase tracking-wider">
                            <span className="text-cyan-400 font-bold">Option {i + 1}</span>
                            <span className="text-slate-400">Emotion: <strong className="text-cyan-300 font-normal">{choice.emotion}</strong></span>
                          </div>
                          <p className="text-slate-200 group-hover:text-white leading-relaxed">{choice.text}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input panel */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/[0.01] flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={loading || dialogueChoices.length > 0}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition disabled:opacity-50"
                  placeholder={dialogueChoices.length > 0 ? "Select one of the choices above to proceed..." : "Say something to the NPC..."}
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim() || dialogueChoices.length > 0}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold p-3 rounded-xl transition flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Developer Raw JSON Console Inspector */}
            <div className="rounded-2xl bg-[#0a0e18] border border-white/10 overflow-hidden flex flex-col h-[340px] shadow-xl">
              
              {/* Tab Header */}
              <div className="bg-white/[0.01] border-b border-white/10 flex justify-between items-center px-4 flex-wrap">
                <div className="flex gap-1 overflow-x-auto py-2">
                  <button
                    onClick={() => setActiveLogTab("requestInit")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition ${
                      activeLogTab === "requestInit" 
                        ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    1. Request Init
                  </button>
                  <button
                    onClick={() => setActiveLogTab("challengeResponse")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition ${
                      activeLogTab === "challengeResponse" 
                        ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    2. Challenge (402)
                  </button>
                  <button
                    onClick={() => setActiveLogTab("settlementRequest")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition ${
                      activeLogTab === "settlementRequest" 
                        ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    3. Settlement Req
                  </button>
                  <button
                    onClick={() => setActiveLogTab("settlementResponse")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition ${
                      activeLogTab === "settlementResponse" 
                        ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    4. Response (200)
                  </button>
                </div>
                
                {logs[activeLogTab] && (
                  <button
                    onClick={() => handleCopyLogs(JSON.stringify(logs[activeLogTab], null, 2))}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 transition font-mono uppercase tracking-wider"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy JSON
                  </button>
                )}
              </div>

              {/* Console Body */}
              <div className="flex-1 p-4 bg-black/40 overflow-y-auto font-mono text-xs text-cyan-300">
                {logs[activeLogTab] ? (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(logs[activeLogTab], null, 2)}</pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs font-mono">
                    <Terminal className="w-8 h-8 mb-2 opacity-40" />
                    <span className="uppercase tracking-wider">No payload registered for this step yet.</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
