"use client";

import React, { useEffect, useState } from "react";
import { 
  Terminal, 
  Coins, 
  Bot, 
  Key,
  ShieldCheck,
  AlertCircle,
  Activity
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalRequests: number;
  successRequests: number;
  revenue: string;
  activeNpcs: number;
  apiKeysCount: number;
}

interface ActivityLog {
  id: string;
  npcName: string;
  status: string;
  cost: string;
  createdAt: string;
  txHash: string | null;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statsRes = await fetch("/api/dashboard/stats");
        const statsData = await statsRes.json();
        if (statsData.status === "success") {
          setStats(statsData.stats);
        }

        const logsRes = await fetch("/api/logs");
        const logsData = await logsRes.json();
        if (logsData.status === "success") {
          setActivities(logsData.logs.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Loading Console...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total API Requests",
      value: stats?.totalRequests || 0,
      subText: `${stats?.successRequests || 0} successfully generated`,
      icon: Activity,
      accent: "text-cyan-400",
      border: "border-cyan-500/20"
    },
    {
      title: "Cost / Payments Settled",
      value: `$${stats?.revenue || "0.00"}`,
      subText: "Paid in USDC via x402",
      icon: Coins,
      accent: "text-lime-400",
      border: "border-lime-500/20"
    },
    {
      title: "Active NPCs",
      value: stats?.activeNpcs || 0,
      subText: "Dialogue Profiles configured",
      icon: Bot,
      accent: "text-cyan-400",
      border: "border-cyan-500/20"
    },
    {
      title: "API Keys",
      value: stats?.apiKeysCount || 0,
      subText: "Active key registrations",
      icon: Key,
      accent: "text-lime-400",
      border: "border-lime-500/20"
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="border-b border-[#2F323B] pb-6">
        <p className="font-mono text-cyan-400 text-[10px] uppercase tracking-[0.3em] mb-2">System Overview</p>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
          Project Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor your pay-per-call AI NPC integrations, billing status, and signature verifications.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`bg-[#0c0c0c] border ${card.border} p-6 rounded-none flex flex-col justify-between h-36 relative overflow-hidden hover:border-cyan-400/40 transition duration-300`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400`}>{card.title}</span>
                <Icon className={`w-4 h-4 ${card.accent}`} />
              </div>
              <div>
                <div className={`text-3xl font-black ${card.accent}`}>{card.value}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{card.subText}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent activity & billing explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent logs */}
        <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#2F323B] rounded-none p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 font-mono uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Recent Dialogue Requests
              </h2>
              <Link href="/dashboard/logs" className="text-[10px] text-cyan-400 hover:text-white font-mono uppercase tracking-wider transition border-b border-cyan-400/30 hover:border-white">
                View All Logs →
              </Link>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#2F323B] text-slate-500 text-sm font-mono">
                <Terminal className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-xs">No recent API requests.</p>
                <p className="text-xs mt-1 text-slate-600">Create an NPC profile and API Key to begin.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2F323B] text-[9px] text-slate-400 uppercase tracking-[0.2em] font-mono">
                      <th className="pb-3 pl-2">NPC</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Cost (USDC)</th>
                      <th className="pb-3">Tx Hash</th>
                      <th className="pb-3 pr-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((log) => (
                      <tr key={log.id} className="border-b border-[#2F323B]/40 text-sm text-slate-300 hover:bg-white/3 transition">
                        <td className="py-3 pl-2 font-semibold text-slate-200 text-xs">{log.npcName}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border ${
                              log.status === "PAID_COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : log.status === "CHALLENGE_ISSUED"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {log.status === "PAID_COMPLETED" ? (
                              <><ShieldCheck className="w-3 h-3" /> Paid</>
                            ) : log.status === "CHALLENGE_ISSUED" ? (
                              <><AlertCircle className="w-3 h-3 animate-pulse" /> Challenged</>
                            ) : (
                              <><AlertCircle className="w-3 h-3" /> Failed</>
                            )}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-xs text-cyan-400">${parseFloat(log.cost).toFixed(4)}</td>
                        <td className="py-3 font-mono text-slate-500 text-xs">
                          {log.txHash ? `${log.txHash.substring(0, 6)}...${log.txHash.slice(-4)}` : "—"}
                        </td>
                        <td className="py-3 pr-2 text-right text-xs text-slate-500 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* x402 Architecture Side Panel */}
        <div className="bg-[#0c0c0c] border border-[#2F323B] rounded-none p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Coins className="w-4 h-4 text-lime-400" />
              x402 Payment Flow
            </h2>
            <div className="border border-[#2F323B] p-4 bg-black/20 text-xs space-y-4">
              <p className="text-slate-300 leading-relaxed">
                NPC endpoints utilize the <strong className="text-cyan-400">x402 standard</strong> to meter API consumption autonomously:
              </p>
              
              <div className="space-y-3 font-mono text-[11px]">
                {[
                  { step: "01", title: "Challenge", desc: "API returns 402 Payment Required with signed challenge." },
                  { step: "02", title: "Sign", desc: "Game client signs challenge using player's wallet." },
                  { step: "03", title: "Settle", desc: "Client retries with signature; API verifies and unlocks." }
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-3">
                    <span className="text-cyan-400 font-black">{step}</span>
                    <div>
                      <span className="text-slate-200 block font-bold uppercase">{title}</span>
                      <span className="text-slate-500">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#2F323B] pt-4 text-[10px] text-slate-500 leading-relaxed font-mono">
              Every settled call returns a <strong className="text-lime-400">cryptographic receipt</strong>, ensuring full billing transparency.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
