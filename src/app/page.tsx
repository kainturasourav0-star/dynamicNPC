import React from "react";
import { 
  Bot, 
  ShieldCheck, 
  Terminal, 
  Coins, 
  ArrowRight, 
  Cpu, 
  BookOpen, 
  Zap, 
  Sparkles,
  Link as LinkIcon
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stats = [
    { label: "AI Inference Uptime", value: "99.99%", desc: "Automatic Gemini & NVIDIA NIM failover" },
    { label: "Average Fallback Latency", value: "<150ms", desc: "Local context-aware mock engine" },
    { label: "USDC Micro-Payments Settled", value: "1.5M+", desc: "Zero developer LLM billing overhead" }
  ];

  const features = [
    {
      title: "x402 Micropayments",
      desc: "Autonomously shifts AI inference costs to gamers. Each dialogue turn costs $0.01 USD in USDC, settled directly from Web3 wallets.",
      icon: Coins,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/25"
    },
    {
      title: "EIP-191 Replay Protection",
      desc: "Cryptographically signs payment challenges on-chain. Tracked spent nonces prevent replay attacks and ensure transaction validity.",
      icon: ShieldCheck,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
    },
    {
      title: "Contextual Memory",
      desc: "Maintains multi-turn conversation states per player address and NPC, offering immersive, continuous storylines.",
      icon: Bot,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25"
    },
    {
      title: "Dual Engine Routing",
      desc: "Leverages Nvidia NIM instruct models and Gemini 1.5, routing dynamically to ensure lowest latency and fallback coverage.",
      icon: Cpu,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/25"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden">
      
      {/* Background glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base bg-gradient-to-r from-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Brainwave x402
              </span>
              <div className="text-[9px] text-indigo-400 font-mono tracking-widest uppercase block">
                Dynamic NPC Platform
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="/dashboard/docs" 
              className="text-xs font-mono text-slate-400 hover:text-slate-200 transition hidden sm:inline-block"
            >
              SDK DOCUMENTATION
            </a>
            <a
              href="/login"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition px-4 py-2 rounded-xl text-xs font-bold"
            >
              Developer Console
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 py-16 md:py-24 max-w-7xl mx-auto px-6 space-y-24 relative z-10">
        
        {/* Main Banner */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-3 py-1 text-[11px] font-mono text-indigo-300">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            EIP-191 MICROPAYMENT PROTOCOL STANDARD
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] bg-gradient-to-br from-slate-50 via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Autonomous Micropayments for Game AI NPCs
          </h1>
          
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Eliminate server inference costs by shifting dialogue fees to players. Integrating the <strong>x402 micro-billing</strong> standard lets clients sign cryptographic challenges to settle fractions of a cent per dialogue call.
          </p>

          <div className="pt-4 flex gap-4 justify-center flex-wrap">
            <a
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition shadow-[0_0_25px_rgba(79,70,229,0.4)] flex items-center gap-2"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/login"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold px-6 py-3.5 rounded-xl text-sm transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              Demo Console Sandbox
            </a>
          </div>
        </section>

        {/* Live Flow Visualization Block */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Visual code interface */}
          <div className="space-y-4 font-mono text-[11px] bg-slate-950 p-5 rounded-2xl border border-slate-800/80 max-h-[300px] overflow-y-auto text-indigo-300">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-slate-500">
              <span>x402-dialogue-handshake.bash</span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            </div>
            <p className="text-slate-500"># Step 1: Client triggers NPC context request</p>
            <p><span className="text-indigo-400">POST</span> /api/generate-dialogue <span className="text-slate-500">{"{ npcId: \"0x9b...\", context: \"Greeting\" }"}</span></p>
            
            <p className="text-amber-400 mt-2"># Step 2: API returns EIP-191 Payment Challenge</p>
            <p className="text-amber-300">HTTP/1.1 402 Payment Required</p>
            <p className="text-amber-500">{`{
  "status": "payment_required",
  "challenge": { "amount": "0.0100", "token": "USDC", "nonce": "0xfe38..." }
}`}</p>
            
            <p className="text-emerald-400 mt-2"># Step 3: Player wallet signs challenge and resubmits</p>
            <p><span className="text-indigo-400">POST</span> /api/generate-dialogue <span className="text-slate-500">{`{ signature: "0x57ef...", requestId: "uuid..." }`}</span></p>
            <p className="text-emerald-300">HTTP/1.1 200 OK (Inference Output)</p>
          </div>

          {/* Marketing text */}
          <div className="space-y-5">
            <h3 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              A Complete Billing Protocol for Modern Web3 Games
            </h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Integrate interactive conversation trees that query real-time player states (e.g. inventory contents, health, alignment tags) and feed them to high-entropy models. If a player is low on health, the merchant adapts their speech contextually.
            </p>
            <div className="space-y-3 pt-2 text-xs font-mono">
              <div className="flex gap-2.5 items-start">
                <span className="p-1 bg-emerald-500/10 border border-emerald-500/25 rounded-md text-emerald-400 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-slate-200 block font-semibold">Zero Double Spend Protection</span>
                  <span className="text-slate-500">Replay nonces prevent client-side payment forgery.</span>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="p-1 bg-indigo-500/10 border border-indigo-500/25 rounded-md text-indigo-400 mt-0.5">
                  <Cpu className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-slate-200 block font-semibold">Multi-Engine Support</span>
                  <span className="text-slate-500">Direct endpoints hook into Gemini or NVIDIA NIM with seamless API handshakes.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-2 backdrop-blur-sm text-center sm:text-left">
              <div className="text-3xl md:text-4xl font-black text-indigo-400">{stat.value}</div>
              <div className="text-sm font-bold text-slate-200">{stat.label}</div>
              <div className="text-xs text-slate-500">{stat.desc}</div>
            </div>
          ))}
        </section>

        {/* Features list */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-100">
              Tailored for Immersive Gameplay
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto">
              Dynamic character prompt routing designed to bring Web3 and sandbox game dialogue loops to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl flex gap-4 items-start hover:border-slate-800 transition">
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-200 text-sm md:text-base">{feat.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-600 font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Brainwave Platform Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/dashboard/docs" className="hover:text-slate-400 transition">DOCS</a>
            <a href="/login" className="hover:text-slate-400 transition">CONSOLE</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
