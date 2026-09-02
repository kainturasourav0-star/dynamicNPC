"use client";

import React, { useEffect, useState } from "react";
import { Key, Plus, Trash2, Copy, Check, EyeOff, Shield, ShieldCheck, Zap } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  displayKey: string;
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (data.status === "success") {
        setKeys(data.apiKeys);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setNewKeyName("");
        setCreatedKey(data.apiKey.rawKey);
        fetchKeys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success") {
        setKeys(keys.filter((k) => k.id !== id));
      }
    } catch (err) {
      console.error(err);
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
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Loading Keys...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[11px] font-semibold">
            Authentication & Access
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          API Credentials
        </h1>
        <p className="text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
          Generate and manage authorization credentials to integrate NPC dialogue into Unity, Unreal Engine, Web, and mobile game engines.
        </p>
      </div>

      {/* Warning if new key is created */}
      {createdKey && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-6 sm:p-7 space-y-4 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
            <EyeOff className="w-5 h-5 flex-shrink-0" />
            <span>Copy your API Key now — it will not be shown again!</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
            For security, keys are stored as irreversible cryptographic hashes (SHA-256). If you lose this key, you will need to revoke it and generate a replacement.
          </p>
          <div className="flex items-center gap-3 bg-[#0a0e18] p-3.5 rounded-xl border border-amber-500/25 max-w-2xl">
            <span className="text-emerald-400 font-mono text-sm flex-1 truncate select-all">{createdKey}</span>
            <button
              onClick={() => handleCopy(createdKey, "created")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-slate-200 text-xs font-semibold"
            >
              {copiedId === "created" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === "created" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <button
            onClick={() => setCreatedKey(null)}
            className="text-xs text-slate-400 hover:text-white underline font-mono transition"
          >
            I have saved the key securely — dismiss this message
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="rounded-2xl bg-[#0a0e18] border border-white/10 p-6 sm:p-7 h-fit space-y-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Generate API Key
              </h3>
              <p className="text-xs text-slate-400">For server or client runtime</p>
            </div>
          </div>

          <form onSubmit={handleCreateKey} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Key Name / Client Tag</label>
              <input
                type="text"
                required
                placeholder="e.g. Unreal Engine Client (Prod)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition placeholder-slate-600"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
            >
              Generate New Key
            </button>
          </form>

          {/* Key info box */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex gap-2.5 text-xs text-slate-400 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Keys utilize bearer authentication with request-level rate limiting and signature auditing.</span>
            </div>
          </div>
        </div>

        {/* Keys List */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0a0e18] border border-white/10 p-6 sm:p-7 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  Active API Keys ({keys.length})
                </h3>
                <p className="text-xs text-slate-400">Authorized application keys</p>
              </div>
            </div>
          </div>

          {keys.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
              <Key className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-semibold text-slate-200">No active API keys found</p>
              <p className="text-xs text-slate-400 mt-1">Generate a key to connect your game client to the NPC-402 protocol.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all duration-200 group"
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100 text-sm tracking-tight">{k.name}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-400 truncate">
                      {k.displayKey}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 transition"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
