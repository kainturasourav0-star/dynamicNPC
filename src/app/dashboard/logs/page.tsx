"use client";

import React, { useEffect, useState } from "react";
import { Terminal, ShieldCheck, AlertCircle, Eye, X, Coins, Bot, Clipboard, Check, MessageSquare, Trash2 } from "lucide-react";

interface LogItem {
  id: string;
  npcName: string;
  status: string;
  cost: string;
  createdAt: string;
  txHash: string | null;
}

interface LogDetail {
  id: string;
  npc: {
    id: string;
    name: string;
    tone: string;
  };
  status: string;
  cost: string;
  rawRequest: {
    context: string;
    playerState?: any;
    challenge?: any;
  };
  rawResponse: {
    dialogue: Array<{
      text: string;
      emotion: string;
      metadata?: any;
    }>;
  } | null;
  createdAt: string;
  updatedAt: string;
  receipt: {
    id: string;
    transactionHash: string;
    paymentStatus: string;
    signature: string;
    payload: {
      amount: string;
      token: string;
      payerAddress: string;
    };
    createdAt: string;
  } | null;
}

interface ConversationItem {
  id: string;
  npcId: string;
  playerAddress: string;
  updatedAt: string;
  npcProfile?: {
    name: string;
    tone: string;
  };
  messages: Array<{ role: "user" | "model"; text: string }>;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [logDetail, setLogDetail] = useState<LogDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Conversation history states
  const [activeTab, setActiveTab] = useState<"requests" | "conversations">("requests");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchConversations();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.status === "success") {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/sandbox/history");
      const data = await res.json();
      if (data.status === "success") {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  };

  const handleInspectLog = async (id: string) => {
    setSelectedLogId(id);
    setLoadingDetail(true);
    setLogDetail(null);
    try {
      const res = await fetch(`/api/logs/${id}`);
      const data = await res.json();
      if (data.status === "success") {
        setLogDetail(data.log);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleClearConversation = async (npcId: string, playerAddress: string, id: string) => {
    if (!confirm("Are you sure you want to clear this conversation history?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sandbox/history?npcId=${npcId}&playerAddress=${playerAddress}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.status === "success") {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (selectedConversation?.id === id) {
          setSelectedConversation(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400"></div>
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Loading Protocol Logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[11px] font-semibold">
              Telemetry & Audit
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Dialogue Request Logs
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Inspect game client payloads, AI inference tokens, and cryptographic x402 USDC micropayment receipts.
          </p>
        </div>

        {/* Modern Pill Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "requests"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Request Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab("conversations")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "conversations"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Memory Threads ({conversations.length})
          </button>
        </div>
      </div>

      {activeTab === "requests" ? (
        logs.length === 0 ? (
          <div className="text-center py-20 px-6 rounded-2xl bg-[#0a0e18] border border-dashed border-white/15 max-w-2xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 text-cyan-400">
              <Terminal className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Logs Recorded Yet</h3>
            <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto leading-relaxed">
              When game clients or the Sandbox trigger the dialogue engine, live requests will appear here with cryptographic receipts.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#0a0e18] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-slate-400 font-semibold tracking-wider uppercase bg-white/[0.01]">
                    <th className="p-4 pl-6">Request ID</th>
                    <th className="p-4">NPC Persona</th>
                    <th className="p-4">Payment Status</th>
                    <th className="p-4">Cost (USDC)</th>
                    <th className="p-4">Tx Hash</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 pl-6 font-mono text-xs text-slate-400">
                        {log.id.substring(0, 8)}...
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-cyan-400" />
                          <span className="font-semibold text-white text-sm">{log.npcName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium ${
                            log.status === "PAID_COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : log.status === "CHALLENGE_ISSUED"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {log.status === "PAID_COMPLETED" ? (
                            <><ShieldCheck className="w-3.5 h-3.5" /> Settled</>
                          ) : log.status === "CHALLENGE_ISSUED" ? (
                            <><AlertCircle className="w-3.5 h-3.5 animate-pulse" /> Challenged</>
                          ) : (
                            <><AlertCircle className="w-3.5 h-3.5" /> Failed</>
                          )}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs font-bold text-cyan-400">
                        ${parseFloat(log.cost).toFixed(4)}
                      </td>
                      <td className="p-4 font-mono text-slate-400 text-xs">
                        {log.txHash ? `${log.txHash.substring(0, 8)}...` : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="p-4 text-xs text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleInspectLog(log.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/20 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        conversations.length === 0 ? (
          <div className="text-center py-20 px-6 rounded-2xl bg-[#0a0e18] border border-dashed border-white/15 max-w-2xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 text-cyan-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Multi-Turn Histories Stored</h3>
            <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto leading-relaxed">
              When players interact with NPCs in the interactive demo or sandbox, full conversation memory threads are recorded here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#0a0e18] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-slate-400 font-semibold tracking-wider uppercase bg-white/[0.01]">
                    <th className="p-4 pl-6">NPC Character</th>
                    <th className="p-4">Player Signer Wallet</th>
                    <th className="p-4">Stored Turns</th>
                    <th className="p-4">Last Interaction</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {conversations.map((conv) => (
                    <tr key={conv.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 pl-6 font-semibold text-white text-sm">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-cyan-400" />
                          <span>{conv.npcProfile?.name || "Unknown NPC"}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                            {conv.npcProfile?.tone || "Neutral"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-400">
                        {conv.playerAddress.substring(0, 10)}...{conv.playerAddress.slice(-6)}
                      </td>
                      <td className="p-4 font-mono text-xs text-cyan-400 font-bold">
                        {conv.messages.length} messages
                      </td>
                      <td className="p-4 text-xs text-slate-400 font-mono">
                        {new Date(conv.updatedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => setSelectedConversation(conv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/20 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Thread
                        </button>
                        <button
                          disabled={deletingId === conv.id}
                          onClick={() => handleClearConversation(conv.npcId, conv.playerAddress, conv.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Purge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Request Log Detail Slide Panel */}
      {selectedLogId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-end z-50 p-4">
          <div className="bg-[#0d121f] border border-white/15 w-full max-w-2xl h-[90vh] rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#090d16]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Request Telemetry & Receipt
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {selectedLogId}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogId(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
                  <span className="font-mono text-xs uppercase text-slate-400">Fetching telemetry payload...</span>
                </div>
              ) : logDetail ? (
                <div className="space-y-6">
                  {/* NPC and Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">NPC Persona</span>
                      <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                        <Bot className="w-4 h-4 text-cyan-400" />
                        {logDetail.npc?.name || "Unknown"}
                      </div>
                      <span className="text-xs text-slate-400">Tone: {logDetail.npc?.tone}</span>
                    </div>

                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">x402 Metered Fee</span>
                      <div className="font-bold text-emerald-400 flex items-center gap-1 text-sm font-mono">
                        <Coins className="w-4 h-4" />
                        ${parseFloat(logDetail.cost).toFixed(4)} USDC
                      </div>
                      <span className="text-xs text-slate-400">Base Sepolia (84532)</span>
                    </div>
                  </div>

                  {/* Context and Input */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Input Request Scenario</h4>
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">Narrative Context</span>
                        <p className="text-slate-200 text-xs leading-relaxed">{logDetail.rawRequest.context}</p>
                      </div>
                      {logDetail.rawRequest.playerState && (
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1">Player Attributes JSON</span>
                          <pre className="text-xs font-mono text-cyan-300 bg-black/40 p-3 rounded-lg border border-white/5 overflow-x-auto">
                            {JSON.stringify(logDetail.rawRequest.playerState, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generated output */}
                  {logDetail.status === "PAID_COMPLETED" && logDetail.rawResponse?.dialogue ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Generated Dialogue Options</h4>
                      <div className="space-y-3">
                        {logDetail.rawResponse.dialogue.map((opt, index) => (
                          <div key={index} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                                Option {index + 1}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">Emotion: <strong className="text-cyan-300">{opt.emotion}</strong></span>
                            </div>
                            <p className="text-slate-100 text-xs leading-relaxed">{opt.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Payment Receipt */}
                  {logDetail.receipt && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cryptographic x402 Receipt</h4>
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-xl space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-white/10">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            SETTLED ON-CHAIN
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(logDetail.receipt.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Payer Address:</span>
                            <span className="text-slate-200 truncate max-w-[260px]">{logDetail.receipt.payload.payerAddress}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">USDC Amount:</span>
                            <span className="text-emerald-400 font-bold">${parseFloat(logDetail.receipt.payload.amount).toFixed(4)} USDC</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Tx Hash:</span>
                            <span className="text-slate-300 truncate max-w-[220px] flex items-center gap-1.5">
                              {logDetail.receipt.transactionHash}
                              <button
                                onClick={() => handleCopy(logDetail.receipt!.transactionHash, "tx")}
                                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition"
                              >
                                {copiedId === "tx" ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[#090d16] flex justify-end">
              <button
                onClick={() => setSelectedLogId(null)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-xs text-slate-200 font-semibold rounded-xl border border-white/10 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Thread Detail Panel */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-end z-50 p-4">
          <div className="bg-[#0d121f] border border-white/15 w-full max-w-2xl h-[90vh] rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#090d16]">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  Conversation with {selectedConversation.npcProfile?.name || "NPC"}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Player: {selectedConversation.playerAddress}
                </span>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConversation.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] rounded-2xl p-4 ${
                    msg.role === "user"
                      ? "bg-white/5 border border-white/10 self-start text-left mr-auto text-slate-100"
                      : "bg-cyan-950/40 border border-cyan-800/30 text-cyan-100 ml-auto mr-0 text-left shadow-lg shadow-cyan-950/20"
                  }`}
                >
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    {msg.role === "user" ? "Player Action / Dialogue" : selectedConversation.npcProfile?.name || "NPC"}
                  </span>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[#090d16] flex justify-between items-center">
              <button
                onClick={() => handleClearConversation(selectedConversation.npcId, selectedConversation.playerAddress, selectedConversation.id)}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition"
              >
                Clear History
              </button>
              <button
                onClick={() => setSelectedConversation(null)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-xs text-slate-200 font-semibold rounded-xl border border-white/10 transition"
              >
                Close Thread
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
