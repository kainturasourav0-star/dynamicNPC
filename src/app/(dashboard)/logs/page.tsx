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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <Terminal className="w-8 h-8 text-indigo-400" />
          Dialogue Request Logs
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Inspect incoming game requests, generated AI responses, and corresponding x402 USDC micropayment receipts.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="p-4 bg-slate-950/60 rounded-full inline-block mb-4 text-slate-600">
            <Terminal className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No logs recorded</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Once you call `/api/generate-dialogue` from your game client, requests and transaction receipts will be logged here.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider font-mono bg-slate-950/40">
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
                  <tr key={log.id} className="border-b border-slate-800/40 text-sm text-slate-300 hover:bg-slate-800/20 transition">
                    <td className="p-4 font-mono text-xs text-slate-400">{log.id.substring(0, 8)}...</td>
                    <td className="p-4 font-semibold text-slate-200">{log.npcName}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
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
                    <td className="p-4 font-mono">${parseFloat(log.cost).toFixed(4)}</td>
                    <td className="p-4 font-mono text-slate-500 text-xs">
                      {log.txHash ? `${log.txHash.substring(0, 8)}...` : "—"}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleInspectLog(log.id)}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
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

      {/* Log Detail Modal */}
      {selectedLogId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-end z-50 transition duration-300">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-screen shadow-2xl flex flex-col justify-between relative animate-slideLeft">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div>
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  Inspect Request
                </h3>
                <span className="text-xs text-slate-500 font-mono">ID: {selectedLogId}</span>
              </div>
              <button
                onClick={() => setSelectedLogId(null)}
                className="p-1 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {loadingDetail ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : logDetail ? (
                <div className="space-y-8">
                  {/* NPC and Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">NPC Profile</span>
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-indigo-400" />
                        {logDetail.npc?.name || "Unknown"}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Tone: {logDetail.npc?.tone}</span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">API Cost</span>
                      <div className="font-bold text-slate-200 flex items-center gap-1">
                        <Coins className="w-4 h-4 text-amber-400" />
                        ${parseFloat(logDetail.cost).toFixed(4)} USDC
                      </div>
                      <span className="text-[11px] text-slate-400">Standard metered rate</span>
                    </div>
                  </div>

                  {/* Context and Input */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Input Request Context</h4>
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Game Scenario Context</span>
                        <p className="text-slate-300 text-sm leading-relaxed">{logDetail.rawRequest.context}</p>
                      </div>
                      {logDetail.rawRequest.playerState && (
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Player Attributes</span>
                          <pre className="text-xs font-mono text-indigo-300 bg-slate-950 p-2.5 rounded border border-slate-800 overflow-x-auto">
                            {JSON.stringify(logDetail.rawRequest.playerState, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generated output */}
                  {logDetail.status === "PAID_COMPLETED" && logDetail.rawResponse?.dialogue ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Generated Dialogue Options</h4>
                      <div className="space-y-3">
                        {logDetail.rawResponse.dialogue.map((opt, index) => (
                          <div key={index} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded">
                                Option {index + 1}
                              </span>
                              <span className="text-xs text-slate-400">Emotion: <strong className="text-indigo-300">{opt.emotion}</strong></span>
                            </div>
                            <p className="text-slate-200 text-sm leading-relaxed font-sans">{opt.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-500 text-sm">
                      Dialogue output is not available. This request has status: <code className="text-indigo-400">{logDetail.status}</code>.
                    </div>
                  )}

                  {/* Payment Receipt */}
                  {logDetail.receipt && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">x402 Transaction Receipt</h4>
                      <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 p-5 rounded-xl space-y-4 font-mono text-xs relative overflow-hidden">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            SETTLED RECEIPT
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(logDetail.receipt.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-slate-500">Receipt ID:</span>
                          <span className="col-span-2 text-slate-300 truncate">{logDetail.receipt.id}</span>

                          <span className="text-slate-500">Payer Address:</span>
                          <span className="col-span-2 text-slate-300 truncate">{logDetail.receipt.payload.payerAddress}</span>

                          <span className="text-slate-500">USDC Amount:</span>
                          <span className="col-span-2 text-slate-300 font-bold">${parseFloat(logDetail.receipt.payload.amount).toFixed(4)} USDC</span>

                          <span className="text-slate-500">Tx Hash:</span>
                          <span className="col-span-2 text-slate-400 truncate flex items-center gap-1">
                            {logDetail.receipt.transactionHash}
                            <button
                              onClick={() => handleCopy(logDetail.receipt!.transactionHash, "tx")}
                              className="p-0.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300"
                            >
                              {copiedId === "tx" ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                            </button>
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                          Signature: <span className="text-slate-400 break-all">{logDetail.receipt.signature.substring(0, 40)}...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setSelectedLogId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition text-slate-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
