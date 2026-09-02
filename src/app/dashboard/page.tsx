"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Activity, 
  Coins, 
  Bot, 
  Key, 
  Plus, 
  Play, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  Zap, 
  Wallet, 
  Terminal, 
  Gamepad2, 
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { PageHeader, MetricCard, StatusBadge, EmptyState } from "@/components/console/ConsoleUI";

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
          setActivities(logsData.logs.slice(0, 6));
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
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-cyan-400"></div>
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Loading Control Center...</span>
        </div>
      </div>
    );
  }

  const totalReqs = stats?.totalRequests || 0;
  const revenueAmount = parseFloat(stats?.revenue || "0.00").toFixed(4);
  const npcsCount = stats?.activeNpcs || 0;
  const keysCount = stats?.apiKeysCount || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <PageHeader
        badge="Autonomous Infrastructure"
        title="Dashboard"
        description="Monitor your AI dialogue infrastructure, API usage, NPC activity and x402 payments."
        actions={
          <>
            <Link
              href="/dashboard/sandbox"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F141A] hover:bg-[#151C26] border border-white/[0.08] text-xs font-semibold text-slate-200 transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              Test Dialogue
            </Link>
            <Link
              href="/dashboard/npcs"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold transition shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Create NPC
            </Link>
          </>
        }
      />

      {/* ─── Quick Actions Area ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/dashboard/npcs"
          className="p-3.5 rounded-xl bg-[#0F141A] hover:bg-[#121820] border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-150 flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">Create NPC</p>
            <p className="text-[10px] text-slate-400 truncate">Configure persona</p>
          </div>
        </Link>

        <Link
          href="/dashboard/sandbox"
          className="p-3.5 rounded-xl bg-[#0F141A] hover:bg-[#121820] border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-150 flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Play className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">Test Dialogue</p>
            <p className="text-[10px] text-slate-400 truncate">Run prompt sandbox</p>
          </div>
        </Link>

        <Link
          href="/dashboard/keys"
          className="p-3.5 rounded-xl bg-[#0F141A] hover:bg-[#121820] border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-150 flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Key className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">API Keys</p>
            <p className="text-[10px] text-slate-400 truncate">Get credentials</p>
          </div>
        </Link>

        <Link
          href="/dashboard/game"
          className="p-3.5 rounded-xl bg-[#0F141A] hover:bg-[#121820] border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-150 flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">Interactive Demo</p>
            <p className="text-[10px] text-slate-400 truncate">Launch live demo</p>
          </div>
        </Link>
      </div>

      {/* ─── Metric Cards Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="API Requests"
          value={totalReqs}
          subtitle={`${stats?.successRequests || 0} successfully generated`}
          change={totalReqs > 0 ? "+100%" : "+0%"}
          isPositive={true}
          icon={Activity}
          trendData={[15, 25, 45, 30, 60, 80, 95]}
        />
        <MetricCard
          title="Payments"
          value={`$${revenueAmount}`}
          subtitle="USDC settled on Base Sepolia"
          change={parseFloat(revenueAmount) > 0 ? "Settled" : "Standby"}
          isPositive={true}
          icon={Coins}
          trendData={[10, 20, 30, 40, 50, 70, 85]}
        />
        <MetricCard
          title="Active NPCs"
          value={npcsCount}
          subtitle={`${npcsCount} currently deployed`}
          change="Memory Active"
          isPositive={true}
          icon={Bot}
          trendData={[20, 40, 35, 60, 75, 80, 90]}
        />
        <MetricCard
          title="API Keys"
          value={keysCount}
          subtitle={`${keysCount} active credentials`}
          change="SHA-256"
          isPositive={true}
          icon={Key}
          trendData={[50, 50, 60, 60, 70, 80, 80]}
        />
      </div>

      {/* ─── Main Two-Column Content ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Dialogue Requests */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Recent Dialogue Requests
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Incoming requests, AI inference tokens, and payment settlement audit.
                </p>
              </div>
              <Link 
                href="/dashboard/logs" 
                className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>View all</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activities.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="No dialogue requests yet"
                description="Create your first NPC and send a test request in the sandbox to observe live x402 settlement."
                actionText="+ Create NPC"
                actionHref="/dashboard/npcs"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pl-2">NPC Character</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Cost (USDC)</th>
                      <th className="pb-3">Tx Hash</th>
                      <th className="pb-3 pr-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {activities.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                              {log.npcName[0] || "N"}
                            </div>
                            <span className="font-semibold text-white text-xs">{log.npcName}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          {log.status === "PAID_COMPLETED" ? (
                            <StatusBadge status="success" label="Settled" />
                          ) : log.status === "CHALLENGE_ISSUED" ? (
                            <StatusBadge status="pending" label="Challenged" />
                          ) : (
                            <StatusBadge status="error" label="Failed" />
                          )}
                        </td>
                        <td className="py-3.5 font-mono text-xs font-bold text-cyan-400">
                          ${parseFloat(log.cost).toFixed(4)}
                        </td>
                        <td className="py-3.5 font-mono text-slate-400 text-xs">
                          {log.txHash ? (
                            <span className="hover:text-cyan-400 transition cursor-pointer">
                              {log.txHash.substring(0, 6)}...{log.txHash.slice(-4)}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-3.5 pr-2 text-right text-xs text-slate-400 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual x402 Payment Flow */}
        <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 flex flex-col justify-between shadow-sm space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                x402 Payment Flow
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                EIP-191
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Automatic pay-per-call settlement with zero subscription lock-in.
            </p>

            {/* Step Visualization */}
            <div className="space-y-3 relative">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  01
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Request & Challenge</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">API returns HTTP 402 payment challenge with nonce and amount.</p>
                </div>
              </div>

              {/* Connecting arrow */}
              <div className="flex justify-center text-slate-600 py-0.5">
                ↓
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  02
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cryptographic Sign</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Game client or player wallet signs challenge using EIP-191 personal_sign.</p>
                </div>
              </div>

              {/* Connecting arrow */}
              <div className="flex justify-center text-slate-600 py-0.5">
                ↓
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  03
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Settle & Stream</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Server verifies signature, settles fee on-chain, and streams AI dialogue.</p>
                </div>
              </div>

              {/* Connecting arrow */}
              <div className="flex justify-center text-slate-600 py-0.5">
                ↓
              </div>

              {/* Step 4: Receipt */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Cryptographic Receipt</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Irreversible cryptographic receipt logged for auditing and replay protection.</p>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/docs"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#121820] hover:bg-[#161f2b] text-xs font-semibold text-cyan-400 border border-white/[0.08] transition"
          >
            <span>Learn about x402</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

