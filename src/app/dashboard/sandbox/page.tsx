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
  const [npcs, setNpcs] = useState<NpcProfile[]>([]);
  const [selectedNpcId, setSelectedNpcId] = useState("");
  const [loadingNpcs, setLoadingNpcs] = useState(true);
  const [chainId, setChainId] = useState(84532);
  const [simulatedWallet] = useState(() => ethers.Wallet.createRandom());
  
  // Game Context config
  const [context, setContext] = useState("The player walks into the dusty shop looking for a sword.");
  const [playerStateRaw, setPlayerStateRaw] = useState(JSON.stringify({ level: 3, gold: 120, health: 90 }, null, 2));
  
  // Wallet setting
  const [walletType, setWalletType] = useState<"simulated" | "browser">("simulated");
  const [browserWalletAddress, setBrowserWalletAddress] = useState<string | null>(null);
  
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

  // Connect Browser Wallet
  const connectBrowserWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        setBrowserWalletAddress(accounts[0]);
        setWalletType("browser");
      } catch (err: any) {
        alert("Wallet connection rejected: " + err.message);
      }
    } else {
      alert("No Ethereum browser wallet found (e.g. MetaMask). Please install it or use the Simulated Wallet.");
    }
  };

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
      chainId
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

      if (walletType === "browser") {
        if (!browserWalletAddress) {
          throw new Error("Browser wallet is not connected");
        }
        // Sign using MetaMask / Web3 provider
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        signature = await signer.signMessage(messageToSign);
        payerAddress = browserWalletAddress;
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
    
    let playerAddress = "";
    if (walletType === "browser" && browserWalletAddress) {
      playerAddress = browserWalletAddress;
    } else {
      playerAddress = simulatedWallet.address;
    }
    
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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#2F323B] pb-6">
        <div>
          <p className="font-mono text-cyan-400 text-[10px] uppercase tracking-[0.3em] mb-2">Testing Environment</p>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
            <Play className="w-7 h-7 text-cyan-400" />
            Dialogue Sandbox
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Test and trace NPC conversational models using simulated or live cryptographic USDC billing.
          </p>
        </div>

        {/* Wallet Connector */}
        <div className="flex items-center gap-2 bg-[#0c0c0c] border border-[#2F323B] p-2">
          <button
            onClick={() => setWalletType("simulated")}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition ${
              walletType === "simulated" 
                ? "bg-cyan-400 text-black font-bold" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Simulated
          </button>
          
          {browserWalletAddress ? (
            <div className="flex items-center gap-2 bg-[#050505] px-3 py-1.5 border border-lime-500/20 text-xs text-lime-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></span>
              {browserWalletAddress.substring(0, 6)}...{browserWalletAddress.slice(-4)}
            </div>
          ) : (
            <button
              onClick={connectBrowserWallet}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition ${
                walletType === "browser" 
                  ? "border-cyan-500 text-cyan-400" 
                  : "border-[#2F323B] text-slate-400 hover:text-white hover:border-slate-600"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {loadingNpcs ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Loading NPCs...</span>
          </div>
        </div>
      ) : npcs.length === 0 ? (
        <div className="text-center py-20 bg-[#0c0c0c] border border-dashed border-[#2F323B]">
          <div className="p-4 inline-block mb-4 text-slate-600">
            <Bot className="w-12 h-12" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">No NPC Profiles Available</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            You must create at least one NPC profile before you can run the dialogue sandbox.
          </p>
          <a
            href="/dashboard/npcs"
            className="mt-6 inline-block bg-cyan-400 hover:bg-white text-black font-bold transition px-6 py-2.5 rounded-none text-xs font-mono uppercase tracking-wider"
          >
            Create NPC Profile
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Configurations Sidebar */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-[#0c0c0c] border border-[#2F323B] p-5 space-y-4">
              <h2 className="text-[10px] font-bold text-slate-200 font-mono uppercase tracking-[0.2em] flex items-center gap-2 border-b border-[#2F323B] pb-3">
                <Bot className="w-4 h-4 text-cyan-400" />
                Character & Context
              </h2>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Target NPC Profile</label>
                <select
                  value={selectedNpcId}
                  onChange={(e) => {
                    setSelectedNpcId(e.target.value);
                    setMessages([]);
                    setDialogueChoices([]);
                    setPipelineStep("idle");
                  }}
                  className="w-full bg-[#050505] border border-[#2F323B] rounded-none px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                >
                  {npcs.map(n => (
                    <option key={n.id} value={n.id}>{n.name} (Tone: {n.tone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Target Blockchain Chain ID</label>
                <select
                  value={chainId}
                  onChange={(e) => {
                    setChainId(Number(e.target.value));
                    setPipelineStep("idle");
                  }}
                  className="w-full bg-[#050505] border border-[#2F323B] rounded-none px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value={84532}>Base Sepolia (84532)</option>
                  <option value={11155420}>Optimism Sepolia (11155420)</option>
                  <option value={421614}>Arbitrum Sepolia (421614)</option>
                </select>
              </div>

              {activeNpc && (
                <div className="bg-black/20 p-3 border border-[#2F323B] space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider">
                    <span className="text-slate-500">NPC Backstory</span>
                    <span className="text-lime-400 bg-lime-500/10 border border-lime-500/20 px-1.5 py-0.5">
                      Fee: ${(activeNpc as any).cost || "0.0100"} USDC
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 italic">
                    "{activeNpc.backstory}"
                  </p>
                </div>
              )}

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Stateful Prompt / Narrative Context</label>
                <textarea
                  rows={4}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full bg-[#050505] border border-[#2F323B] rounded-none px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition resize-none font-sans"
                  placeholder="Describe the initial environment scenario..."
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Context appends selected answers to maintain multi-turn memory state.</span>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Player Attributes (JSON)</label>
                <textarea
                  rows={5}
                  value={playerStateRaw}
                  onChange={(e) => setPlayerStateRaw(e.target.value)}
                  className="w-full bg-[#050505] border border-[#2F323B] rounded-none px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 transition resize-none font-mono"
                  placeholder='{"level": 1}'
                />
              </div>
            </div>

            {/* Step Pipeline Tracker */}
            <div className="bg-[#0c0c0c] border border-[#2F323B] p-5 space-y-4">
              <h2 className="text-[10px] font-bold text-slate-200 font-mono uppercase tracking-[0.2em] flex items-center gap-2 border-b border-[#2F323B] pb-3">
                <Layers className="w-4 h-4 text-cyan-400" />
                x402 Protocol Tracker
              </h2>

              <div className="space-y-4 text-xs font-mono">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 flex items-center justify-center border text-[9px] font-bold ${
                      pipelineStep === "requesting" 
                        ? "bg-cyan-400/20 border-cyan-400 text-cyan-400 animate-pulse"
                        : pipelineStep !== "idle" && pipelineStep !== "error"
                        ? "bg-lime-500/20 border-lime-500 text-lime-400"
                        : "border-[#2F323B] text-slate-600"
                    }`}>
                      1
                    </div>
                    <div className="w-0.5 h-6 bg-[#2F323B]"></div>
                  </div>
                  <div>
                    <span className="text-slate-200 block font-semibold">1. Request Initiation</span>
                    <span className="text-[10px] text-slate-500">POST payload to endpoint</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 flex items-center justify-center border text-[9px] font-bold ${
                      pipelineStep === "challenged" 
                        ? "bg-amber-600/20 border-amber-500 text-amber-400 animate-pulse"
                        : pipelineStep === "signing" || pipelineStep === "settling" || pipelineStep === "completed"
                        ? "bg-lime-500/20 border-lime-500 text-lime-400"
                        : "border-[#2F323B] text-slate-600"
                    }`}>
                      2
                    </div>
                    <div className="w-0.5 h-6 bg-[#2F323B]"></div>
                  </div>
                  <div>
                    <span className="text-slate-200 block font-semibold">2. Payment challenge (402)</span>
                    <span className="text-[10px] text-slate-500">API returns micropayment challenge</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 flex items-center justify-center border text-[9px] font-bold ${
                      pipelineStep === "signing" 
                        ? "bg-amber-600/20 border-amber-500 text-amber-400 animate-pulse"
                        : pipelineStep === "settling" || pipelineStep === "completed"
                        ? "bg-lime-500/20 border-lime-500 text-lime-400"
                        : "border-[#2F323B] text-slate-600"
                    }`}>
                      3
                    </div>
                    <div className="w-0.5 h-6 bg-[#2F323B]"></div>
                  </div>
                  <div>
                    <span className="text-slate-200 block font-semibold">3. Cryptographic Signature</span>
                    <span className="text-[10px] text-slate-500">Client signs challenge payload</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 flex items-center justify-center border text-[9px] font-bold ${
                      pipelineStep === "settling" 
                        ? "bg-cyan-400/20 border-cyan-400 text-cyan-400 animate-pulse"
                        : pipelineStep === "completed"
                        ? "bg-lime-500/20 border-lime-500 text-lime-400"
                        : "border-[#2F323B] text-slate-600"
                    }`}>
                      4
                    </div>
                    <div className="w-0.5 h-6 bg-[#2F323B]"></div>
                  </div>
                  <div>
                    <span className="text-slate-200 block font-semibold">4. Settlement Retry</span>
                    <span className="text-[10px] text-slate-500">Resubmit request with signature</span>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 flex items-center justify-center border text-[9px] font-bold ${
                      pipelineStep === "completed" 
                        ? "bg-lime-500/20 border-lime-500 text-lime-400"
                        : "border-[#2F323B] text-slate-600"
                    }`}>
                      5
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-200 block font-semibold">5. Inference Output (200)</span>
                    <span className="text-[10px] text-slate-500">USDC receipt logged, LLM generated dialogue options</span>
                  </div>
                </div>
              </div>

              {pipelineError && (
                <div className="bg-rose-500/10 border border-rose-500/25 p-3 text-rose-400 text-xs flex gap-2">
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
          <div className="space-y-4 lg:col-span-2">
            
            {/* Dialogue Chat Board */}
            <div className="bg-[#0c0c0c] border border-[#2F323B] overflow-hidden flex flex-col h-[500px]">
              
              {/* Top status */}
              <div className="bg-[#050505] p-4 border-b border-[#2F323B] flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 animate-pulse"></div>
                  <span className="font-bold text-slate-300 font-mono uppercase tracking-wider text-[10px]">Sandbox Dialogue Playground</span>
                </div>
                <div className="flex items-center gap-3">
                  {messages.length > 0 && (
                    <button
                      onClick={handleResetHistory}
                      className="text-[9px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 transition font-mono uppercase font-bold hover:bg-rose-500/20"
                    >
                      Reset History
                    </button>
                  )}
                  {activeNpc && (
                    <span className="text-slate-500 font-mono text-[11px]">NPC: {activeNpc.name}</span>
                  )}
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Greeting / Default */}
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="w-8 h-8 flex items-center justify-center text-cyan-400 border border-[#2F323B] bg-[#050505]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[#050505] border border-[#2F323B] p-3.5 text-slate-300 text-sm">
                    <p className="font-bold text-cyan-400 text-[10px] mb-1 font-mono uppercase">{activeNpc?.name || "System"}</p>
                    Greetings, Developer. I'm ready. Type something in the prompt bar to trigger my dynamic dialogue generation flow.
                  </div>
                </div>

                {messages.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-2.5 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 flex items-center justify-center border text-[10px] font-mono font-bold ${
                      msg.role === "user" 
                        ? "bg-cyan-400/10 text-cyan-400 border-cyan-500/20" 
                        : "bg-[#050505] text-cyan-400 border-[#2F323B]"
                    }`}>
                      {msg.role === "user" ? "P" : <Bot className="w-4 h-4" />}
                    </div>

                    {msg.isPendingPayment ? (
                      /* x402 Cryptographic Challenge Alert inside Chat */
                      <div className="bg-amber-500/5 border border-amber-500/30 p-4 text-xs font-mono space-y-3 w-full">
                        <div className="flex justify-between items-center text-amber-400 font-bold border-b border-amber-500/20 pb-1.5">
                          <span className="flex items-center gap-1 uppercase tracking-wider text-[10px]">
                            <Coins className="w-4 h-4" />
                            x402 Micropayment Required
                          </span>
                          <span className="text-[9px] bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 uppercase">HTTP 402</span>
                        </div>

                        <div className="space-y-1 text-slate-300">
                          <div>Request ID: <span className="text-slate-400">{msg.challenge.requestId.substring(0, 8)}...</span></div>
                          <div>Cost: <span className="text-emerald-400 font-bold">${msg.challenge.amount} USDC</span></div>
                          <div>Verifier Contract: <span className="text-slate-500 truncate">{msg.challenge.merchantAddress.substring(0, 10)}...</span></div>
                        </div>

                        <button
                          onClick={() => handleSignAndSettle(index, msg.challenge)}
                          className="w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-white text-black font-bold py-2 text-xs transition uppercase tracking-wider font-mono"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Sign EIP-191 & Settle
                        </button>
                      </div>
                    ) : (
                      /* Plain text dialogue bubbles */
                      <div className={`p-3.5 text-sm ${
                        msg.role === "user" 
                          ? "bg-cyan-400/10 border border-cyan-500/20 text-white" 
                          : "bg-[#050505] border border-[#2F323B] text-slate-300"
                      }`}>
                        <p className="font-bold text-[9px] mb-1 text-slate-400 font-mono uppercase tracking-wider">
                          {msg.role === "user" ? "Player" : activeNpc?.name}
                          {msg.emotion && (
                            <span className="ml-2 font-normal font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5">
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
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pl-11">
                    <span className="w-1.5 h-1.5 bg-cyan-400 animate-ping"></span>
                    Pipeline executing: <span className="text-cyan-400 font-bold uppercase">{pipelineStep}...</span>
                  </div>
                )}

                {/* Multiple alternative generated choices */}
                {dialogueChoices.length > 0 && (
                  <div className="bg-[#050505] border border-[#2F323B] p-4 space-y-3 font-sans">
                    <p className="text-[9px] font-bold text-slate-400 border-b border-[#2F323B] pb-2 flex items-center gap-1 font-mono uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Inference Options — Select one to continue narrative:
                    </p>
                    <div className="space-y-2">
                      {dialogueChoices.map((choice, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectChoice(choice)}
                          className="w-full text-left p-3 bg-[#0c0c0c] border border-[#2F323B] hover:border-cyan-400/40 hover:bg-cyan-400/5 transition group text-sm"
                        >
                          <div className="flex justify-between items-center text-[9px] mb-1 font-mono uppercase tracking-wider">
                            <span className="text-cyan-400 font-bold">Option {i + 1}</span>
                            <span className="text-slate-500">Emotion: <strong className="text-cyan-300 font-normal">{choice.emotion}</strong></span>
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
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#2F323B] bg-[#050505] flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={loading || dialogueChoices.length > 0}
                  className="flex-1 bg-[#0c0c0c] border border-[#2F323B] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition disabled:opacity-50"
                  placeholder={dialogueChoices.length > 0 ? "Select one of the choices above to proceed..." : "Say something to the NPC..."}
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim() || dialogueChoices.length > 0}
                  className="bg-cyan-400 hover:bg-white disabled:bg-cyan-400/30 disabled:cursor-not-allowed text-black font-bold p-2.5 transition flex items-center justify-center flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Developer Raw JSON Console Inspector */}
            <div className="bg-[#0c0c0c] border border-[#2F323B] overflow-hidden flex flex-col h-[350px]">
              
              {/* Tab Header */}
              <div className="bg-[#050505] border-b border-[#2F323B] flex justify-between items-center px-4 flex-wrap">
                <div className="flex gap-1 overflow-x-auto py-2">
                  <button
                    onClick={() => setActiveLogTab("requestInit")}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition ${
                      activeLogTab === "requestInit" 
                        ? "bg-[#0c0c0c] text-cyan-400 border-b-2 border-cyan-400" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    1. Request Init
                  </button>
                  <button
                    onClick={() => setActiveLogTab("challengeResponse")}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition ${
                      activeLogTab === "challengeResponse" 
                        ? "bg-[#0c0c0c] text-cyan-400 border-b-2 border-cyan-400" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    2. Challenge (402)
                  </button>
                  <button
                    onClick={() => setActiveLogTab("settlementRequest")}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition ${
                      activeLogTab === "settlementRequest" 
                        ? "bg-[#0c0c0c] text-cyan-400 border-b-2 border-cyan-400" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    3. Settlement Req
                  </button>
                  <button
                    onClick={() => setActiveLogTab("settlementResponse")}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition ${
                      activeLogTab === "settlementResponse" 
                        ? "bg-[#0c0c0c] text-cyan-400 border-b-2 border-cyan-400" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    4. Response (200)
                  </button>
                </div>
                
                {logs[activeLogTab] && (
                  <button
                    onClick={() => handleCopyLogs(JSON.stringify(logs[activeLogTab], null, 2))}
                    className="flex items-center gap-1.5 text-[9px] text-slate-400 hover:text-white bg-[#0c0c0c] px-2 py-1 border border-[#2F323B] transition font-mono uppercase tracking-wider"
                  >
                    {copiedText ? <Check className="w-3 h-3 text-lime-400" /> : <Copy className="w-3 h-3" />}
                    Copy JSON
                  </button>
                )}
              </div>

              {/* Console Body */}
              <div className="flex-1 p-4 bg-[#050505] overflow-y-auto font-mono text-xs text-cyan-300">
                {logs[activeLogTab] ? (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(logs[activeLogTab], null, 2)}</pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 text-xs font-mono">
                    <Terminal className="w-8 h-8 mb-2" />
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
