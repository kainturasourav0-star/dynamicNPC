"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Gamepad2, 
  Coins, 
  Layers, 
  ShieldAlert, 
  Wallet, 
  Sparkles,
  Play,
  RotateCcw,
  Bot
} from "lucide-react";
import { ethers } from "ethers";

interface NpcProfile {
  id: string;
  name: string;
  backstory: string;
  tone: string;
  style: string;
  safetyRules: string;
  cost: string;
}

interface LogEntry {
  title: string;
  body: string;
  type: "req" | "402" | "sig" | "200" | "info";
  time: string;
}

function getChallengeMessage(challenge: any): string {
  return `Pay ${challenge.amount} ${challenge.token} to ${challenge.merchantAddress} on chain ${challenge.chainId} (Request ID: ${challenge.requestId}, Nonce: ${challenge.nonce})`;
}

export default function GamePage() {
  const [npcs, setNpcs] = useState<NpcProfile[]>([]);
  const [loadingNpcs, setLoadingNpcs] = useState(true);
  
  // Wallet setting
  const [walletType, setWalletType] = useState<"simulated" | "browser">("simulated");
  const [browserWalletAddress, setBrowserWalletAddress] = useState<string | null>(null);
  const [simulatedWallet] = useState(() => ethers.Wallet.createRandom());
  const [chainId] = useState(84532);

  // Live Stats Metrics
  const [totalCalls, setTotalCalls] = useState(0);
  const [revenue, setRevenue] = useState(0.00);

  // Inspector Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    { title: "[System Initialized]", body: "Move character near any NPC to trigger dialogue...", type: "info", time: new Date().toLocaleTimeString() }
  ]);
  const [status, setStatus] = useState("READY");

  // Game UI States
  const [activeNPC, setActiveNPC] = useState<any>(null);
  const [dialogueText, setDialogueText] = useState<string | null>(null);
  const [dialogueCost, setDialogueCost] = useState<string>("0.0100");
  const [dialogueNpcName, setDialogueNpcName] = useState<string>("");
  const [receiptText, setReceiptText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Game loop coordinate states (using refs to avoid re-triggering React state changes)
  const playerRef = useRef({ x: 310, y: 280, radius: 12, speed: 3.5, color: '#06b6d4', pulse: 0 });
  const keysRef = useRef<Record<string, boolean>>({});
  const particlesRef = useRef<any[]>([]);
  const npcsRef = useRef<any[]>([]);

  // Fetch NPCs from project
  useEffect(() => {
    async function fetchNpcs() {
      try {
        const res = await fetch("/api/npcs");
        const data = await res.json();
        if (data.status === "success" && data.npcs.length > 0) {
          setNpcs(data.npcs);
          
          // Map to 2D coordinates
          const colors = ['#f43f5e', '#eab308', '#a855f7', '#10b981'];
          const coordinates = [
            { x: 120, y: 120 },
            { x: 500, y: 140 },
            { x: 310, y: 80 },
            { x: 310, y: 200 }
          ];

          const mapped = data.npcs.slice(0, 4).map((npc: any, index: number) => {
            const coord = coordinates[index] || { x: Math.random() * 400 + 100, y: Math.random() * 200 + 50 };
            return {
              ...npc,
              x: coord.x,
              y: coord.y,
              color: colors[index % colors.length]
            };
          });
          npcsRef.current = mapped;
        }
      } catch (err) {
        console.error("Failed to load NPCs for game map", err);
      } finally {
        setLoadingNpcs(false);
      }
    }
    fetchNpcs();
  }, []);

  // Connect Browser Wallet
  const connectBrowserWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        setBrowserWalletAddress(accounts[0]);
        setWalletType("browser");
        addLog("[Wallet Connected]", `Connected browser address: ${accounts[0].substring(0, 6)}...${accounts[0].slice(-4)}`, "info");
      } catch (err: any) {
        alert("Wallet connection rejected: " + err.message);
      }
    } else {
      alert("No Ethereum browser wallet found. Please install it or use the Simulated Wallet.");
    }
  };

  const addLog = (title: string, body: string, type: LogEntry["type"]) => {
    setLogs(prev => [
      ...prev,
      { title, body, type, time: new Date().toLocaleTimeString() }
    ]);
  };

  // Scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Settlement flow trigger
  const triggerDialogueFlow = async (npc: any) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPipelineError(null);
    setDialogueNpcName(npc.name);
    setDialogueCost(npc.cost || "0.0100");
    setDialogueText("Initializing payment challenge...");
    setReceiptText("x402 Verification: Pending...");
    setStatus("CHALLENGING");

    try {
      // 1. Initial Request
      addLog("[1] POST /api/sandbox/generate-dialogue", `Target NPC: ${npc.name} | Context: Approaching in RPG realm`, "req");
      
      const res = await fetch("/api/sandbox/generate-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npcId: npc.id,
          context: `The player approaches the NPC inside the interactive 2D RPG realm. Player is carrying a Magic staff.`,
          playerState: { level: 5, gold: 150, inventory: ["🔮 Arcane Staff"] },
          chainId
        })
      });

      const data = await res.json();

      if (res.status !== 402 || !data.challenge) {
        throw new Error(data.message || "Failed to trigger payment challenge");
      }

      const challenge = data.challenge;
      const requestId = data.requestId;

      // 2. HTTP 402 Payment Required
      addLog("[2] HTTP 402 Payment Required", `USDC Amount: $${challenge.amount} | Nonce: ${challenge.nonce.substring(0, 10)}...`, "402");
      setStatus("SIGNING");
      
      await new Promise(r => setTimeout(r, 600));

      // 3. Recover Signature
      let signature = "";
      let payerAddress = "";
      const messageToSign = getChallengeMessage(challenge);

      if (walletType === "browser" && browserWalletAddress) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        signature = await signer.signMessage(messageToSign);
        payerAddress = browserWalletAddress;
      } else {
        signature = await simulatedWallet.signMessage(messageToSign);
        payerAddress = simulatedWallet.address;
      }

      addLog("[3] EIP-191 Personal Sign", `Signature created by player ${payerAddress.substring(0, 6)}...`, "sig");
      setStatus("SETTLING");
      
      await new Promise(r => setTimeout(r, 600));

      // 4. Settle payment request
      const settlePayload = {
        npcId: npc.id,
        requestId,
        signature,
        transactionHash: "mock_tx_" + ethers.hexlify(ethers.randomBytes(32)).substring(2)
      };

      addLog("[4] POST /api/sandbox/generate-dialogue (Settle)", `Submitting signature for settlement...`, "req");

      const settleRes = await fetch("/api/sandbox/generate-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settlePayload)
      });

      const settleData = await settleRes.json();

      if (!settleRes.ok) {
        throw new Error(settleData.message || "Settlement failed on the server");
      }

      // 5. HTTP 200 OK Output
      addLog("[5] HTTP 200 OK Dialogue Delivered", `Dialogue generated successfully via LLM.`, "200");
      setStatus("VERIFIED");

      // Extract Gemini dialogue response
      const dialogueTextGenerated = settleData.dialogue?.[0]?.text || "Greetings, adventurer!";
      setDialogueText(`"${dialogueTextGenerated}"`);
      setReceiptText(`Receipt: Verified (${settlePayload.transactionHash.substring(0, 10)}...)`);

      // Update metrics
      setTotalCalls(prev => prev + 1);
      setRevenue(prev => prev + parseFloat(challenge.amount));

    } catch (err: any) {
      console.error(err);
      setPipelineError(err.message || "Error running payment workflow");
      setDialogueText("Error occurred during billing negotiation.");
      setReceiptText("x402 Verification: Failed");
      setStatus("ERROR");
      addLog("[Error Interrupted]", err.message || "Verification failed", "info");
    } finally {
      setIsProcessing(false);
    }
  };

  // Setup game Canvas Loop
  useEffect(() => {
    if (loadingNpcs || npcsRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    
    // Bind keyboards
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeKeys = ["Space", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"];
      if (activeKeys.includes(e.key)) {
        e.preventDefault(); // prevent scrolling
      }
      keysRef.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Particle emitter
    const createParticle = (x: number, y: number, color: string) => {
      particlesRef.current.push({
        x,
        y,
        radius: Math.random() * 3 + 1,
        alpha: 1,
        color
      });
    };

    const loop = () => {
      const player = playerRef.current;
      const keys = keysRef.current;
      const particles = particlesRef.current;
      const mapNpcs = npcsRef.current;

      // Update player position
      let moving = false;
      if (keys["ArrowUp"] || keys["w"]) { player.y = Math.max(20, player.y - player.speed); moving = true; }
      if (keys["ArrowDown"] || keys["s"]) { player.y = Math.min(400, player.y + player.speed); moving = true; }
      if (keys["ArrowLeft"] || keys["a"]) { player.x = Math.max(20, player.x - player.speed); moving = true; }
      if (keys["ArrowRight"] || keys["d"]) { player.x = Math.min(600, player.x + player.speed); moving = true; }

      if (moving) {
        createParticle(player.x, player.y, player.color);
      }

      // Check NPC proximity
      let proximateNPC: any = null;
      mapNpcs.forEach(n => {
        const dist = Math.hypot(player.x - n.x, player.y - n.y);
        if (dist < 45) {
          proximateNPC = n;
        }
      });
      
      setActiveNPC(proximateNPC);

      // Trigger dialogue key handler
      if (keys[" "] && proximateNPC && !isProcessing) {
        triggerDialogueFlow(proximateNPC);
        keys[" "] = false; // reset key press
      }

      // Canvas Rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        p.alpha -= 0.03;
        if (p.alpha <= 0) particles.splice(i, 1);
      }

      // Draw NPCs
      mapNpcs.forEach(n => {
        ctx.save();
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Name tag
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(n.name.split(' ')[0], n.x, n.y - 20);
      });

      // Draw Player
      ctx.save();
      ctx.shadowColor = player.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Interaction outline
      if (proximateNPC) {
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(proximateNPC.x, proximateNPC.y, 22 + Math.sin(player.pulse) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Press [SPACE] to speak', player.x, player.y - 22);
      }

      player.pulse = (player.pulse + 0.05) % (Math.PI * 2);

      animFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [loadingNpcs, isProcessing]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-cyan-400" />
            2D Interactive RPG Simulator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Move near custom NPC profiles in the town canvas, pay their dynamic USDC fees, and settle real-time AI dialogues.
          </p>
        </div>

        {/* Wallet Connector */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <button
            onClick={() => setWalletType("simulated")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              walletType === "simulated" 
                ? "bg-cyan-600 text-white" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Simulated Wallet
          </button>
          
          {browserWalletAddress ? (
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {browserWalletAddress.substring(0, 6)}...{browserWalletAddress.slice(-4)}
            </div>
          ) : (
            <button
              onClick={connectBrowserWallet}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed transition ${
                walletType === "browser" 
                  ? "border-cyan-500 text-cyan-400" 
                  : "border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              Connect Browser Wallet
            </button>
          )}
        </div>
      </div>

      {loadingNpcs ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : npcs.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="p-4 bg-slate-950/60 rounded-full inline-block mb-4 text-slate-600">
            <Bot className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No NPC Profiles Configured</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            You must create at least one NPC profile in the console first to see them appear in the 2D Game town map.
          </p>
          <a
            href="/dashboard/npcs"
            className="mt-6 inline-block bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition px-4 py-2 rounded-lg text-sm"
          >
            Create NPC Profile
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Viewport panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              
              {/* Canvas viewport */}
              <canvas 
                ref={canvasRef} 
                width={620} 
                height={420} 
                className="block mx-auto max-w-full"
              />

              {/* Dialogue Speech overlay card */}
              {(activeNPC || isProcessing || dialogueText) && (
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur border border-cyan-500/30 rounded-xl p-4 shadow-xl animate-fade-in-up">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                    <span className="font-bold text-amber-400 text-sm">{dialogueNpcName || activeNPC?.name}</span>
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono font-bold">
                      Cost: ${dialogueCost} USDC
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed min-h-[30px]">
                    {dialogueText || "Walk closer to interact and start dialogue."}
                  </p>
                  {receiptText && (
                    <div className="text-[9px] font-mono text-emerald-400 text-right mt-2">
                      {receiptText}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instruction manual */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block mb-1">🎮 Control Manual</span>
                <span>Use <strong>WASD</strong> or <strong>Arrow Keys</strong> to walk around. Move adjacent to an NPC, wait for the yellow halo, and press <strong>[SPACE]</strong> to talk.</span>
              </div>
              <div className="text-right">
                <span className="text-slate-200 font-bold block mb-1">💼 Wallet Address</span>
                <span className="font-mono">{walletType === "browser" ? browserWalletAddress : simulatedWallet.address}</span>
              </div>
            </div>
          </div>

          {/* Real-time Protocol Inspector */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[420px]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
                <span className="font-bold text-sm text-slate-200 font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  x402 Protocol Log
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  status === "READY" || status === "VERIFIED" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : status === "ERROR"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                }`}>
                  {status}
                </span>
              </div>

              {/* Log Entries */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 font-mono text-[10px]">
                {logs.map((log, index) => (
                  <div 
                    key={index}
                    className={`p-2.5 rounded-lg border-l-2 ${
                      log.type === "req" 
                        ? "bg-cyan-500/5 border-cyan-500 text-cyan-300"
                        : log.type === "402"
                        ? "bg-rose-500/5 border-rose-500 text-rose-300"
                        : log.type === "sig"
                        ? "bg-amber-500/5 border-amber-500 text-amber-300"
                        : log.type === "200"
                        ? "bg-emerald-500/5 border-emerald-500 text-emerald-300"
                        : "bg-slate-950/60 border-slate-800 text-slate-500"
                    }`}
                  >
                    <div className="flex justify-between font-bold mb-1">
                      <span>{log.title}</span>
                      <span className="text-[8px] opacity-60">{log.time}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{log.body}</p>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono">Active Inventory</span>
                <span className="text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                  🔮 Arcane Staff
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                <span className="text-slate-400 font-mono">Total Dialogue Calls</span>
                <span className="text-slate-200 font-bold font-mono">{totalCalls}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                <span className="text-slate-400 font-mono">Accumulated Cost</span>
                <span className="text-emerald-400 font-bold font-mono">${revenue.toFixed(4)} USDC</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
