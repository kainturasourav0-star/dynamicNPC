"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  Copy, 
  Check, 
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Coins,
  Bot,
  Key,
  Play,
  Plus,
  Volume2,
  Gamepad2,
  BookOpen,
  Cpu,
  RotateCcw,
  Send,
  icons
} from "lucide-react";

const Search = icons.Search;
const ArrowRight = icons.ArrowRight;

/* ═══════════════════════════════════════════════════════════════
   TYPES & DATA MODELS
   ═══════════════════════════════════════════════════════════════ */
interface PersonaData {
  color: string;
  dim: string;
  initials: string;
  role: string;
  lore: string;
  tags: string[];
  status: "live" | "training" | "draft";
  rpm: number;
  lat: number;
  rev: string;
  voice: string;
  ragDocs: number;
  model: string;
  greet: string;
  replies: string[];
}

const PERSONAS: Record<string, PersonaData> = {
  "VEX-7": {
    color: "var(--cyan)",
    dim: "rgba(53,224,245,0.11)",
    initials: "V7",
    role: "Netrunner · Night Markets",
    lore: "A ghost in the market mesh — sells data she swears she didn't steal. Speaks in half-finished warnings and quotes dead protocols. Never jacks in with a rig she can't abandon.",
    tags: ["voice · Rift", "RAG · 240 docs", "model · npc-402-turbo"],
    status: "live",
    rpm: 142,
    lat: 342,
    rev: "1.42",
    voice: "Rift",
    ragDocs: 240,
    model: "npc-402-turbo",
    greet: "You're the one asking about the Arasaka vault. Talk fast — the mesh doesn't stay quiet for long.",
    replies: [
      "The data vault? You don't break in — you get invited past the ICE. Bring a burner deck, and don't jack in with anything you can't afford to lose.",
      "Black ICE? That's not security, choom. That's a corpo death sentence with a welcome mat. I know a ghost who mapped it — but ghosts charge up front.",
      "I can get you a map of the intrusion corridor. Costs you 50 eddies and a favor I haven't thought of yet. Those are my favorite kind."
    ]
  },
  "SABLE": {
    color: "var(--violet)",
    dim: "rgba(154,140,255,0.12)",
    initials: "SB",
    role: "Fixer · Chrome Lotus Club",
    lore: "The club's maître d' of misery. Brokers jobs, secrets, and chrome between corpo suits and street crews. Polite, precise, and always — always — paid first. Conversation is leverage.",
    tags: ["voice · Vesper", "RAG · 312 docs", "model · npc-402-turbo"],
    status: "live",
    rpm: 98,
    lat: 298,
    rev: "0.98",
    voice: "Vesper",
    ragDocs: 312,
    model: "npc-402-turbo",
    greet: "Chrome Lotus, midnight. You're early. Or desperate. In my line of work, those are usually the same thing.",
    replies: [
      "Meet me at the Chrome Lotus after midnight. Come alone, come armed, and don't waste my time with credits that bounce.",
      "The job pays two thousand — half now, half when the package breathes. Betrayal costs considerably more. Ask around.",
      "Information is a river, darling. I don't sell the water — I sell the map of where it's poisoned."
    ]
  },
  "MIRAGE": {
    color: "var(--green)",
    dim: "rgba(61,220,151,0.11)",
    initials: "MR",
    role: "Street Doc · Sector 9 Clinic",
    lore: "Back-alley ripperdoc with steady hands and shaky morals. Installs chrome, patches nanite rot, and asks no questions — but remembers everything you mumble under sedation.",
    tags: ["voice · Bishop", "RAG · 188 docs", "model · npc-402-pro"],
    status: "live",
    rpm: 76,
    lat: 412,
    rev: "0.76",
    voice: "Bishop",
    ragDocs: 188,
    model: "npc-402-pro",
    greet: "Clinic's closed. You're bleeding on my table anyway, so sit down and tell me what you did.",
    replies: [
      "The nanites need a cold chain or they go necrotic in the vial — and yes, that's as bad as it sounds. I've got ice. I've also got prices.",
      "That chrome's military grade, choom. Someone's going to notice it walking around in your chest. I can scrub the serials… for a fee.",
      "Sedation's clean, the laser's hotter than your last relationship, and my hands don't shake. They used to. Long story. Two hundred eddies."
    ]
  },
  "K-09": {
    color: "var(--amber)",
    dim: "rgba(255,196,84,0.12)",
    initials: "K9",
    role: "Enforcer · Sector 7 Perimeter",
    lore: "Reconditioned corporate security unit. Speaks in clipped procedural language. Fine-tuning on de-escalation dialogue — currently defaults to perimeter warnings with 12% threat misfire rate.",
    tags: ["voice · Rook", "RAG · 96 docs", "fine-tune · epoch 14/20"],
    status: "training",
    rpm: 0,
    lat: 506,
    rev: "0.00",
    voice: "Rook",
    ragDocs: 96,
    model: "npc-402-turbo",
    greet: "Citizen. Sector 7 perimeter is restricted. State your business or turn around. This is your only advisory.",
    replies: [
      "Sector 7 lockdown confirmed. Unauthorized bio-signatures detected in your vicinity. Comply and no harm metrics will be recorded.",
      "My de-escalation subroutines are ninety-two percent effective. The remaining eight percent involve a very loud noise. Do not test the statistic.",
      "Access request logged. Correlating with warrant database. Result: inconclusive. Suspicion level: rising. Remain where you are."
    ]
  },
  "NYX-3": {
    color: "var(--red)",
    dim: "rgba(255,107,129,0.12)",
    initials: "N3",
    role: "Rogue Media · Neon Mile",
    lore: "Pirate-broadcast journalist hunting the story the corps memory-holed. Interviews players for 'sources,' trades rumors for leads, and files every conversation as potential evidence.",
    tags: ["voice · Lyric", "RAG · 274 docs", "model · npc-402-turbo"],
    status: "live",
    rpm: 61,
    lat: 388,
    rev: "0.61",
    voice: "Lyric",
    ragDocs: 274,
    model: "npc-402-turbo",
    greet: "You're live on my frequency, and I don't do reruns. Give me a source worth broadcasting, or be the story.",
    replies: [
      "The story's already live on the mesh. Question is whether you're a source… or the headline. Sources get anonymity. Headlines get memory-holed.",
      "Arasaka's dumping biowaste in Sector 9 and calling it weather. I need one witness with a pulse and a grudge. You look like both.",
      "I've got ninety seconds before the signal hops towers. Talk fast, talk true, and don't waste my one good frequency."
    ]
  },
  "HALO-9": {
    color: "#8C9AB5",
    dim: "rgba(148,163,184,0.12)",
    initials: "H9",
    role: "Techie · The Docks",
    lore: "Drone-fleet mechanic and salvage artist. Draft persona — lore corpus uploaded, voice model pending calibration. Will patch anything with anything, then charge you for the warranty she doesn't honor.",
    tags: ["voice · unassigned", "RAG · 41 docs", "awaiting deploy"],
    status: "draft",
    rpm: 0,
    lat: 0,
    rev: "0.00",
    voice: "Unassigned",
    ragDocs: 41,
    model: "npc-402-turbo",
    greet: "Look, whatever's smoking in your rig, I didn't break it. But I can fix it for fifty eddies and whatever shiny metal is in your pockets.",
    replies: [
      "Salvage rights in the deep basin belong to whoever pulls it out first. Keep that in mind before you tell me your coordinates.",
      "I can patch that optical link, but it's going to flicker whenever high-tension power lines are overhead. Deal with it."
    ]
  }
};

interface SessionDetail {
  id: string;
  persona: string;
  player: string;
  turns: number;
  lat: number;
  fee: number;
  time: string;
  status?: "settled" | "processing";
  excerpt: string;
  conv: [string, string][];
}

const INITIAL_SESSIONS: SessionDetail[] = [
  {
    id: "SES-8F21",
    persona: "VEX-7",
    player: "0x4a91…f2c7",
    turns: 6,
    lat: 342,
    fee: 0.06,
    time: "12s ago",
    status: "settled",
    excerpt: "“The data vault? You don't break in — you get invited by the ICE…”",
    conv: [
      ["player", "Where do I find the Arasaka data vault?"],
      ["npc", "The data vault? You don't break in — you get invited past the ICE. Bring a burner deck."],
      ["player", "And the black ICE around it?"],
      ["npc", "Black ICE? That's not security, choom. That's a corpo death sentence with a welcome mat."]
    ]
  },
  {
    id: "SES-8F1F",
    persona: "SABLE",
    player: "0x7c20…11ae",
    turns: 4,
    lat: 298,
    fee: 0.04,
    time: "48s ago",
    status: "settled",
    excerpt: "“Meet me at the Chrome Lotus after midnight. Come alone, come armed…”",
    conv: [
      ["player", "I need someone disappeared from a guest list."],
      ["npc", "Meet me at the Chrome Lotus after midnight. Come alone, come armed, and don't waste my time with credits that bounce."],
      ["player", "Payment?"],
      ["npc", "Two thousand. Half now, half when the paper breathes."]
    ]
  },
  {
    id: "SES-8F1B",
    persona: "MIRAGE",
    player: "0x91dd…880b",
    turns: 8,
    lat: 412,
    fee: 0.08,
    time: "1m ago",
    status: "settled",
    excerpt: "“The nanites need a cold chain or they go necrotic in the vial…”",
    conv: [
      ["player", "This chrome's running hot. You can fix it?"],
      ["npc", "That nanite batch needs a cold chain or it goes necrotic in the vial — and yes, that's as bad as it sounds."],
      ["player", "How long do I have?"],
      ["npc", "Forty seconds once it hits body temp. Sit. Still. My hands don't shake."]
    ]
  },
  {
    id: "SES-8F19",
    persona: "K-09",
    player: "0x33b7…04fe",
    turns: 3,
    lat: 506,
    fee: 0.03,
    time: "2m ago",
    status: "processing",
    excerpt: "“Sector 7 lockdown confirmed. Moving to secondary perimeter…”",
    conv: [
      ["player", "Just passing through sector 7."],
      ["npc", "Citizen. Sector 7 perimeter is restricted. State your business or turn around. This is your only advisory."],
      ["player", "…fine, I'm leaving."],
      ["npc", "Compliance logged. Have a sanctioned day."]
    ]
  },
  {
    id: "SES-8F12",
    persona: "VEX-7",
    player: "0x4a91…f2c7",
    turns: 5,
    lat: 364,
    fee: 0.05,
    time: "3m ago",
    status: "settled",
    excerpt: "“Black ICE? That's not security, that's a corpo death sentence…”",
    conv: [
      ["player", "You ever tangle with black ICE?"],
      ["npc", "Black ICE? That's not security, that's a corpo death sentence. I lost a deck and three neurons to it."],
      ["player", "So that's a no?"],
      ["npc", "That's a 'ask me again when you can pay my medical deductibles.'"]
    ]
  }
];

