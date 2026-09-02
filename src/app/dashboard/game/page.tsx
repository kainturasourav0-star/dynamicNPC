"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Gamepad2, 
  Coins, 
  Layers, 
  ShieldAlert, 
  Wallet, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Bot, 
  Terminal 
} from "lucide-react";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { PageHeader, StatusBadge } from "@/components/console/ConsoleUI";

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
  const walletContext = useWallet();
  const [npcs, setNpcs] = useState<NpcProfile[]>([]);
  const [loadingNpcs, setLoadingNpcs] = useState(true);
  
  const [simulatedWallet] = useState(() => ethers.Wallet.createRandom());

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

  // Game Quest and Health States
  const [playerHealth, setPlayerHealth] = useState(3);
  const [playerCrystals, setPlayerCrystals] = useState(0);
  const [showRespawn, setShowRespawn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef({ x: 310, y: 280, radius: 12, speed: 3.5, color: '#06b6d4', pulse: 0 });
  const keysRef = useRef<Record<string, boolean>>({});
  const particlesRef = useRef<any[]>([]);
  const npcsRef = useRef<any[]>([]);

  const healthRef = useRef(3);
  const crystalsRef = useRef(0);
  const shakeRef = useRef(0);
  const invulnerableRef = useRef(0);
  
  const collectiblesRef = useRef([
    { id: 1, x: 80, y: 150, collected: false, pulse: 0 },
    { id: 2, x: 540, y: 120, collected: false, pulse: 1.5 },
    { id: 3, x: 480, y: 340, collected: false, pulse: 3 }
  ]);

  const sentinelRef = useRef({
    x: 100,
    y: 100,
    radius: 10,
    speed: 1.1
  });

  const healingPadRef = useRef({
    x: 120,
    y: 350,
    radius: 20
  });

  const floatingTextsRef = useRef<any[]>([]);
  const createFloatingText = (x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 60
    });
  };

  const respawnPlayer = () => {
    healthRef.current = 3;
    setPlayerHealth(3);
    setShowRespawn(false);
    playerRef.current.x = 310;
    playerRef.current.y = 280;
    sentinelRef.current.x = 100;
    sentinelRef.current.y = 100;
    createFloatingText(310, 280, "Respawned!", "#06b6d4");
    addLog("[Respawn]", "Player revived. Health restored.", "info");
  };

  useEffect(() => {
    async function fetchNpcs() {
      try {
        const res = await fetch("/api/npcs");
        const data = await res.json();
        if (data.status === "success" && data.npcs.length > 0) {
          setNpcs(data.npcs);
          
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

  const addLog = (title: string, body: string, type: LogEntry["type"]) => {
    setLogs(prev => [
      ...prev,
      { title, body, type, time: new Date().toLocaleTimeString() }
    ]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

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
      const inventory = ["🔮 Arcane Staff"];
      if (crystalsRef.current > 0) {
        inventory.push(`💎 ${crystalsRef.current}/3 Mana Crystals`);
      }
      const contextMsg = crystalsRef.current === 3
        ? `The player approaches the NPC inside the interactive 2D RPG realm. They have successfully gathered all 3 Mana Crystals to complete their quest!`
        : `The player approaches the NPC inside the interactive 2D RPG realm. They are currently gathering Mana Crystals for their quest (current progress: ${crystalsRef.current}/3 crystals).`;

      addLog("[1] POST /api/sandbox/generate-dialogue", `Target NPC: ${npc.name} | Context: Approaching with quest items`, "req");
      
      const res = await fetch("/api/sandbox/generate-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npcId: npc.id,
          context: contextMsg,
          playerState: { level: 5, gold: 150, inventory },
          chainId: walletContext.chainId || 84532
        })
      });

      const data = await res.json();

      if (res.status !== 402 || !data.challenge) {
        throw new Error(data.message || "Failed to trigger payment challenge");
      }

      const challenge = data.challenge;
      const requestId = data.requestId;

      addLog("[2] HTTP 402 Payment Required", `USDC Amount: $${challenge.amount} | Nonce: ${challenge.nonce.substring(0, 10)}...`, "402");
      setStatus("SIGNING");
      
      await new Promise(r => setTimeout(r, 600));

      let signature = "";
      let payerAddress = "";
      const messageToSign = getChallengeMessage(challenge);

      if (walletContext.isConnected && walletContext.walletType === "browser") {
        signature = await walletContext.signMessage(messageToSign);
        payerAddress = walletContext.address || "";
      } else {
        signature = await simulatedWallet.signMessage(messageToSign);
        payerAddress = simulatedWallet.address;
      }

      addLog("[3] EIP-191 Personal Sign", `Signature created by player ${payerAddress.substring(0, 6)}...`, "sig");
      setStatus("SETTLING");
      
      await new Promise(r => setTimeout(r, 600));

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

      addLog("[5] HTTP 200 OK Dialogue Delivered", `Dialogue generated successfully via LLM.`, "200");
      setStatus("VERIFIED");

      const dialogueTextGenerated = settleData.dialogue?.[0]?.text || "Greetings, adventurer!";
      setDialogueText(`"${dialogueTextGenerated}"`);
      setReceiptText(`Receipt: Verified (${settlePayload.transactionHash.substring(0, 10)}...)`);

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

  useEffect(() => {
    if (loadingNpcs || npcsRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeKeys = ["Space", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"];
      if (activeKeys.includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

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

      let moving = false;
      if (healthRef.current > 0) {
        if (keys["ArrowUp"] || keys["w"]) { player.y = Math.max(20, player.y - player.speed); moving = true; }
        if (keys["ArrowDown"] || keys["s"]) { player.y = Math.min(400, player.y + player.speed); moving = true; }
        if (keys["ArrowLeft"] || keys["a"]) { player.x = Math.max(20, player.x - player.speed); moving = true; }
        if (keys["ArrowRight"] || keys["d"]) { player.x = Math.min(600, player.x + player.speed); moving = true; }
      }

      if (moving) {
        createParticle(player.x, player.y, player.color);
      }

      const sentinel = sentinelRef.current;
      const dx = player.x - sentinel.x;
      const dy = player.y - sentinel.y;
      const distToPlayer = Math.hypot(dx, dy);
      
      if (distToPlayer > 0 && healthRef.current > 0) {
        sentinel.x += (dx / distToPlayer) * sentinel.speed;
        sentinel.y += (dy / distToPlayer) * sentinel.speed;
      }

      if (invulnerableRef.current > 0) {
        invulnerableRef.current--;
      }
      
      if (distToPlayer < player.radius + sentinel.radius && invulnerableRef.current === 0 && healthRef.current > 0) {
        healthRef.current = Math.max(0, healthRef.current - 1);
        setPlayerHealth(healthRef.current);
        invulnerableRef.current = 60;
        shakeRef.current = 15;
        createFloatingText(player.x, player.y - 15, "-1 HP", "#f43f5e");
        
        if (distToPlayer > 0) {
          player.x -= (dx / distToPlayer) * 35;
          player.y -= (dy / distToPlayer) * 35;
          player.x = Math.max(20, Math.min(600, player.x));
          player.y = Math.max(20, Math.min(400, player.y));
        }

        for (let i = 0; i < 20; i++) {
          createParticle(player.x, player.y, "#f43f5e");
        }

        if (healthRef.current === 0) {
          setShowRespawn(true);
        }
      }

      collectiblesRef.current.forEach(c => {
        if (!c.collected) {
          const distToGem = Math.hypot(player.x - c.x, player.y - c.y);
          if (distToGem < player.radius + 12 && healthRef.current > 0) {
            c.collected = true;
            crystalsRef.current++;
            setPlayerCrystals(crystalsRef.current);
            createFloatingText(c.x, c.y - 15, "+1 Crystal", "#10b981");
            for (let i = 0; i < 15; i++) {
              createParticle(c.x, c.y, "#10b981");
            }
          }
        }
      });

      const healingPad = healingPadRef.current;
      const distToPad = Math.hypot(player.x - healingPad.x, player.y - healingPad.y);
      if (distToPad < player.radius + healingPad.radius && healthRef.current < 3 && healthRef.current > 0) {
        healthRef.current = 3;
        setPlayerHealth(3);
        createFloatingText(player.x, player.y - 15, "Health Restored!", "#10b981");
        for (let i = 0; i < 10; i++) {
          createParticle(player.x, player.y, "#10b981");
        }
      }

      let proximateNPC: any = null;
      mapNpcs.forEach(n => {
        const dist = Math.hypot(player.x - n.x, player.y - n.y);
        if (dist < 45) {
          proximateNPC = n;
        }
      });
      
      setActiveNPC(proximateNPC);

      if (keys[" "] && proximateNPC && !isProcessing && healthRef.current > 0) {
        triggerDialogueFlow(proximateNPC);
        keys[" "] = false;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      if (shakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * shakeRef.current;
        const shakeY = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(shakeX, shakeY);
        shakeRef.current *= 0.9;
        if (shakeRef.current < 0.5) shakeRef.current = 0;
      }

      // Draw subtle grid
      ctx.strokeStyle = '#1e293b33';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

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

      mapNpcs.forEach(n => {
        ctx.save();
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(n.name.split(' ')[0], n.x, n.y - 20);
      });

      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.beginPath();
      ctx.arc(healingPad.x, healingPad.y, healingPad.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', healingPad.x, healingPad.y);
      ctx.restore();

      collectiblesRef.current.forEach(c => {
        if (!c.collected) {
          ctx.save();
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#10b981';
          const scale = 1 + Math.sin(c.pulse) * 0.15;
          ctx.translate(c.x, c.y);
          ctx.scale(scale, scale);
          ctx.beginPath();
          ctx.moveTo(0, -7);
          ctx.lineTo(5, 0);
          ctx.lineTo(0, 7);
          ctx.lineTo(-5, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          c.pulse += 0.06;
        }
      });

      if (healthRef.current > 0) {
        ctx.save();
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(sentinel.x, sentinel.y, sentinel.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(sentinel.x, sentinel.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (healthRef.current > 0) {
        ctx.save();
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (proximateNPC && healthRef.current > 0) {
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(proximateNPC.x, proximateNPC.y, 22 + Math.sin(player.pulse) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#00E5FF';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press [SPACE] to speak', player.x, player.y - 22);
      }

      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
        
        ft.y -= 0.7;
        ft.alpha -= 1 / ft.life;
        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      ctx.restore();

      if (healthRef.current === 0) {
        ctx.fillStyle = 'rgba(7, 9, 12, 0.88)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PLAYER DEFEATED', canvas.width / 2, canvas.height / 2 - 10);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.fillText('Click "Respawn Player" above to try again', canvas.width / 2, canvas.height / 2 + 18);
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ─── Page Header ────────────────────────────────────────── */}
      <PageHeader
        badge="Live Testbed"
        title="Interactive 2D Game Simulator"
        description="Explore an interactive 2D realm, trigger NPC proximity challenges, sign EIP-191 micropayments, and stream dialogues in real time."
        actions={
          <div className="flex items-center gap-3">
            <WalletConnectButton />
          </div>
        }
      />

      {loadingNpcs ? (
        <div className="flex justify-center items-center h-80">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
            <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Loading Game Simulator...</span>
          </div>
        </div>
      ) : npcs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#0F141A] border border-white/[0.08] p-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-3 text-cyan-400">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No NPC Profiles Configured</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Create an NPC profile in the console first to see them appear in the 2D Game realm map.
          </p>
          <Link
            href="/dashboard/npcs"
            className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-cyan-500/20 transition"
          >
            Create NPC Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Game Viewport panel ────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Quest HUD & Health Status */}
            <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-4 flex justify-between items-center text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider font-semibold">Active Quest:</span>
                <span className="font-bold text-cyan-300">
                  {playerCrystals === 3 
                    ? "✨ All Crystals Gathered! Speak with NPC to deliver." 
                    : `💎 Collect all Mana Crystals (${playerCrystals}/3)`}
                </span>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider font-semibold">Health:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((heart) => (
                      <span key={heart} className={`text-sm ${heart <= playerHealth ? 'text-rose-400' : 'text-slate-700'}`}>
                        ❤️
                      </span>
                    ))}
                  </div>
                </div>
                
                {showRespawn && (
                  <button
                    onClick={respawnPlayer}
                    className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono text-[10px] px-3 py-1 rounded-lg uppercase tracking-wider transition font-bold"
                  >
                    Respawn
                  </button>
                )}
              </div>
            </div>

            {/* Canvas Viewport Frame */}
            <div className="relative bg-[#07090C] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
              <canvas 
                ref={canvasRef} 
                width={620} 
                height={420} 
                className="block mx-auto max-w-full"
              />

              {/* Dialogue Speech overlay card */}
              {(activeNPC || isProcessing || dialogueText) && (
                <div className="absolute bottom-4 left-4 right-4 bg-[#0F141A]/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-2xl animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-white/[0.08] pb-2 mb-2">
                    <span className="font-bold text-cyan-300 text-xs">{dialogueNpcName || activeNPC?.name}</span>
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                      Fee: ${dialogueCost} USDC
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed min-h-[28px]">
                    {dialogueText || "Walk closer to interact and press [SPACE] to start dialogue."}
                  </p>
                  {receiptText && (
                    <div className="text-[10px] font-mono text-emerald-400 text-right mt-1.5 font-bold">
                      {receiptText}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls & Active Wallet Footer */}
            <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-4 text-xs text-slate-400 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-white font-bold block mb-0.5 text-xs">🎮 Controls</span>
                <span className="text-slate-400 text-[11px]">Use <strong>WASD</strong> or <strong>Arrow Keys</strong> to move. Approach an NPC and press <strong>[SPACE]</strong>. Avoid the red Sentinel drone!</span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold block mb-0.5 text-xs">Payer Account</span>
                <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                  {walletContext.isConnected && walletContext.address 
                    ? `${walletContext.address.substring(0, 8)}...${walletContext.address.slice(-4)}` 
                    : `${simulatedWallet.address.substring(0, 8)}... (Simulated)`}
                </span>
              </div>
            </div>
          </div>

          {/* ─── Real-time Protocol Inspector ───────────────────── */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-5 flex flex-col h-[460px] shadow-sm">
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-3 mb-3">
                <span className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  x402 Protocol Telemetry
                </span>
                <StatusBadge 
                  status={status === "READY" || status === "VERIFIED" ? "success" : status === "ERROR" ? "error" : "pending"}
                  label={status}
                />
              </div>

              {/* Log Entries */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-mono text-[11px]">
                {logs.map((log, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-xl border ${
                      log.type === "req" 
                        ? "bg-cyan-500/5 border-cyan-500/20 text-cyan-300"
                        : log.type === "402"
                        ? "bg-rose-500/5 border-rose-500/20 text-rose-300"
                        : log.type === "sig"
                        ? "bg-amber-500/5 border-amber-500/20 text-amber-300"
                        : log.type === "200"
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                        : "bg-white/[0.02] border-white/[0.06] text-slate-400"
                    }`}
                  >
                    <div className="flex justify-between font-bold mb-1">
                      <span>{log.title}</span>
                      <span className="text-[9px] opacity-60">{log.time}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap text-[10px]">{log.body}</p>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* Metrics Mini-Card */}
            <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-5 space-y-3 text-xs shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono text-[11px]">Active Equipment</span>
                <span className="text-cyan-400 font-bold font-mono">
                  🔮 Arcane Staff
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-white/[0.06] pt-2.5">
                <span className="text-slate-400 font-mono text-[11px]">Total Dialogue Inferences</span>
                <span className="text-white font-bold font-mono">{totalCalls}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/[0.06] pt-2.5">
                <span className="text-slate-400 font-mono text-[11px]">Settled Amount</span>
                <span className="text-emerald-400 font-bold font-mono">${revenue.toFixed(4)} USDC</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

