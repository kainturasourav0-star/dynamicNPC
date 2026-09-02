"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Gamepad2, 
  Code, 
  Coins, 
  Bot, 
  Globe, 
  Check, 
  Copy, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  Terminal,
  Cpu
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/console/ConsoleUI";

interface IntegrationItem {
  id: string;
  category: "engines" | "sdks" | "web3" | "services";
  name: string;
  tagline: string;
  description: string;
  icon: any;
  status: "active" | "ready" | "beta";
  statusText: string;
  version: string;
  installCommand?: string;
  docUrl: string;
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "unity",
    category: "engines",
    name: "Unity Engine SDK",
    tagline: "Native C# / Package Manager",
    description: "Plug-and-play Unity package with WebSocket streaming, EIP-191 signing helper, and NPC audio lip-sync drivers.",
    icon: Gamepad2,
    status: "active",
    statusText: "Verified",
    version: "v1.4.0",
    installCommand: "openupm add com.npc402.unity-sdk",
    docUrl: "/dashboard/docs"
  },
  {
    id: "unreal",
    category: "engines",
    name: "Unreal Engine 5",
    tagline: "C++ & Blueprints Plugin",
    description: "Low-overhead async HTTP 402 client with built-in MetaHuman blendshape synchronization and voice synthesizer.",
    icon: Gamepad2,
    status: "active",
    statusText: "Verified",
    version: "v5.3+",
    installCommand: "git clone https://github.com/npc402/unreal-plugin.git",
    docUrl: "/dashboard/docs"
  },
  {
    id: "typescript",
    category: "sdks",
    name: "TypeScript / Node.js",
    tagline: "Full Types & Streaming Client",
    description: "Typed client for Node.js, Next.js, and browser environments with automatic challenge-signing and retries.",
    icon: Code,
    status: "active",
    statusText: "Stable",
    version: "v2.1.2",
    installCommand: "npm install @npc402/client ethers",
    docUrl: "/dashboard/docs"
  },
  {
    id: "python",
    category: "sdks",
    name: "Python SDK",
    tagline: "FastAPI / Pygame / Asyncio",
    description: "Async Python library for backend game servers, bot orchestration, and multi-agent simulation environments.",
    icon: Terminal,
    status: "active",
    statusText: "Stable",
    version: "v1.8.0",
    installCommand: "pip install npc402 eth-account",
    docUrl: "/dashboard/docs"
  },
  {
    id: "x402-vault",
    category: "web3",
    name: "x402 Settlement Vault",
    tagline: "Base Sepolia (84532)",
    description: "Non-custodial merchant treasury smart contract for receiving USDC micropayments and batch settlement.",
    icon: Coins,
    status: "ready",
    statusText: "Connected",
    version: "EIP-191",
    docUrl: "/dashboard/docs"
  },
  {
    id: "discord-bot",
    category: "services",
    name: "Discord & Twitch Bridge",
    tagline: "Community Streaming Bot",
    description: "Bring NPC personas directly into your community Discord channels or live Twitch chat with tipping support.",
    icon: Bot,
    status: "beta",
    statusText: "Beta",
    version: "v0.9.0",
    docUrl: "/dashboard/docs"
  },
  {
    id: "rest-api",
    category: "sdks",
    name: "Direct REST & SSE API",
    tagline: "OpenAPI 3.1 Standard",
    description: "Standard HTTPS endpoints with Server-Sent Events for dialogue streaming into custom game runtimes.",
    icon: Globe,
    status: "active",
    statusText: "Live",
    version: "v1.0",
    docUrl: "/dashboard/docs"
  },
  {
    id: "webhooks",
    category: "services",
    name: "Event Webhooks",
    tagline: "HMAC-SHA256 Signatures",
    description: "Dispatch real-time webhooks on dialogue events, failed signatures, payment receipts, and sentiment shifts.",
    icon: Zap,
    status: "active",
    statusText: "Available",
    version: "v1.0",
    docUrl: "/dashboard/docs"
  }
];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = selectedCategory === "all" 
    ? INTEGRATIONS 
    : INTEGRATIONS.filter(item => item.category === selectedCategory);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ─── Page Header ────────────────────────────────────────── */}
      <PageHeader
        badge="Ecosystem"
        title="Integrations & Game SDKs"
        description="Connect NPC-402 directly into game engines, backend servers, and on-chain micropayment vaults."
        actions={
          <Link
            href="/dashboard/docs"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold transition shadow-md shadow-cyan-500/20"
          >
            <span>View Integration Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* ─── Category Filter Tabs ──────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4 overflow-x-auto">
        {[
          { id: "all", label: "All Integrations" },
          { id: "engines", label: "Game Engines" },
          { id: "sdks", label: "Programming SDKs" },
          { id: "web3", label: "Web3 & Protocol" },
          { id: "services", label: "Services & Bots" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 whitespace-nowrap ${
              selectedCategory === tab.id
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Integrations Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-[#0F141A] border border-white/[0.08] hover:border-cyan-500/30 p-6 flex flex-col justify-between shadow-sm transition-all duration-200 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
                      {item.version}
                    </span>
                    <StatusBadge 
                      status={item.status === "beta" ? "pending" : "success"} 
                      label={item.statusText} 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-cyan-400/80 font-mono mt-0.5 font-medium">
                    {item.tagline}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {item.installCommand && (
                  <div className="p-2.5 rounded-xl bg-[#07090C] border border-white/[0.06] flex items-center justify-between gap-2">
                    <code className="text-[11px] font-mono text-slate-300 truncate">
                      {item.installCommand}
                    </code>
                    <button
                      onClick={() => handleCopy(item.installCommand!, item.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition flex-shrink-0"
                      title="Copy install command"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition">
                  <span>Quickstart Guide</span>
                  <span>→</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  NPC-402 Certified
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Developer Interactive Quickstart Snippet ─────────── */}
      <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Initialize Client in 3 Lines of Code
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy and paste this snippet into your game client or backend service.
            </p>
          </div>
          <button
            onClick={() => handleCopy(`import { NPC402Client } from "@npc402/client";\n\nconst client = new NPC402Client({\n  apiKey: "npc_live_sec_...",\n  walletPrivateKey: process.env.CLIENT_PRIVATE_KEY\n});\n\nconst response = await client.speak({\n  npcId: "npc_cyber_merchant",\n  playerMessage: "Show me your cyberware inventory!"\n});\nconsole.log(response.dialogue);`, "quickstart")}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#07090C] hover:bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 transition"
          >
            {copiedId === "quickstart" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === "quickstart" ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#07090C] border border-white/[0.08] font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed">
          <pre>
            <span className="text-purple-400">import</span> &#123; <span className="text-cyan-400">NPC402Client</span> &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">&quot;@npc402/client&quot;</span>;<br /><br />
            <span className="text-slate-500">// 1. Initialize client with API key and wallet</span><br />
            <span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> <span className="text-cyan-400">NPC402Client</span>(&#123;<br />
            &nbsp;&nbsp;apiKey: <span className="text-emerald-400">&quot;npc_live_sec_...&quot;</span>,<br />
            &nbsp;&nbsp;walletPrivateKey: process.env.<span className="text-cyan-300">CLIENT_PRIVATE_KEY</span><br />
            &#125;);<br /><br />
            <span className="text-slate-500">// 2. Send dialogue query with autonomous EIP-191 payment challenge signing</span><br />
            <span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> client.<span className="text-cyan-400">speak</span>(&#123;<br />
            &nbsp;&nbsp;npcId: <span className="text-emerald-400">&quot;npc_cyber_merchant&quot;</span>,<br />
            &nbsp;&nbsp;playerMessage: <span className="text-emerald-400">&quot;Show me your cyberware inventory!&quot;</span><br />
            &#125;);<br /><br />
            console.<span className="text-cyan-400">log</span>(response.<span className="text-cyan-300">dialogue</span>); <span className="text-slate-500">// &quot;Welcome, runner. I have optical implants and neural boosters...&quot;</span>
          </pre>
        </div>
      </div>
    </div>
  );
}