const VOICE_PROFILES = [
  { name: "Rift", desc: "Neutral synthetic · EN", color: "#35E0F5", traits: ["warm", "slight glitch", "all-purpose"], pitch: 1.0, rate: 1.0 },
  { name: "Vesper", desc: "Feminine · smoky alto · EN", color: "#9A8CFF", traits: ["low", "confident", "noir"], pitch: 1.25, rate: 0.98 },
  { name: "Rook", desc: "Masculine · gravel bass · EN", color: "#FFC454", traits: ["rough", "slow", "authority"], pitch: 0.6, rate: 0.92 },
  { name: "Echo-9", desc: "Synthetic unit · filtered · EN", color: "#3DDC97", traits: ["robotic", "band-pass", "security units"], pitch: 0.85, rate: 1.05 },
  { name: "Lyric", desc: "Feminine · bright · EN/ES", color: "#FF6B81", traits: ["upbeat", "fast", "media host"], pitch: 1.4, rate: 1.08 },
  { name: "Bishop", desc: "Masculine · warm tenor · EN", color: "#9A8CFF", traits: ["calm", "reassuring", "medic"], pitch: 0.9, rate: 0.96 }
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "profiles" | "logs" | "voice" | "sandbox" | "demo" | "keys" | "integrations" | "docs"
  >("overview");

  // Sync with URL Hash
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.replace("#/", "").replace("#", "");
      if (h && ["overview", "profiles", "logs", "voice", "sandbox", "demo", "keys", "integrations", "docs"].includes(h)) {
        setActiveTab(h as any);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const changeTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Stats & Global Tickers ──────────────────────────────────────────────
  const [queryCount, setQueryCount] = useState(1420);
  const [blockNum, setBlockNum] = useState(18492317);
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("7D");
  const [activeTooltip, setActiveTooltip] = useState<{ index: number; x: number; y: number } | null>(null);
  const [copiedVault, setCopiedVault] = useState(false);
  
  // Tickers
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockNum(prev => prev + 1 + Math.floor(Math.random() * 3));
      setQueryCount(prev => prev + 1 + Math.floor(Math.random() * 4));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Live Settlements Feed
  const [settlementFeed, setSettlementFeed] = useState([
    { id: "1", hash: "0x4f2a…91c3", amount: "+0.0100", time: "now" },
    { id: "2", hash: "0x8e1b…42ad", amount: "+0.0100", time: "14s ago" },
    { id: "3", hash: "0x3c90…71ff", amount: "+0.0100", time: "42s ago" },
    { id: "4", hash: "0x1a72…6e0d", amount: "+0.0100", time: "1m ago" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const hex = "0123456789abdef";
      const rnd = () => Array.from({ length: 4 }, () => hex[Math.floor(Math.random() * hex.length)]).join("");
      const newEntry = {
        id: Math.random().toString(),
        hash: `0x${rnd()}…${rnd()}`,
        amount: "+0.0100",
        time: "now"
      };
      setSettlementFeed(prev => [newEntry, ...prev.slice(0, 3)]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // ─── Modals State ────────────────────────────────────────────────────────
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployStep, setDeployStep] = useState<"form" | "loading" | "success">("form");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeSession, setActiveSession] = useState<SessionDetail | null>(null);

  // ─── NPC Profiles Filter State ───────────────────────────────────────────
  const [personaSearch, setPersonaSearch] = useState("");
  const [personaFilter, setPersonaFilter] = useState("all");

  // ─── Logs Search & Filter State ──────────────────────────────────────────
  const [logSearch, setLogSearch] = useState("");
  const [logPersona, setLogPersona] = useState("all");
  const [logStatus, setLogStatus] = useState("all");
  const [sessions, setSessions] = useState<SessionDetail[]>(INITIAL_SESSIONS);

  // ─── OmniVoice Studio State ──────────────────────────────────────────────
  const [selectedVoice, setSelectedVoice] = useState(VOICE_PROFILES[0]);
  const [ttsRate, setTtsRate] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [ttsText, setTtsText] = useState(
    "The data vault? You don't break in — you get invited past the ICE. Bring a burner deck, and don't jack in with anything you can't afford to lose."
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(ttsText);
      utterance.pitch = ttsPitch * (selectedVoice.name === "Rook" ? 0.6 : selectedVoice.name === "Lyric" ? 1.35 : 1);
      utterance.rate = ttsRate;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  // ─── Dialogue Sandbox Chat State ─────────────────────────────────────────
  const [sbPersona, setSbPersona] = useState("VEX-7");
  const [sbMessages, setSbMessages] = useState<Array<{ role: "user" | "npc"; text: string; lat?: number }>>([
    {
      role: "npc",
      text: "You're the one who's been asking about the Arasaka vault. Talk fast — the mesh doesn't stay quiet for long. What do you want?",
      lat: 378
    }
  ]);
  const [sbInput, setSbInput] = useState("");
  const [sbTyping, setSbTyping] = useState(false);
  const [sbTurnsCount, setSbTurnsCount] = useState(1);
  const [sbAvgLat, setSbAvgLat] = useState(378);
  const sbThreadRef = useRef<HTMLDivElement>(null);

  const handleSendSandbox = () => {
    if (!sbInput.trim() || sbTyping) return;
    const userMsg = sbInput.trim();
    setSbInput("");
    setSbMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setSbTyping(true);

    setTimeout(() => {
      const p = PERSONAS[sbPersona];
      const reply = p.replies[Math.floor(Math.random() * p.replies.length)];
      const lat = 290 + Math.floor(Math.random() * 200);
      setSbMessages(prev => [...prev, { role: "npc", text: reply, lat }]);
      setSbTyping(false);
      setSbTurnsCount(prev => prev + 1);
      setSbAvgLat(prev => Math.round((prev + lat) / 2));
      if (sbThreadRef.current) {
        sbThreadRef.current.scrollTop = sbThreadRef.current.scrollHeight;
      }
    }, 900);
  };

  // ─── Interactive Game Canvas State ───────────────────────────────────────
  const [demoPersona, setDemoPersona] = useState("VEX-7");
  const [demoMessages, setDemoMessages] = useState<Array<{ role: "user" | "npc"; text: string; lat?: number }>>([
    {
      role: "npc",
      text: "You found my booth. Breathe easy — for now. What's the job, and why should I care?",
      lat: 356
    }
  ]);
  const [demoInput, setDemoInput] = useState("");
  const [demoTyping, setDemoTyping] = useState(false);
  const demoThreadRef = useRef<HTMLDivElement>(null);

  const handleSendDemo = () => {
    if (!demoInput.trim() || demoTyping) return;
    const userMsg = demoInput.trim();
    setDemoInput("");
    setDemoMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setDemoTyping(true);

    setTimeout(() => {
      const p = PERSONAS[demoPersona];
      const reply = p.replies[Math.floor(Math.random() * p.replies.length)];
      const lat = 310 + Math.floor(Math.random() * 180);
      setDemoMessages(prev => [...prev, { role: "npc", text: reply, lat }]);
      setDemoTyping(false);
      if (demoThreadRef.current) {
        demoThreadRef.current.scrollTop = demoThreadRef.current.scrollHeight;
      }
    }, 850);
  };

  // ─── API Keys Tabs State ─────────────────────────────────────────────────
  const [activeSdkTab, setActiveSdkTab] = useState<"curl" | "js" | "py">("curl");

  // Chart datasets
  const chartDatasets = {
    "7D": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      req: [184, 326, 462, 408, 618, 684, 721],
      lat: [428, 402, 389, 397, 371, 358, 378],
      total: 3403,
      peak: 721,
      peakLabel: "Sun",
      revenue: "34.03"
    },
    "30D": {
      labels: ["W1", "W2", "W3", "W4", "W5", "W6", "Now"],
      req: [890, 1240, 1680, 2100, 2450, 2980, 3403],
      lat: [445, 420, 395, 382, 375, 368, 378],
      total: 14743,
      peak: 3403,
      peakLabel: "Now",
      revenue: "147.43"
    },
    "90D": {
      labels: ["M1", "M2", "M3", "M4", "M5", "M6", "Now"],
      req: [2400, 4100, 6800, 8900, 11400, 13800, 16200],
      lat: [460, 435, 410, 390, 382, 374, 378],
      total: 63600,
      peak: 16200,
      peakLabel: "Now",
      revenue: "636.00"
    }
  };

  const currentChart = chartDatasets[timeRange];
  const maxReq = Math.max(...currentChart.req) * 1.15;
  const minLat = Math.min(...currentChart.lat) - 20;
  const maxLat = Math.max(...currentChart.lat) + 20;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 1: OVERVIEW — DIALOGUE CONTROL CENTER
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-7" style={{ animation: "fadeSlideUp 0.4s cubic-bezier(0.4,0,0.2,1) both" }}>
          <style>{`
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(14px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes borderGlow { 0%,100%{opacity:.5}50%{opacity:1} }
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulseRing {
              0%{transform:scale(1);opacity:.6} 70%{transform:scale(2);opacity:0} 100%{transform:scale(2);opacity:0}
            }
            .stagger-1{animation:fadeSlideUp .42s cubic-bezier(.4,0,.2,1) .04s both}
            .stagger-2{animation:fadeSlideUp .42s cubic-bezier(.4,0,.2,1) .10s both}
            .stagger-3{animation:fadeSlideUp .42s cubic-bezier(.4,0,.2,1) .17s both}
            .stagger-4{animation:fadeSlideUp .42s cubic-bezier(.4,0,.2,1) .24s both}
            .stagger-5{animation:fadeSlideUp .42s cubic-bezier(.4,0,.2,1) .31s both}
            .glass-card{background:linear-gradient(135deg,rgba(255,255,255,.03) 0%,rgba(255,255,255,.015) 100%);border:1px solid rgba(255,255,255,.07);border-radius:18px;backdrop-filter:blur(14px)}
            .feed-row-enter{animation:slideDown .22s cubic-bezier(.4,0,.2,1) both}
            .shimmer-border{animation:borderGlow 3s ease-in-out infinite}
          `}</style>

          {/* ── HERO ─────────────────────────────────────────────────────── */}
          <section className="relative overflow-hidden rounded-[22px] border border-white/[0.07] p-7 sm:p-10"
            style={{ background: "linear-gradient(135deg, #080F1D 0%, #060C18 55%, #04091460 100%)" }}>
            {/* Neural mesh SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.055 }} preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="ng1" cx="20%" cy="30%" r="50%"><stop offset="0%" stopColor="#35E0F5"/><stop offset="100%" stopColor="transparent"/></radialGradient>
                <radialGradient id="ng2" cx="85%" cy="20%" r="45%"><stop offset="0%" stopColor="#9A8CFF"/><stop offset="100%" stopColor="transparent"/></radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#ng1)"/>
              <rect width="100%" height="100%" fill="url(#ng2)"/>
              {[0,1,2,3,4,5,6,7].map(i=><line key={i} x1={`${i*14}%`} y1="0%" x2={`${i*14+7}%`} y2="100%" stroke="#35E0F5" strokeWidth="0.5" strokeDasharray="4 18"/>)}
              {[0,1,2,3].map(i=><line key={i} x1="0%" y1={`${i*30+10}%`} x2="100%" y2={`${i*30+10}%`} stroke="#9A8CFF" strokeWidth="0.5" strokeDasharray="3 22"/>)}
            </svg>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="relative flex items-center justify-center w-3 h-3">
                    <span className="absolute w-2 h-2 rounded-full bg-[#35E0F5]" style={{animation:"pulseRing 2s ease-out infinite"}} />
                    <span className="absolute w-2 h-2 rounded-full bg-[#35E0F5] opacity-40" style={{animation:"pulseRing 2s ease-out .4s infinite"}} />
                    <span className="w-2 h-2 rounded-full bg-[#35E0F5] relative" style={{boxShadow:"0 0 8px #35E0F5"}} />
                  </div>
                  <span className="text-[10.5px] font-mono font-bold tracking-[0.26em] text-[#35E0F5] uppercase">Autonomous Infrastructure</span>
                </div>
                <h1 className="text-[2.5rem] sm:text-5xl font-black tracking-tight leading-[1.05]"
                  style={{background:"linear-gradient(135deg,#E8EEF9 0%,#B8C8E8 40%,#35E0F5 70%,#9A8CFF 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                  Dialogue<br/>Control Center
                </h1>
                <p className="text-[#7A8FA8] text-sm mt-3 max-w-xl leading-[1.7]">
                  Monitor real-time NPC intelligence, cryptographic{" "}
                  <span className="text-[#35E0F5] font-semibold font-mono">x402</span> payment settlements, and vector memory RAG latency across every active session.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                <button onClick={()=>changeTab("sandbox")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] hover:border-white/[0.24] text-[13px] font-semibold text-[#9AA8C0] hover:text-white transition-all duration-200">
                  <Play className="w-3.5 h-3.5"/>&nbsp;Prompt Sandbox
                </button>
                <button onClick={()=>{setShowDeployModal(true);setDeployStep("form");}}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13px] font-bold text-[#04121C] transition-all duration-200"
                  style={{background:"linear-gradient(135deg,#35E0F5 0%,#2F8CF6 100%)",boxShadow:"0 0 32px -6px rgba(53,224,245,.55),0 4px 18px rgba(53,224,245,.28)"}}>
                  <Plus className="w-4 h-4 stroke-[2.5]"/>&nbsp;Create Persona
                </button>
              </div>
            </div>
          </section>

          {/* ── KPI CARDS ────────────────────────────────────────────────── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-1">
            {[
              {label:"Total Queries",Icon:Activity,color:"#35E0F5",dim:"rgba(53,224,245,.12)",dimBorder:"rgba(53,224,245,.2)",badge:"+18.4%",badgeColor:"#3DDC97",value:queryCount.toLocaleString(),sub:"Real-time multi-turn generations",footer:["24H TREND","PEAK 184/hr"],pts:"0,34 20,30 40,32 60,24 80,26 100,18 120,21 140,12 160,15 180,8 200,10",poly:"0,34 20,30 40,32 60,24 80,26 100,18 120,21 140,12 160,15 180,8 200,10 200,44 0,44",gradId:"sg1x"},
              {label:"x402 Revenue",Icon:Coins,color:"#FFC454",dim:"rgba(255,196,84,.12)",dimBorder:"rgba(255,196,84,.2)",badge:"+12 tx",badgeColor:"#3DDC97",value:`${(queryCount*0.01).toFixed(2)} USDC`,sub:"Settled on Base Sepolia",footer:["24H TREND","AVG 0.01/CALL"],pts:"0,36 25,33 50,35 75,27 100,29 125,20 150,22 175,14 200,12",poly:"0,36 25,33 50,35 75,27 100,29 125,20 150,22 175,14 200,12 200,44 0,44",gradId:"sg2x"},
              {label:"NPC Substrates",Icon:Bot,color:"#3DDC97",dim:"rgba(61,220,151,.12)",dimBorder:"rgba(61,220,151,.2)",badge:"Optimal",badgeColor:"#3DDC97",value:"4",sub:"Live persona engines",footer:["24H TREND","0 RESTARTS"],pts:"0,22 30,20 60,24 90,19 120,22 150,18 180,21 200,19",poly:"0,22 30,20 60,24 90,19 120,22 150,18 180,21 200,19 200,44 0,44",gradId:"sg3x"},
              {label:"API Infrastructure",Icon:Key,color:"#9A8CFF",dim:"rgba(154,140,255,.12)",dimBorder:"rgba(154,140,255,.2)",badge:"99.98% Up",badgeColor:"#3DDC97",value:"2",sub:"Active client tokens",footer:["24H TREND","P50 · 41MS"],pts:"0,18 25,20 50,16 75,22 100,17 125,19 150,15 175,18 200,16",poly:"0,18 25,20 50,16 75,22 100,17 125,19 150,15 175,18 200,16 200,44 0,44",gradId:"sg4x"},
            ].map(({label,Icon,color,dim,dimBorder,badge,badgeColor,value,sub,footer,pts,poly,gradId})=>(
              <div key={label} className="glass-card p-5 flex flex-col gap-2 hover:border-white/[0.14] transition-all duration-200 cursor-default"
                onMouseEnter={e=>(e.currentTarget.style.boxShadow=`0 0 42px -12px ${color}40`)}
                onMouseLeave={e=>(e.currentTarget.style.boxShadow="")}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#5E6E89]">{label}</span>
                  <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{background:dim,boxShadow:`inset 0 0 0 1px ${dimBorder},0 0 12px ${color}12`}}>
                    <Icon className="w-4 h-4 stroke-[2]" style={{color}}/>
                  </div>
                </div>
                <div className="flex items-end gap-2.5 mt-1">
                  <span className="text-[36px] font-black tracking-tight text-white font-mono leading-none" style={{color:label==="NPC Substrates"?color:undefined}}>{value}</span>
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full mb-1.5" style={{color:badgeColor,background:`${badgeColor}18`,border:`1px solid ${badgeColor}40`}}>{badge}</span>
                </div>
                <div className="text-[11.5px] text-[#5E6E89]">{sub}</div>
                <svg viewBox="0 0 200 44" className="w-full h-9 mt-1 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
                      <stop offset="100%" stopColor={color} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <polygon points={poly} fill={`url(#${gradId})`}/>
                  <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:`drop-shadow(0 0 4px ${color}90)`}}/>
                </svg>
                <div className="flex justify-between text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-[#5E6E89]">
                  <span>{footer[0]}</span><span>{footer[1]}</span>
                </div>
              </div>
            ))}
          </section>

          {/* ── CHART + PROTOCOL ─────────────────────────────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 stagger-2">
            {/* Chart */}
            <div className="lg:col-span-8 glass-card p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-base font-bold text-[#E8EEF9] tracking-tight">Inference Traffic &amp; Latency Spectrum</div>
                  <div className="text-[12px] text-[#5E6E89] mt-0.5">Aggregated dialogue requests across all active client sessions.</div>
                </div>
                <div className="flex items-center gap-4 flex-wrap flex-shrink-0">
                  <div className="flex items-center gap-3 text-[11.5px] text-[#9AA8C0]">
                    <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#35E0F5]" style={{boxShadow:"0 0 6px #35E0F5"}}/>Requests</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#9A8CFF]" style={{boxShadow:"0 0 6px #9A8CFF"}}/>Avg <b className="font-mono text-[#9A8CFF] ml-0.5">378ms</b></span>
                  </div>
                  <div className="inline-flex items-center p-0.5 rounded-[9px] bg-white/[0.05] border border-white/[0.09]">
                    {(["7D","30D","90D"] as const).map(r=>(
                      <button key={r} onClick={()=>setTimeRange(r)}
                        className={`px-3 py-1 rounded-[7px] text-[11px] font-mono font-semibold transition-all ${timeRange===r?"text-[#35E0F5]":"text-[#5E6E89] hover:text-[#E8EEF9]"}`}
                        style={timeRange===r?{background:"rgba(53,224,245,.14)",boxShadow:"inset 0 0 0 1px rgba(53,224,245,.28),0 0 12px rgba(53,224,245,.1)"}:{}}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative">
                <svg viewBox="0 0 760 250" className="w-full h-64 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="barGradR2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#46E8FA"/><stop offset="45%" stopColor="#1EA8C8"/><stop offset="100%" stopColor="#083A4E"/>
                    </linearGradient>
                  </defs>
                  {[0,1,2,3,4].map(i=>{
                    const y=20+(200*i)/4;
                    return(<g key={i}><line x1={46} y1={y} x2={744} y2={y} stroke="rgba(148,163,184,.065)" strokeWidth="1" strokeDasharray="4 8"/><text x={36} y={y+4} textAnchor="end" fill="#5E6E89" fontSize="10" fontFamily="monospace">{Math.round(maxReq*(1-i/4))}</text></g>);
                  })}
                  {currentChart.req.map((v,i)=>{
                    const slot=(760-46-16)/currentChart.req.length;
                    const x=46+(i+.5)*slot;
                    const barH=(v/maxReq)*200;
                    const y=220-barH;
                    const barW=Math.min(timeRange==="7D"?40:18,slot*.62);
                    return(<rect key={i} x={x-barW/2} y={y} width={barW} height={Math.max(3,barH)} rx={5} fill="url(#barGradR2)" style={{opacity:activeTooltip?.index===i?1:.78,cursor:"pointer"}} onMouseEnter={()=>setActiveTooltip({index:i,x,y})} onMouseLeave={()=>setActiveTooltip(null)}/>);
                  })}
                  <path d={currentChart.lat.reduce((acc,v,i)=>{const slot=(760-46-16)/currentChart.lat.length;const x=46+(i+.5)*slot;const y=20+(1-(v-minLat)/(maxLat-minLat))*200;return acc+(i===0?`M ${x} ${y}`:`L ${x} ${y}`)},"")} fill="none" stroke="#9A8CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{filter:"drop-shadow(0 0 6px rgba(154,140,255,.6))"}}/>
                  {currentChart.lat.map((v,i)=>{const slot=(760-46-16)/currentChart.lat.length;const x=46+(i+.5)*slot;const y=20+(1-(v-minLat)/(maxLat-minLat))*200;return<circle key={i} cx={x} cy={y} r="3.5" fill="#060C18" stroke="#9A8CFF" strokeWidth="2.2" style={{filter:"drop-shadow(0 0 4px rgba(154,140,255,.5))"}}/>;})}
                  {currentChart.labels.map((lab,i)=>{const slot=(760-46-16)/currentChart.labels.length;const x=46+(i+.5)*slot;return<text key={i} x={x} y={242} textAnchor="middle" fill="#5E6E89" fontSize="10" fontFamily="monospace">{lab}</text>;})}
                </svg>
                {activeTooltip&&(
                  <div className="absolute z-10 pointer-events-none rounded-[14px] p-3 min-w-[140px]"
                    style={{left:`${(activeTooltip.x/760)*100}%`,top:`${Math.max(0,activeTooltip.y-70)}px`,transform:"translateX(-50%)",background:"rgba(8,15,29,.92)",border:"1px solid rgba(53,224,245,.22)",backdropFilter:"blur(16px)",boxShadow:"0 8px 32px rgba(0,0,0,.6),0 0 20px rgba(53,224,245,.08)"}}>
                    <div className="text-[11px] font-bold text-[#35E0F5] mb-1.5 font-mono">{currentChart.labels[activeTooltip.index]}</div>
                    <div className="flex justify-between gap-4 text-[11.5px] font-mono"><span className="text-[#5E6E89]">Requests</span><span className="text-[#35E0F5] font-bold">{currentChart.req[activeTooltip.index].toLocaleString()}</span></div>
                    <div className="flex justify-between gap-4 text-[11.5px] font-mono mt-0.5"><span className="text-[#5E6E89]">Latency</span><span className="text-[#9A8CFF] font-bold">{currentChart.lat[activeTooltip.index]}ms</span></div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-3 pt-4 mt-2 border-t border-white/[0.07]">
                {[{label:"Peak day",val:`${currentChart.peak.toLocaleString()} req`,c:"#35E0F5"},{label:`${timeRange} volume`,val:`${currentChart.total.toLocaleString()} dialogues`,c:"#9A8CFF"},{label:"Revenue window",val:`${currentChart.revenue} USDC settled`,c:"#FFC454"}].map(({label,val,c})=>(
                  <div key={label} className="text-[11.5px] text-[#5E6E89]">{label}<div className="text-[14px] font-mono font-semibold mt-0.5" style={{color:c}}>{val}</div></div>
                ))}
              </div>
            </div>

            {/* Protocol Facilitator */}
            <div className="lg:col-span-4 glass-card p-5 sm:p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-6 right-6 h-[1px] shimmer-border" style={{background:"linear-gradient(90deg,transparent,rgba(255,196,84,.65),transparent)"}}/>
              <div className="flex items-center gap-2 text-[9.5px] font-mono font-bold tracking-[0.2em] text-[#FFC454] mb-3">
                <ShieldCheck className="w-3.5 h-3.5"/>X402 PROTOCOL
                <span className="ml-auto text-[9px] tracking-[0.14em] px-2 py-0.5 rounded-full font-bold text-[#3DDC97]" style={{background:"rgba(61,220,151,.12)",border:"1px solid rgba(61,220,151,.32)"}}>ACTIVE</span>
              </div>
              <div className="text-[16px] font-bold text-[#E8EEF9]">Cryptographic Facilitator</div>
              <p className="text-[12px] text-[#9AA8C0] leading-relaxed mt-1.5 mb-4">Autonomous per-query micro-settlement via EIP-191 signatures on Base Sepolia — no checkout, no friction.</p>
              <div className="border-t border-white/[0.07] divide-y divide-white/[0.06] mb-4">
                <div className="flex items-center justify-between py-2.5 text-[12px]"><span className="text-[#5E6E89]">Chain ID</span><span className="font-mono text-[#E8EEF9]">84532 <span className="text-[#5E6E89]">Base Sepolia</span></span></div>
                <div className="flex items-center justify-between py-2.5 text-[12px]"><span className="text-[#5E6E89]">Fee / Dialogue</span><span className="font-mono text-[#FFC454] font-bold">0.0100 USDC</span></div>
                <div className="flex items-center justify-between py-2.5 text-[12px]"><span className="text-[#5E6E89]">Merchant Vault</span>
                  <span className="font-mono text-[#35E0F5] flex items-center gap-1.5">0x9876…3210
                    <button onClick={()=>{navigator.clipboard.writeText("0x9876a3f9c21d4e5b8a0f6c7d9e2f4a1b5c8d3210");setCopiedVault(true);setTimeout(()=>setCopiedVault(false),1500)}} className="text-[#5E6E89] hover:text-[#35E0F5] transition-colors p-0.5">
                      {copiedVault?<Check className="w-3 h-3 text-[#3DDC97]"/>:<Copy className="w-3 h-3"/>}
                    </button>
                  </span>
                </div>
              </div>
              <div className="border-t border-white/[0.07] pt-3">
                <div className="flex items-center gap-2 text-[9.5px] font-mono font-bold tracking-[0.2em] text-[#5E6E89] mb-2.5"><span className="pulse-dot-green"/>LIVE SETTLEMENTS</div>
                <div className="space-y-1.5">
                  {settlementFeed.map((item,idx)=>(
                    <div key={item.id} className="feed-row-enter flex items-center gap-2 py-1.5 px-2.5 rounded-[10px] bg-white/[0.025] border border-white/[0.05]">
                      <div className="w-1 h-6 rounded-full flex-shrink-0" style={{background:"#3DDC97",opacity:.7-idx*.12,boxShadow:"0 0 6px rgba(61,220,151,.5)"}}/>
                      <Zap className="w-3 h-3 text-[#3DDC97] flex-shrink-0 stroke-[2.4]"/>
                      <span className="font-mono text-[11px] text-[#9AA8C0] flex-1">{item.hash}</span>
                      <span className="font-mono text-[11px] text-[#3DDC97] font-bold">{item.amount}</span>
                      <span className="text-[10px] text-[#5E6E89] w-12 text-right">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── NPC SUBSTRATE ROW ────────────────────────────────────────── */}
          <section className="stagger-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] font-bold text-[#E8EEF9] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#35E0F5]" style={{boxShadow:"0 0 8px rgba(53,224,245,.7)"}}/>
                Active NPC Substrates
              </div>
              <button onClick={()=>changeTab("profiles")} className="text-[12px] font-semibold text-[#35E0F5] hover:text-white transition-colors">Manage all →</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(PERSONAS).map(([name,p])=>(
                <button key={name} onClick={()=>changeTab("profiles")}
                  className="glass-card p-4 flex flex-col items-center text-center hover:border-white/[0.14] transition-all duration-200 cursor-pointer"
                  onMouseEnter={e=>(e.currentTarget.style.boxShadow=`0 0 28px -8px ${p.color}55`)}
                  onMouseLeave={e=>(e.currentTarget.style.boxShadow="")}>
                  <div className="relative mb-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-mono text-[12px] font-black"
                      style={{backgroundColor:p.dim,color:p.color,border:`1.5px solid ${p.color}50`,boxShadow:`0 0 14px ${p.color}30`}}>
                      {p.initials}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#060C18]"
                      style={{backgroundColor:p.status==="live"?"#3DDC97":p.status==="training"?"#FFC454":"#5E6E89"}}/>
                  </div>
                  <div className="text-[12px] font-bold text-[#E8EEF9] leading-tight">{name}</div>
                  <div className="text-[10px] text-[#5E6E89] mt-0.5 leading-tight line-clamp-2">{p.role}</div>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold" style={{color:p.color}}>{p.rpm>0?`${p.rpm}`:"—"}</span>
                    <span className="text-[9px] text-[#5E6E89]">rpm</span>
                  </div>
                  <div className="w-full h-[2px] rounded-full bg-white/[0.07] mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${Math.min(100,Math.max(10,(p.rpm/150)*100))}%`,backgroundColor:p.color,boxShadow:`0 0 6px ${p.color}80`}}/>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ── ACTION SHORTCUTS ─────────────────────────────────────────── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger-4">
            {([
              {tab:"profiles" as const,color:"#35E0F5",Icon:Bot,title:"NPC Personas",desc:"Configure lore & RAG memory"},
              {tab:"voice" as const,color:"#9A8CFF",Icon:Volume2,title:"Neural Studio",desc:"Zero-shot TTS voice engine"},
              {tab:"sandbox" as const,color:"#3DDC97",Icon:Play,title:"Dialogue Test",desc:"Run prompt simulations"},
              {tab:"demo" as const,color:"#FFC454",Icon:Gamepad2,title:"Game Canvas",desc:"2D interactive world"},
            ]).map(({tab,color,Icon,title,desc})=>(
              <button key={tab} onClick={()=>changeTab(tab)}
                className="glass-card p-4 flex items-center gap-3.5 group text-left hover:border-white/[0.14] transition-all duration-200"
                onMouseEnter={e=>(e.currentTarget.style.boxShadow=`0 0 28px -10px ${color}50`)}
                onMouseLeave={e=>(e.currentTarget.style.boxShadow="")}>
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{background:`${color}18`,boxShadow:`inset 0 0 0 1px ${color}28,0 0 16px ${color}14`}}>
                  <Icon className="w-5 h-5 stroke-[1.8]" style={{color}}/>
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#E8EEF9] group-hover:text-white transition-colors">{title}</div>
                  <div className="text-[11.5px] text-[#5E6E89] truncate">{desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#5E6E89] group-hover:translate-x-0.5 transition-transform ml-auto flex-shrink-0"/>
              </button>
            ))}
          </section>

          {/* ── RECENT DIALOGUE LOGS ─────────────────────────────────────── */}
          <section className="glass-card p-5 sm:p-6 stagger-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-1 h-4 rounded-full bg-[#9A8CFF]" style={{boxShadow:"0 0 8px rgba(154,140,255,.7)"}}/>
                <span className="text-[15px] font-bold text-[#E8EEF9]">Recent Dialogue Logs</span>
              </div>
              <button onClick={()=>changeTab("logs")} className="text-[12px] font-semibold text-[#35E0F5] hover:text-white transition-colors">Open all →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.07] text-[10px] font-mono uppercase tracking-[0.14em] text-[#5E6E89]">
                    {["Session","Persona","Last Dialogue","Latency","Fee","Status"].map(h=><th key={h} className="py-2.5 px-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {sessions.slice(0,5).map((session)=>{
                    const persona=PERSONAS[session.persona as keyof typeof PERSONAS];
                    return(
                      <tr key={session.id} onClick={()=>setActiveSession(session)}
                        className="group cursor-pointer hover:bg-white/[0.03] transition-colors duration-150">
                        <td className="py-3 px-3 font-mono text-[11px] text-[#5E6E89] font-semibold">{session.id}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {persona&&<div className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[9px] font-black font-mono flex-shrink-0" style={{backgroundColor:persona.dim,color:persona.color}}>{persona.initials}</div>}
                            <span className="text-[12.5px] font-bold text-[#E8EEF9] group-hover:text-[#35E0F5] transition-colors">{session.persona}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[12px] text-[#9AA8C0] max-w-[240px] truncate">{session.excerpt}</td>
                        <td className="py-3 px-3"><span className="font-mono text-[11.5px] font-bold" style={{color:session.lat<380?"#3DDC97":"#FFC454"}}>{session.lat}ms</span></td>
                        <td className="py-3 px-3 font-mono text-[11.5px] text-[#9AA8C0]">{session.fee.toFixed(4)} USDC</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full ${session.status==="settled"?"text-[#3DDC97] bg-[rgba(61,220,151,.1)] border border-[rgba(61,220,151,.25)]":"text-[#FFC454] bg-[rgba(255,196,84,.1)] border border-[rgba(255,196,84,.25)]"}`}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:session.status==="settled"?"#3DDC97":"#FFC454"}}/>
                            {session.status==="settled"?"Settled":"Processing"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      )}



      {/* ═══════════════════════════════════════════════════════════════
          VIEW 2: NPC PROFILES
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "profiles" && (
        <div className="space-y-6">
          <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div>
              <div className="flex items-center gap-2 text-[10.5px] font-mono tracking-[0.24em] font-bold text-[#35E0F5] uppercase">
                <span className="pulse-dot-cyan"></span>
                PERSONA SUBSTRATES
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#E8EEF9] mt-2 font-display">
                NPC Profiles
              </h1>
              <p className="text-[#9AA8C0] text-[13.5px] mt-2 max-w-2xl leading-relaxed">
                Deploy autonomous AI personas with persistent vector memory, custom voice models, and per-turn x402 micro-settlement. Each substrate runs its own lore, RAG corpus, and personality weights.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
              <button
                onClick={() => changeTab("sandbox")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] hover:border-white/[0.20] text-[13px] font-semibold text-[#9AA8C0] hover:text-[#E8EEF9] transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test in Sandbox</span>
              </button>
              <button
                onClick={() => { setShowDeployModal(true); setDeployStep("form"); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-gradient-to-br from-[#35E0F5] to-[#2F8CF6] hover:brightness-110 text-[#04121C] text-[13px] font-bold transition-all shadow-[0_4px_18px_rgba(53,224,245,0.28)]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Persona</span>
              </button>
            </div>
          </section>

          {/* KPI Mini */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="ih-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#5E6E89]">Total Personas</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">6</div>
              <div className="text-[11.5px] text-[#5E6E89] mt-0.5">Across Cyberpunk Realm</div>
            </div>
            <div className="ih-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#5E6E89]">Live Substrates</div>
              <div className="text-2xl font-bold font-mono text-[#3DDC97] mt-1">4</div>
              <div className="text-[11.5px] text-[#5E6E89] mt-0.5">Serving live players</div>
            </div>
            <div className="ih-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#5E6E89]">RAG Documents</div>
              <div className="text-2xl font-bold font-mono text-[#9A8CFF] mt-1">1,284</div>
              <div className="text-[11.5px] text-[#5E6E89] mt-0.5">Vector-indexed lore chunks</div>
            </div>
            <div className="ih-card p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#5E6E89]">Memory Retention</div>
              <div className="text-2xl font-bold font-mono text-[#FFC454] mt-1">96.4%</div>
              <div className="text-[11.5px] text-[#5E6E89] mt-0.5">30d context recall rate</div>
            </div>
          </section>

          {/* Filter Toolbar */}
          <section className="ih-card p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-[#5E6E89] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search personas by name, archetype, or sector…"
                value={personaSearch}
                onChange={(e) => setPersonaSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-[10px] bg-[#080E1B] border border-white/[0.10] text-[13px] text-white focus:outline-none focus:border-[#35E0F5]"
              />
            </div>
            <select
              value={personaFilter}
              onChange={(e) => setPersonaFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 rounded-[10px] bg-[#080E1B] border border-white/[0.10] text-[13px] text-white focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="live">Live</option>
              <option value="training">Training</option>
              <option value="draft">Draft</option>
            </select>
          </section>

          {/* Personas Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(PERSONAS)
              .filter(([name, p]) => {
                const matchSearch = !personaSearch || name.toLowerCase().includes(personaSearch.toLowerCase()) || p.role.toLowerCase().includes(personaSearch.toLowerCase());
                const matchFilter = personaFilter === "all" || p.status === personaFilter;
                return matchSearch && matchFilter;
              })
              .map(([name, p]) => (
                <div key={name} className="ih-card ih-card-hover p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-11 h-11 rounded-[13px] font-mono text-sm font-bold flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: p.dim, color: p.color, border: `1px solid ${p.color}40` }}
                      >
                        {p.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[15px] font-bold text-white flex items-center gap-2">
                          {name}
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: p.status === "live" ? "rgba(61,220,151,0.11)" : p.status === "training" ? "rgba(255,196,84,0.12)" : "rgba(148,163,184,0.10)",
                              color: p.status === "live" ? "var(--green)" : p.status === "training" ? "var(--amber)" : "#8C9AB5"
                            }}
                          >
                            {p.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[12px] text-[#5E6E89]">{p.role}</div>
                      </div>
                    </div>

                    <p className="text-[12.5px] text-[#9AA8C0] leading-relaxed line-clamp-3">
                      {p.lore}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.tags.map((tag, i) => (
                        <span key={i} className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[#9AA8C0]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="font-mono text-sm font-semibold" style={{ color: p.color }}>{p.rpm > 0 ? p.rpm : "—"}</div>
                        <div className="text-[9.5px] font-mono uppercase text-[#5E6E89]">req/min</div>
                      </div>
                      <div>
                        <div className="font-mono text-sm font-semibold text-white">{p.lat > 0 ? `${p.lat}ms` : "—"}</div>
                        <div className="text-[9.5px] font-mono uppercase text-[#5E6E89]">p95 latency</div>
                      </div>
                      <div>
                        <div className="font-mono text-sm font-semibold text-[#FFC454]">{p.rev}</div>
                        <div className="text-[9.5px] font-mono uppercase text-[#5E6E89]">USDC/24h</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => { setSbPersona(name); changeTab("sandbox"); }}
                        className="flex-1 py-1.5 rounded-[9px] bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-[#9AA8C0] hover:text-white transition"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => { setShowDeployModal(true); setDeployStep("form"); }}
                        className="flex-1 py-1.5 rounded-[9px] bg-[#35E0F5]/15 hover:bg-[#35E0F5]/25 border border-[#35E0F5]/30 text-xs font-bold text-[#35E0F5] transition"
                      >
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 3: DIALOGUE LOGS
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div>
              <div className="flex items-center gap-2 text-[10.5px] font-mono tracking-[0.24em] font-bold text-[#35E0F5] uppercase">
                <span className="pulse-dot-cyan"></span>
                SESSION INTELLIGENCE
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#E8EEF9] mt-2 font-display">
                Dialogue Logs
              </h1>
              <p className="text-[#9AA8C0] text-[13.5px] mt-2 max-w-2xl leading-relaxed">
                Every multi-turn conversation across every substrate — with retrieval traces, latency breakdowns, and on-chain x402 settlement receipts. Click any row to replay the full session.
              </p>
            </div>
          </section>

          {/* Filter Toolbar */}
          <section className="ih-card p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-[#5E6E89] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search session ID, dialogue text, or player address…"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-[10px] bg-[#080E1B] border border-white/[0.10] text-[13px] text-white focus:outline-none focus:border-[#35E0F5]"
              />
            </div>
            <select
              value={logPersona}
              onChange={(e) => setLogPersona(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 rounded-[10px] bg-[#080E1B] border border-white/[0.10] text-[13px] text-white focus:outline-none"
            >
              <option value="all">All personas</option>
              {Object.keys(PERSONAS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <select
              value={logStatus}
              onChange={(e) => setLogStatus(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 rounded-[10px] bg-[#080E1B] border border-white/[0.10] text-[13px] text-white focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="settled">Settled</option>
              <option value="processing">Processing</option>
            </select>
          </section>

          {/* Logs Table */}
          <section className="ih-card p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] font-mono uppercase tracking-[0.14em] text-[#5E6E89]">
                    <th className="py-2.5 px-3">Session</th>
                    <th className="py-2.5 px-3">Persona</th>
                    <th className="py-2.5 px-3">Player</th>
                    <th className="py-2.5 px-3">Dialogue</th>
                    <th className="py-2.5 px-3">Turns</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Fee</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-[12.5px]">
                  {sessions
                    .filter(s => {
                      const matchSearch = !logSearch || s.id.toLowerCase().includes(logSearch.toLowerCase()) || s.excerpt.toLowerCase().includes(logSearch.toLowerCase()) || s.player.includes(logSearch);
                      const matchP = logPersona === "all" || s.persona === logPersona;
                      const matchS = logStatus === "all" || (s.status || "settled") === logStatus;
                      return matchSearch && matchP && matchS;
                    })
                    .map((session) => (
                      <tr
                        key={session.id}
                        onClick={() => setActiveSession(session)}
                        className="hover:bg-[rgba(53,224,245,0.035)] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3 font-mono text-[11.5px] text-[#9AA8C0] font-semibold">
                          {session.id}
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#E8EEF9] group-hover:text-[#35E0F5] transition-colors">
                          {session.persona}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11.5px] text-[#5E6E89]">
                          {session.player}
                        </td>
                        <td className="py-3 px-3 text-[#9AA8C0] max-w-[260px] truncate">
                          {session.excerpt}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11.5px] text-[#E8EEF9]">
                          {session.turns}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11.5px] text-[#3DDC97] font-semibold">
                          {session.lat}ms
                        </td>
                        <td className="py-3 px-3 font-mono text-[11.5px] text-[#9AA8C0]">
                          {session.fee.toFixed(4)} USDC
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className="inline-flex items-center gap-1.5 text-[10.5px] font-bold font-mono px-2.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: session.status === "processing" ? "rgba(255,196,84,0.12)" : "rgba(61,220,151,0.11)",
                              color: session.status === "processing" ? "var(--amber)" : "var(--green)"
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: session.status === "processing" ? "var(--amber)" : "var(--green)" }}
                            />
                            {session.status === "processing" ? "Processing" : "Settled"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 4: OMNIVOICE STUDIO
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "voice" && (
        <div className="space-y-6">
          <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div>
              <div className="flex items-center gap-2 text-[10.5px] font-mono tracking-[0.24em] font-bold text-[#9A8CFF] uppercase">
                <span className="pulse-dot-violet"></span>
                NEURAL VOICE ENGINE
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#E8EEF9] mt-2 font-display">
                OmniVoice Studio
              </h1>
              <p className="text-[#9AA8C0] text-[13.5px] mt-2 max-w-2xl leading-relaxed">
                Zero-shot text-to-speech tuned for game dialogue. Pick a voice profile, direct emotion and pace, and generate lines your NPCs can speak in-engine — streamed as 24kHz PCM with lip-sync markers.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Voice Profiles Column */}
            <div className="lg:col-span-4 ih-card p-5 space-y-3">
              <div className="text-[15px] font-bold text-white mb-2">Voice Profiles</div>
              <div className="space-y-2">
                {VOICE_PROFILES.map((vp) => (
                  <div
                    key={vp.name}
                    onClick={() => {
                      setSelectedVoice(vp);
                      setTtsPitch(vp.pitch);
                      setTtsRate(vp.rate);
                    }}
                    className={`p-3.5 rounded-[12px] border cursor-pointer transition-all ${
                      selectedVoice.name === vp.name
                        ? "bg-[#9A8CFF]/15 border-[#9A8CFF] shadow-[0_0_15px_rgba(154,140,255,0.2)]"
                        : "bg-white/[0.03] border-white/[0.08] hover:border-white/[0.16]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-sm">{vp.name}</div>
                      <span className="text-[10.5px] font-mono text-[#9AA8C0]">{vp.desc}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {vp.traits.map((t, i) => (
                        <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#9AA8C0]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Synthesis Playground */}
            <div className="lg:col-span-8 ih-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[16px] font-bold text-white">Synthesis Playground</div>
                  <div className="text-xs text-[#5E6E89]">Generate dialogue audio with selected profile.</div>
                </div>
                <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-[#9A8CFF]/15 text-[#9A8CFF] border border-[#9A8CFF]/30">
                  ● {selectedVoice.name}
                </span>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono uppercase tracking-wider text-[#5E6E89] mb-2 font-bold">
                  Dialogue Line
                </label>
                <textarea
                  rows={3}
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  className="w-full p-3.5 rounded-[10px] bg-[#080E1B] border border-white/[0.10] text-sm text-white font-sans focus:outline-none focus:border-[#9A8CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10.5px] font-mono uppercase tracking-wider text-[#5E6E89] mb-1 font-bold">
                    Speed: {ttsRate.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.3"
                    step="0.05"
                    value={ttsRate}
                    onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                    className="w-full accent-[#9A8CFF]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-mono uppercase tracking-wider text-[#5E6E89] mb-1 font-bold">
                    Pitch: {ttsPitch.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.05"
                    value={ttsPitch}
                    onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                    className="w-full accent-[#9A8CFF]"
                  />
                </div>
              </div>

              {/* Animated Waveform */}
              <div className="h-16 flex items-center justify-center gap-1 bg-[#060A13] border border-white/[0.08] rounded-[12px] px-4 overflow-hidden">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-[#9A8CFF] to-[#35E0F5] rounded-full transition-all duration-150"
                    style={{
                      height: isSpeaking
                        ? `${20 + Math.abs(Math.sin((i + Date.now() / 200) * 0.5)) * 75}%`
                        : `${10 + Math.abs(Math.sin(i * 0.4)) * 30}%`,
                      opacity: isSpeaking ? 1 : 0.4
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSpeak}
                  className="px-6 py-2.5 rounded-[10px] bg-gradient-to-r from-[#9A8CFF] to-[#35E0F5] text-black font-bold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(154,140,255,0.3)] transition hover:brightness-110"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isSpeaking ? "Stop Synthesis" : "Generate & Speak"}</span>
                </button>
                <span className="font-mono text-xs text-[#5E6E89]">~0.0004 USDC / line</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 5: DIALOGUE SANDBOX
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "sandbox" && (
        <div className="space-y-6">
          <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div>
              <div className="flex items-center gap-2 text-[10.5px] font-mono tracking-[0.24em] font-bold text-[#3DDC97] uppercase">
                <span className="pulse-dot-green"></span>
                PROMPT SIMULATION
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#E8EEF9] mt-2 font-display">
                Dialogue Sandbox
              </h1>
              <p className="text-[#9AA8C0] text-[13.5px] mt-2 max-w-2xl leading-relaxed">
                Test persona behavior before it goes live — adjust system prompts, RAG retrieval, and temperature in real time. Every simulated turn is a real x402 settlement on Base Sepolia.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Config Column */}
            <div className="lg:col-span-3 ih-card p-5 space-y-4">
              <div className="text-sm font-bold text-white uppercase tracking-wider font-mono">Simulation Config</div>
              <div>
                <label className="block text-[10px] font-mono text-[#5E6E89] uppercase tracking-wider mb-1.5">
                  Persona Substrate
                </label>
                <select
                  value={sbPersona}
                  onChange={(e) => {
                    setSbPersona(e.target.value);
                    const p = PERSONAS[e.target.value];
                    setSbMessages([{ role: "npc", text: p.greet, lat: 378 }]);
                  }}
                  className="w-full p-2.5 rounded-[10px] bg-[#080E1B] border border-white/[0.10] text-xs text-white"
                >
                  {Object.keys(PERSONAS).map(k => <option key={k} value={k}>{k} · {PERSONAS[k].role}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#5E6E89] uppercase tracking-wider mb-1.5">
                  System Prompt
                </label>
                <textarea
                  rows={4}
                  defaultValue={`You are ${sbPersona}, a cyberpunk entity in the Night Markets. Stay in character.`}
                  className="w-full p-2.5 rounded-[10px] bg-[#080E1B] border border-white/[0.10] text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2 border-t border-white/[0.08] space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#9AA8C0]">
                  <span>RAG Memory</span>
                  <span className="text-[#3DDC97] font-mono font-bold">Enabled</span>
                </div>
                <div className="flex justify-between items-center text-[#9AA8C0]">
                  <span>x402 Micropayments</span>
                  <span className="text-[#3DDC97] font-mono font-bold">Base Sepolia</span>
                </div>
              </div>
            </div>

            {/* Chat Column */}
            <div className="lg:col-span-6 ih-card p-4 flex flex-col justify-between h-[520px]">
              {/* Chat Thread */}
              <div ref={sbThreadRef} className="flex-1 overflow-y-auto space-y-3 p-2">
                {sbMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-[14px] text-xs leading-relaxed max-w-[85%] ${
                      msg.role === "user"
                        ? "ml-auto bg-gradient-to-br from-[#35E0F5]/15 to-[#2F8CF6]/15 border border-[#35E0F5]/30 text-white"
                        : "mr-auto bg-[#101A2E] border border-white/[0.10] text-[#E8EEF9]"
                    }`}
                  >
                    <span className="block text-[9.5px] font-mono uppercase tracking-wider opacity-70 mb-1">
                      {msg.role === "user" ? "You" : sbPersona}
                    </span>
                    {msg.text}
                    {msg.lat && (
                      <span className="block text-[9px] font-mono text-[#5E6E89] mt-1.5">
                        {msg.lat}ms · rag: 3 chunks · 0.0100 USDC
                      </span>
                    )}
                  </div>
                ))}
                {sbTyping && (
                  <div className="p-3 rounded-[14px] bg-[#101A2E] border border-white/[0.10] inline-flex items-center gap-1.5 text-xs text-[#5E6E89]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#35E0F5] animate-ping"></span>
                    <span>{sbPersona} is computing response…</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2 pt-3 border-t border-white/[0.08]">
                <input
                  type="text"
                  placeholder="Message the persona… (Press Enter)"
                  value={sbInput}
                  onChange={(e) => setSbInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendSandbox()}
                  className="flex-1 px-3.5 py-2.5 rounded-[10px] bg-[#080E1B] border border-white/[0.10] text-xs text-white focus:outline-none focus:border-[#35E0F5]"
                />
                <button
                  onClick={handleSendSandbox}
                  className="px-4 py-2.5 rounded-[10px] bg-[#35E0F5] text-black font-bold text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Session Meter */}
            <div className="lg:col-span-3 ih-card p-5 space-y-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#35E0F5] font-bold">
                Session Meter
              </div>
              <div className="text-center py-4 bg-[#080E1B] rounded-[12px] border border-white/[0.06]">
                <div className="text-3xl font-bold font-mono text-[#FFC454]">
                  {(sbTurnsCount * 0.01).toFixed(4)}
                </div>
                <div className="text-[10px] font-mono text-[#5E6E89] uppercase mt-1">USDC spent this session</div>
              </div>

              <div className="space-y-2 text-xs border-t border-white/[0.08] pt-3">
                <div className="flex justify-between text-[#9AA8C0]">
                  <span>Settled calls</span>
                  <b className="font-mono text-white">{sbTurnsCount}</b>
                </div>
                <div className="flex justify-between text-[#9AA8C0]">
                  <span>Fee per turn</span>
                  <b className="font-mono text-white">0.0100 USDC</b>
                </div>
                <div className="flex justify-between text-[#9AA8C0]">
                  <span>Avg latency</span>
                  <b className="font-mono text-[#3DDC97]">{sbAvgLat}ms</b>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 6: INTERACTIVE DEMO (GAME CANVAS)
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "demo" && (
        <div className="space-y-6">
          <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div>
              <div className="flex items-center gap-2 text-[10.5px] font-mono tracking-[0.24em] font-bold text-[#FFC454] uppercase">
                <span className="pulse-dot-amber"></span>
                LIVE WORLD STREAM
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#E8EEF9] mt-2 font-display">
                Interactive Game Canvas
              </h1>
              <p className="text-[#9AA8C0] text-[13.5px] mt-2 max-w-2xl leading-relaxed">
                A live slice of the Cyberpunk Realm. Click any glowing NPC marker in the world to open a dialogue session — the same substrate, memory, and x402 settlement pipeline your players hit in production.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* World Canvas */}
            <div className="lg:col-span-8 ih-card p-4 space-y-3">
              <div className="relative aspect-[16/10] bg-[#05080F] rounded-[12px] border border-white/[0.10] overflow-hidden">
                <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
                  <defs>
                    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A0F1F"/><stop offset="0.7" stopColor="#0D1526"/><stop offset="1" stopColor="#101D33"/></linearGradient>
                    <linearGradient id="bld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E1830"/><stop offset="1" stopColor="#070C17"/></linearGradient>
                  </defs>
                  <rect width="800" height="500" fill="url(#sky)"/>
                  <circle cx="650" cy="90" r="34" fill="rgba(154,140,255,0.10)"/>
                  <circle cx="650" cy="90" r="22" fill="rgba(232,238,249,0.08)"/>

                  <g fill="#0B1428" opacity="0.9">
                    <rect x="20" y="180" width="70" height="200"/>
                    <rect x="110" y="150" width="55" height="230"/>
                    <rect x="185" y="200" width="80" height="180"/>
                    <rect x="560" y="160" width="60" height="220"/>
                    <rect x="640" y="190" width="70" height="190"/>
                    <rect x="730" y="150" width="55" height="230"/>
                  </g>

                  <g fill="url(#bld)" stroke="rgba(53,224,245,0.18)" strokeWidth="1">
                    <rect x="280" y="140" width="90" height="260"/>
                    <rect x="400" y="110" width="70" height="290"/>
                    <rect x="490" y="170" width="60" height="230"/>
                  </g>

                  {/* Floor */}
                  <rect y="380" width="800" height="120" fill="#05080F"/>
                  <g stroke="rgba(53,224,245,0.22)" strokeWidth="1">
                    <line x1="0" y1="380" x2="800" y2="380"/>
                    <line x1="400" y1="380" x2="-120" y2="500"/>
                    <line x1="400" y1="380" x2="200" y2="500"/>
                    <line x1="400" y1="380" x2="600" y2="500"/>
                    <line x1="400" y1="380" x2="920" y2="500"/>
                  </g>
                </svg>

                {/* Markers */}
                <button
                  onClick={() => { setDemoPersona("VEX-7"); setDemoMessages([{ role: "npc", text: PERSONAS["VEX-7"].greet, lat: 342 }]); }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10 transition-transform ${demoPersona === "VEX-7" ? "scale-125" : "hover:scale-110"}`}
                  style={{ left: "24%", top: "66%" }}
                >
                  <span className="w-4 h-4 rounded-full border-2 border-[#35E0F5] bg-[#35E0F5]/30 shadow-[0_0_12px_#35E0F5]" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-[#35E0F5] border border-[#35E0F5]/30">VEX-7</span>
                </button>

                <button
                  onClick={() => { setDemoPersona("SABLE"); setDemoMessages([{ role: "npc", text: PERSONAS["SABLE"].greet, lat: 298 }]); }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10 transition-transform ${demoPersona === "SABLE" ? "scale-125" : "hover:scale-110"}`}
                  style={{ left: "70%", top: "58%" }}
                >
                  <span className="w-4 h-4 rounded-full border-2 border-[#9A8CFF] bg-[#9A8CFF]/30 shadow-[0_0_12px_#9A8CFF]" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-[#9A8CFF] border border-[#9A8CFF]/30">SABLE</span>
                </button>

                <button
                  onClick={() => { setDemoPersona("MIRAGE"); setDemoMessages([{ role: "npc", text: PERSONAS["MIRAGE"].greet, lat: 412 }]); }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10 transition-transform ${demoPersona === "MIRAGE" ? "scale-125" : "hover:scale-110"}`}
                  style={{ left: "47%", top: "78%" }}
                >
                  <span className="w-4 h-4 rounded-full border-2 border-[#3DDC97] bg-[#3DDC97]/30 shadow-[0_0_12px_#3DDC97]" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-[#3DDC97] border border-[#3DDC97]/30">MIRAGE</span>
                </button>
              </div>

              <div className="flex gap-2 text-xs font-mono text-[#5E6E89]">
                <span className="px-2 py-1 rounded bg-white/[0.04]">Click a marker to engage in-world</span>
                <span className="px-2 py-1 rounded bg-white/[0.04] text-[#3DDC97]">All entities live on Base Sepolia</span>
              </div>
            </div>

            {/* In-World Dialogue Chat */}
            <div className="lg:col-span-4 ih-card p-4 flex flex-col justify-between h-[460px]">
              <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
                <div
                  className="w-8 h-8 rounded-[9px] font-mono text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: PERSONAS[demoPersona].dim, color: PERSONAS[demoPersona].color }}
                >
                  {PERSONAS[demoPersona].initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{demoPersona}</div>
                  <div className="text-[10px] text-[#3DDC97] font-mono">In-World Session Active</div>
                </div>
              </div>

              <div ref={demoThreadRef} className="flex-1 overflow-y-auto space-y-3 p-2 my-2">
                {demoMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-[12px] text-xs leading-relaxed max-w-[90%] ${
                      msg.role === "user"
                        ? "ml-auto bg-[#35E0F5]/15 border border-[#35E0F5]/30 text-white"
                        : "mr-auto bg-[#101A2E] border border-white/[0.10] text-[#E8EEF9]"
                    }`}
                  >
                    <span className="block text-[9px] font-mono uppercase tracking-wider opacity-70 mb-1">
                      {msg.role === "user" ? "Player" : demoPersona}
                    </span>
                    {msg.text}
                  </div>
                ))}
                {demoTyping && (
                  <div className="text-[10px] font-mono text-[#5E6E89] animate-pulse">
                    {demoPersona} is typing…
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/[0.08]">
                <input
                  type="text"
                  placeholder={`Talk to ${demoPersona}…`}
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendDemo()}
                  className="flex-1 px-3 py-2 rounded-[9px] bg-[#080E1B] border border-white/[0.10] text-xs text-white focus:outline-none focus:border-[#35E0F5]"
                />
                <button
                  onClick={handleSendDemo}
                  className="px-3.5 py-2 rounded-[9px] bg-[#35E0F5] text-black font-bold text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 7: API KEYS
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "keys" && (
        <div className="space-y-6">
          <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div>
              <div className="flex items-center gap-2 text-[10.5px] font-mono tracking-[0.24em] font-bold text-[#35E0F5] uppercase">
                <span className="pulse-dot-cyan"></span>
                DEVELOPER ACCESS
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#E8EEF9] mt-2 font-display">
                API Keys
              </h1>
              <p className="text-[#9AA8C0] text-[13.5px] mt-2 max-w-2xl leading-relaxed">
                Authenticate your game client, backend, or CI pipeline. Requests are signed per-call and settled through the x402 facilitator.
              </p>
            </div>

            <button
              onClick={() => { setShowKeyModal(true); setNewKeyGenerated(null); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-gradient-to-br from-[#35E0F5] to-[#2F8CF6] hover:brightness-110 text-[#04121C] text-[13px] font-bold transition-all shadow-[0_4px_18px_rgba(53,224,245,0.28)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Generate Key</span>
            </button>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 ih-card p-5">
              <div className="text-sm font-bold text-white mb-3">Active API Keys</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[10px] font-mono text-[#5E6E89] uppercase">
                      <th className="py-2 px-3">Label</th>
                      <th className="py-2 px-3">Key</th>
                      <th className="py-2 px-3">Scope</th>
                      <th className="py-2 px-3">Requests</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    <tr>
                      <td className="py-3 px-3 font-semibold text-white">Production · Server</td>
                      <td className="py-3 px-3 font-mono text-[#9AA8C0]">sk_live_…4a91</td>
                      <td className="py-3 px-3 font-mono text-[10px] text-[#35E0F5]">dialogue:write</td>
                      <td className="py-3 px-3 font-mono text-white">48,210</td>
                      <td className="py-3 px-3 text-[#3DDC97] font-bold">Active</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-white">Staging · QA Build</td>
                      <td className="py-3 px-3 font-mono text-[#9AA8C0]">sk_test_…77bd</td>
                      <td className="py-3 px-3 font-mono text-[10px] text-[#35E0F5]">dialogue:write</td>
                      <td className="py-3 px-3 font-mono text-white">9,804</td>
                      <td className="py-3 px-3 text-[#3DDC97] font-bold">Active</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quickstart Snippet */}
            <div className="lg:col-span-5 ih-card p-5 space-y-4">
              <div className="text-sm font-bold text-white">Quick Start</div>
              <div className="flex gap-2 border-b border-white/[0.08] pb-2">
                {(["curl", "js", "py"] as const).map((sdk) => (
                  <button
                    key={sdk}
                    onClick={() => setActiveSdkTab(sdk)}
                    className={`px-3 py-1 rounded-[7px] text-xs font-mono font-bold transition ${
                      activeSdkTab === sdk ? "bg-[#35E0F5]/15 text-[#35E0F5]" : "text-[#5E6E89] hover:text-white"
                    }`}
                  >
                    {sdk.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-[10px] bg-[#070C17] border border-white/[0.08] font-mono text-xs text-[#C7D6EA] overflow-x-auto leading-relaxed">
                {activeSdkTab === "curl" && (
                  <pre>{`curl https://api.npc402.ai/v1/dialogue \\
  -H "Authorization: Bearer $NPC402_KEY" \\
  -H "X-Payment: x402 base-sepolia USDC 10000" \\
  -d '{"persona":"VEX-7", "message":"Where is the vault?"}'`}</pre>
                )}
                {activeSdkTab === "js" && (
                  <pre>{`import { NPC402 } from "@npc402/sdk";
const npc = new NPC402({ apiKey: process.env.NPC402_KEY });
const res = await npc.dialogue({
  persona: "VEX-7",
  message: "Where is the vault?"
});`}</pre>
                )}
                {activeSdkTab === "py" && (
                  <pre>{`from npc402 import Client
npc = Client(api_key=os.environ["NPC402_KEY"])
res = npc.dialogue(
    persona="VEX-7",
    message="Where is the vault?"
)`}</pre>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 8: INTEGRATIONS
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div>
              <div className="flex items-center gap-2 text-[10.5px] font-mono tracking-[0.24em] font-bold text-[#35E0F5] uppercase">
                <span className="pulse-dot-cyan"></span>
                ENGINE CONNECTORS
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#E8EEF9] mt-2 font-display">
                Integrations
              </h1>
              <p className="text-[#9AA8C0] text-[13.5px] mt-2 max-w-2xl leading-relaxed">
                Drop NPC-402 into your engine or platform. Every connector speaks the same x402 settlement layer.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Unity", desc: "C# SDK with async dialogue coroutines and WebGL support.", cmd: "npm i @npc402/unity-bridge", color: "#35E0F5" },
              { name: "Unreal Engine", desc: "Blueprint nodes & C++ module for UE5 with lipsync.", cmd: "github.com/npc-402/unreal", color: "#9A8CFF" },
              { name: "Godot", desc: "GDExtension for Godot 4 with GDScript bindings.", cmd: "assetlib: NPC-402 Dialogue", color: "#3DDC97" },
              { name: "Web SDK", desc: "TypeScript client with React hooks & SSE streaming.", cmd: "npm i @npc402/web-sdk", color: "#35E0F5" },
              { name: "Discord Bot", desc: "Spawn personas as slash-command bots with micro-billing.", cmd: "npc402 connect discord", color: "#9A8CFF" },
              { name: "Webhooks", desc: "Stream settlements and dialogue events HMAC signed.", cmd: "POST /v1/webhooks", color: "#FFC454" },
            ].map((item, i) => (
              <div key={i} className="ih-card ih-card-hover p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="text-base font-bold text-white">{item.name}</div>
                  <p className="text-xs text-[#9AA8C0] mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
                <div className="p-2.5 rounded-[9px] bg-[#070C17] border border-white/[0.08] font-mono text-xs text-[#35E0F5] flex items-center justify-between">
                  <span className="truncate">{item.cmd}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(item.cmd)}
                    className="text-[#5E6E89] hover:text-white p-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          VIEW 9: DOCUMENTATION
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "docs" && (
        <div className="space-y-6">
          <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div>
              <div className="flex items-center gap-2 text-[10.5px] font-mono tracking-[0.24em] font-bold text-[#35E0F5] uppercase">
                <span className="pulse-dot-cyan"></span>
                REFERENCE
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#E8EEF9] mt-2 font-display">
                Documentation
              </h1>
              <p className="text-[#9AA8C0] text-[13.5px] mt-2 max-w-2xl leading-relaxed">
                Everything you need to ship autonomous, paid-per-dialogue NPCs — from authentication to settlement.
              </p>
            </div>
          </section>

          <section className="ih-card p-6 space-y-6 text-sm text-[#9AA8C0] leading-relaxed">
            <div className="border-b border-white/[0.08] pb-4">
              <h2 className="text-lg font-bold text-white mb-2">01 Getting Started</h2>
              <p>NPC-402 turns game characters into autonomous AI personas with on-chain x402 settlement.</p>
              <div className="mt-3 p-3 bg-[#070C17] rounded-[9px] font-mono text-xs text-[#35E0F5]">
                npm install @npc402/web-sdk
              </div>
            </div>

            <div className="border-b border-white/[0.08] pb-4">
              <h2 className="text-lg font-bold text-white mb-2">02 x402 Cryptographic Payments</h2>
              <p>Every dialogue request carries an <code>X-Payment</code> header co-signed on Base Sepolia.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-2">03 RAG Memory System</h2>
              <p>Lore is indexed in 512-token chunks and injected dynamically at inference time.</p>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: DEPLOY PERSONA
          ═══════════════════════════════════════════════════════════════ */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#101A30] border border-white/[0.18] rounded-[18px] max-w-md w-full p-6 space-y-5 shadow-2xl">
            {deployStep === "form" && (
              <>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="font-bold text-white text-base">Deploy New Persona</div>
                  <button onClick={() => setShowDeployModal(false)} className="text-[#5E6E89] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10.5px] font-mono text-[#5E6E89] uppercase tracking-wider mb-1">
                      Persona Name
                    </label>
                    <input placeholder="e.g. CYRA-9 · Rogue Hacker" className="w-full p-2.5 rounded-[9px] bg-[#080E1B] border border-white/[0.10] text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-mono text-[#5E6E89] uppercase tracking-wider mb-1">
                      Voice Profile
                    </label>
                    <select className="w-full p-2.5 rounded-[9px] bg-[#080E1B] border border-white/[0.10] text-xs text-white">
                      <option>OmniVoice · Rift (Neutral)</option>
                      <option>OmniVoice · Vesper (Alto)</option>
                      <option>OmniVoice · Rook (Bass)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-mono text-[#5E6E89] uppercase tracking-wider mb-1">
                      Lore / Backstory
                    </label>
                    <textarea rows={3} placeholder="Memory anchors, speech habits…" className="w-full p-2.5 rounded-[9px] bg-[#080E1B] border border-white/[0.10] text-xs text-white" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowDeployModal(false)} className="px-4 py-2 rounded-[9px] text-xs text-[#9AA8C0] hover:text-white">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setDeployStep("loading");
                      setTimeout(() => setDeployStep("success"), 1200);
                    }}
                    className="px-5 py-2 rounded-[9px] bg-[#35E0F5] text-black font-bold text-xs"
                  >
                    Deploy Persona
                  </button>
                </div>
              </>
            )}

            {deployStep === "loading" && (
              <div className="text-center py-8 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#35E0F5] border-t-transparent animate-spin mx-auto" />
                <div className="text-sm font-bold text-white">Deploying substrate to Base Sepolia…</div>
              </div>
            )}

            {deployStep === "success" && (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#3DDC97]/20 border border-[#3DDC97] text-[#3DDC97] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div className="text-base font-bold text-white">Persona Deployed!</div>
                <p className="text-xs text-[#9AA8C0]">Substrate initialized on Base Sepolia (0x4a91…f2c7).</p>
                <button
                  onClick={() => setShowDeployModal(false)}
                  className="w-full py-2.5 rounded-[9px] bg-[#35E0F5] text-black font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: GENERATE KEY
          ═══════════════════════════════════════════════════════════════ */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#101A30] border border-white/[0.18] rounded-[18px] max-w-md w-full p-6 space-y-5 shadow-2xl">
            {!newKeyGenerated ? (
              <>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="font-bold text-white text-base">Generate API Key</div>
                  <button onClick={() => setShowKeyModal(false)} className="text-[#5E6E89] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-[10.5px] font-mono text-[#5E6E89] uppercase tracking-wider mb-1">
                    Key Label
                  </label>
                  <input placeholder="e.g. Production · Unity Game Server" className="w-full p-2.5 rounded-[9px] bg-[#080E1B] border border-white/[0.10] text-xs text-white" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowKeyModal(false)} className="px-4 py-2 rounded-[9px] text-xs text-[#9AA8C0] hover:text-white">
                    Cancel
                  </button>
                  <button
                    onClick={() => setNewKeyGenerated("sk_live_npc402_" + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2))}
                    className="px-5 py-2 rounded-[9px] bg-[#35E0F5] text-black font-bold text-xs"
                  >
                    Generate
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-base font-bold text-white">Key Generated</div>
                <p className="text-xs text-[#9AA8C0]">Save it securely — you will not be able to view it again.</p>
                <div className="p-3 bg-[#080E1B] rounded-[9px] border border-[#FFC454]/40 font-mono text-xs text-[#FFC454] flex items-center justify-between">
                  <span className="truncate pr-2">{newKeyGenerated}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newKeyGenerated);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 1500);
                    }}
                    className="text-[#5E6E89] hover:text-white p-1"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-[#3DDC97]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="w-full py-2.5 rounded-[9px] bg-[#35E0F5] text-black font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SESSION DETAIL DRAWER
          ═══════════════════════════════════════════════════════════════ */}
      {activeSession && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveSession(null)} />
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#0E1729] to-[#090F1C] border-l border-white/[0.20] shadow-[-24px_0_60px_rgba(0,0,0,0.55)] flex flex-col justify-between z-10 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-white/[0.10] pb-4">
                <div>
                  <h3 className="text-[16px] font-bold text-[#E8EEF9] font-mono">{activeSession.id}</h3>
                  <div className="text-[12px] text-[#5E6E89] mt-0.5">
                    {activeSession.persona} · player {activeSession.player} · {activeSession.turns} turns
                  </div>
                </div>
                <button
                  onClick={() => setActiveSession(null)}
                  className="p-1.5 rounded-[9px] border border-white/[0.10] text-[#5E6E89] hover:text-[#E8EEF9] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 text-[10.5px] font-mono text-[#5E6E89]">
                <span>{activeSession.lat}ms avg</span>
                <span>·</span>
                <span>{(activeSession.fee * 10000).toFixed(0)} µUSDC / turn</span>
                <span>·</span>
                <span>{activeSession.time}</span>
              </div>

              <div className="space-y-3 pt-2">
                {activeSession.conv.map(([who, text], i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-[13px] text-[13px] leading-relaxed max-w-[90%] ${
                      who === "player"
                        ? "ml-auto bg-gradient-to-br from-[rgba(53,224,245,0.16)] to-[rgba(47,140,246,0.12)] border border-[rgba(53,224,245,0.25)] text-[#E8EEF9]"
                        : "mr-auto bg-[#101A2E] border border-white/[0.10] text-[#E8EEF9]"
                    }`}
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] opacity-75 font-mono mb-1">
                      {who === "player" ? `Player · ${activeSession.player}` : activeSession.persona}
                    </span>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 rounded-[12px] bg-[#0C1322] border border-white/[0.10] space-y-2 text-[12px]">
              <div className="flex justify-between text-[#5E6E89]">
                <span>x402 settlement</span>
                <b className="text-[#3DDC97] font-semibold">Settled on Base Sepolia</b>
              </div>
              <div className="flex justify-between text-[#5E6E89]">
                <span>Fee</span>
                <b className="text-[#E8EEF9] font-mono font-semibold">{activeSession.fee.toFixed(4)} USDC</b>
              </div>
              <div className="flex justify-between text-[#5E6E89]">
                <span>Transaction</span>
                <b className="text-[#35E0F5] font-mono font-semibold">0x4f2a…91c3</b>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
