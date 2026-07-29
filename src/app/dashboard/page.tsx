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
          setActivities(logsData.logs.slice(0, 5)); // show top 5
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total API Requests",
      value: stats?.totalRequests || 0,
      subText: `${stats?.successRequests || 0} successfully generated`,
      icon: Activity,
      color: "from-blue-600/20 to-cyan-600/20 text-cyan-400 border-cyan-500/20"
    },
    {
      title: "Cost / Payments Settled",
      value: `$${stats?.revenue || "0.00"}`,
      subText: "Paid in USDC via x402",
      icon: Coins,
      color: "from-indigo-600/20 to-purple-600/20 text-indigo-400 border-indigo-500/20"
    },
    {
      title: "Active NPCs",
      value: stats?.activeNpcs || 0,
      subText: "Dialogue Profiles configured",
      icon: Bot,
      color: "from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/20"
    },
    {
      title: "API Keys",
      value: stats?.apiKeysCount || 0,
      subText: "Active key registrations",
      icon: Key,
      color: "from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/20"
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-100 bg-clip-text text-transparent">
          Project Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor your pay-per-call AI NPC integrations, billing status, and signature verifications.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`bg-gradient-to-br ${card.color} border p-6 rounded-xl flex flex-col justify-between h-36 relative overflow-hidden backdrop-blur-md`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">{card.title}</span>
                <div className="p-2 bg-slate-950/60 rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black">{card.value}</div>
                <div className="text-[11px] text-slate-400 mt-1">{card.subText}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent activity & billing explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent logs */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Recent Dialogue Requests
              </h2>
              <Link href="/dashboard/logs" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition">
                View All Logs →
              </Link>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
                No recent API requests. Create an NPC profile and an API Key to begin calling the API.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                      <th className="pb-3 pl-2">NPC</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Cost (USDC)</th>
                      <th className="pb-3">Tx Hash</th>
                      <th className="pb-3 pr-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((log) => (
                      <tr key={log.id} className="border-b border-slate-800/40 text-sm text-slate-300 hover:bg-slate-800/20 transition">
                        <td className="py-3 pl-2 font-semibold text-slate-200">{log.npcName}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                              log.status === "PAID_COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : log.status === "CHALLENGE_ISSUED"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {log.status === "PAID_COMPLETED" ? (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Paid
                              </>
                            ) : log.status === "CHALLENGE_ISSUED" ? (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                                Payment Required
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                Failed
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 font-mono">${parseFloat(log.cost).toFixed(4)}</td>
                        <td className="py-3 font-mono text-slate-500 text-xs">
                          {log.txHash ? `${log.txHash.substring(0, 6)}...${log.txHash.slice(-4)}` : "—"}
                        </td>
                        <td className="py-3 pr-2 text-right text-xs text-slate-500">
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              x402 Micropayment Flow
            </h2>
            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/40 text-xs space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Our NPC dialogue endpoints utilize the <strong className="text-indigo-400">x402 standard</strong> to meter API consumption autonomously:
              </p>
              
              <div className="space-y-3 font-mono text-[11px]">
                <div className="flex gap-2">
                  <span className="text-indigo-400 font-bold">1.</span>
                  <div>
                    <span className="text-slate-200 block font-semibold">Challenge</span>
                    <span className="text-slate-500">API returns a challenge payload with status <code>402 Payment Required</code>.</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-indigo-400 font-bold">2.</span>
                  <div>
                    <span className="text-slate-200 block font-semibold">Sign</span>
                    <span className="text-slate-500">Game client signs the challenge using the player's wallet.</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-indigo-400 font-bold">3.</span>
                  <div>
                    <span className="text-slate-200 block font-semibold">Settle</span>
                    <span className="text-slate-500">Game client retries request with signature; API verifies and completes the call.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 text-xs text-slate-500 leading-relaxed">
              Every settled call returns a cryptographically valid <strong className="text-emerald-400">transaction receipt</strong>, ensuring full billing transparency.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
