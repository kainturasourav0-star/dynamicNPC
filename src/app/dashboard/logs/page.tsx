"use client";

import React, { useEffect, useState } from "react";
import { Terminal, ShieldCheck, AlertCircle, Eye, X, Coins, Bot, Clipboard, Check } from "lucide-react";

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

export default function LogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [logDetail, setLogDetail] = useState<LogDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Loading Logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="border-b border-[#2F323B] pb-6">
        <p className="font-mono text-cyan-400 text-[10px] uppercase tracking-[0.3em] mb-2">Request History</p>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
          <Terminal className="w-7 h-7 text-cyan-400" />
          Dialogue Request Logs
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Inspect incoming game requests, generated AI responses, and x402 USDC micropayment receipts.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-20 bg-[#0c0c0c] border border-dashed border-[#2F323B]">
          <div className="p-4 inline-block mb-4 text-slate-700">
            <Terminal className="w-12 h-12" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">No Logs Recorded</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Once you call the <code className="text-cyan-400">/api/generate-dialogue</code> endpoint from your game, request logs will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-[#0c0c0c] border border-[#2F323B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2F323B] text-[9px] text-slate-400 uppercase tracking-[0.2em] font-mono bg-[#050505]">
                  <th className="p-4">Request ID</th>
                  <th className="p-4">NPC Character</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Cost (USDC)</th>
                  <th className="p-4">Tx Hash</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-[#2F323B]/40 text-sm text-slate-300 hover:bg-white/2 transition">
                    <td className="p-4 font-mono text-[10px] text-slate-500">{log.id.substring(0, 8)}...</td>
                    <td className="p-4 font-bold text-slate-200 text-xs uppercase tracking-tight">{log.npcName}</td>
                    <td className="p-4">
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
                    <td className="p-4 font-mono text-xs text-cyan-400">${parseFloat(log.cost).toFixed(4)}</td>
                    <td className="p-4 font-mono text-slate-500 text-[10px]">
                      {log.txHash ? `${log.txHash.substring(0, 8)}...` : "—"}
                    </td>
                    <td className="p-4 text-[10px] text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleInspectLog(log.id)}
                        className="inline-flex items-center gap-1.5 bg-[#141414] hover:bg-cyan-400/10 text-cyan-400 text-[9px] font-mono uppercase tracking-wider px-3 py-1.5 border border-[#2F323B] hover:border-cyan-400/30 transition"
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
      )}

      {/* Log Detail Slide Panel */}
      {selectedLogId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-end z-50">
          <div className="bg-[#0c0c0c] border-l border-[#2F323B] w-full max-w-2xl h-screen shadow-2xl flex flex-col justify-between relative">
            
            {/* Header */}
            <div className="p-6 border-b border-[#2F323B] flex justify-between items-center bg-[#050505]">
              <div>
                <p className="font-mono text-cyan-400 text-[10px] uppercase tracking-[0.3em] mb-1">Request Inspector</p>
                <h3 className="font-black text-sm text-slate-100 uppercase tracking-tight flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Inspect Request
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">ID: {selectedLogId}</span>
              </div>
              <button
                onClick={() => setSelectedLogId(null)}
                className="p-1 text-slate-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
                  <span className="font-mono text-[10px] uppercase text-slate-500">Loading detail...</span>
                </div>
              ) : logDetail ? (
                <div className="space-y-6">
                  {/* NPC and Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#050505] p-4 border border-[#2F323B]">
                      <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block mb-1">NPC Profile</span>
                      <div className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                        <Bot className="w-4 h-4 text-cyan-400" />
                        {logDetail.npc?.name || "Unknown"}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Tone: {logDetail.npc?.tone}</span>
                    </div>

                    <div className="bg-[#050505] p-4 border border-[#2F323B]">
                      <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block mb-1">API Cost</span>
                      <div className="font-bold text-slate-200 flex items-center gap-1 text-sm">
                        <Coins className="w-4 h-4 text-lime-400" />
                        ${parseFloat(logDetail.cost).toFixed(4)} USDC
                      </div>
                      <span className="text-[10px] text-slate-400">Standard metered rate</span>
                    </div>
                  </div>

                  {/* Context and Input */}
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-mono uppercase text-slate-400 tracking-widest">Input Request Context</h4>
                    <div className="bg-[#050505] border border-[#2F323B] p-4 space-y-4">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block mb-1">Game Scenario</span>
                        <p className="text-slate-300 text-sm leading-relaxed">{logDetail.rawRequest.context}</p>
                      </div>
                      {logDetail.rawRequest.playerState && (
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block mb-1">Player Attributes</span>
                          <pre className="text-xs font-mono text-cyan-300 bg-black/40 p-2.5 border border-[#2F323B] overflow-x-auto">
                            {JSON.stringify(logDetail.rawRequest.playerState, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generated output */}
                  {logDetail.status === "PAID_COMPLETED" && logDetail.rawResponse?.dialogue ? (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-mono uppercase text-slate-400 tracking-widest">Generated Dialogue Options</h4>
                      <div className="space-y-3">
                        {logDetail.rawResponse.dialogue.map((opt, index) => (
                          <div key={index} className="bg-[#050505] border border-[#2F323B] p-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 uppercase tracking-wider">
                                Option {index + 1}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">Emotion: <strong className="text-cyan-300">{opt.emotion}</strong></span>
                            </div>
                            <p className="text-slate-200 text-sm leading-relaxed">{opt.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#050505] border border-[#2F323B] text-center text-slate-500 text-sm font-mono">
                      Dialogue output not available. Status: <code className="text-cyan-400">{logDetail.status}</code>
                    </div>
                  )}

                  {/* Payment Receipt */}
                  {logDetail.receipt && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-mono uppercase text-slate-400 tracking-widest">x402 Transaction Receipt</h4>
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 space-y-4 font-mono text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-[#2F323B]">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            SETTLED RECEIPT
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase">
                            {new Date(logDetail.receipt.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-slate-500">Receipt ID:</span>
                          <span className="col-span-2 text-slate-300 truncate">{logDetail.receipt.id}</span>

                          <span className="text-slate-500">Payer Address:</span>
                          <span className="col-span-2 text-slate-300 truncate">{logDetail.receipt.payload.payerAddress}</span>

                          <span className="text-slate-500">USDC Amount:</span>
                          <span className="col-span-2 text-lime-400 font-bold">${parseFloat(logDetail.receipt.payload.amount).toFixed(4)} USDC</span>

                          <span className="text-slate-500">Tx Hash:</span>
                          <span className="col-span-2 text-slate-400 truncate flex items-center gap-1">
                            {logDetail.receipt.transactionHash}
                            <button
                              onClick={() => handleCopy(logDetail.receipt!.transactionHash, "tx")}
                              className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-white transition"
                            >
                              {copiedId === "tx" ? <Check className="w-3 h-3 text-lime-400" /> : <Clipboard className="w-3 h-3" />}
                            </button>
                          </span>
                        </div>

                        <div className="pt-2 border-t border-[#2F323B] text-[9px] text-slate-500">
                          Signature: <span className="text-slate-400 break-all">{logDetail.receipt.signature.substring(0, 40)}...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2F323B] bg-[#050505] flex justify-end">
              <button
                onClick={() => setSelectedLogId(null)}
                className="px-5 py-2.5 bg-[#141414] hover:bg-white/10 text-xs font-mono uppercase border border-white/5 transition"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
