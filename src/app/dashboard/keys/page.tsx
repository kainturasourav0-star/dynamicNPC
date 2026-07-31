"use client";

import React, { useEffect, useState } from "react";
import { Key, Plus, Trash2, Copy, Check, EyeOff, Shield } from "lucide-react";

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
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Loading Keys...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="border-b border-[#2F323B] pb-6">
        <p className="font-mono text-cyan-400 text-[10px] uppercase tracking-[0.3em] mb-2">Auth Management</p>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
          <Key className="w-7 h-7 text-cyan-400" />
          API Credentials
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage high-entropy authorization keys to authenticate your game clients with the dialogue service.
        </p>
      </div>

      {/* Warning if new key is created */}
      {createdKey && (
        <div className="bg-amber-500/5 border border-amber-500/30 p-6 space-y-3 relative">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm font-mono uppercase tracking-wider">
            <EyeOff className="w-5 h-5" />
            ⚠ Copy your API Key now — it will never be shown again!
          </div>
          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
            For security reasons, we store only cryptographic hashes of your API keys. We cannot recover this key. If you lose it, you must revoke it and generate a new one.
          </p>
          <div className="flex items-center gap-2 bg-[#050505] p-3 border border-amber-500/20 font-mono text-sm max-w-xl">
            <span className="text-lime-400 flex-1 truncate">{createdKey}</span>
            <button
              onClick={() => handleCopy(createdKey, "created")}
              className="p-1.5 hover:bg-white/10 transition text-slate-400 hover:text-white"
            >
              {copiedId === "created" ? <Check className="w-4 h-4 text-lime-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={() => setCreatedKey(null)}
            className="text-xs text-slate-400 hover:text-white underline mt-2 block font-mono"
          >
            I have copied the key — dismiss this warning
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-[#0c0c0c] border border-[#2F323B] p-6 h-fit space-y-4">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 font-mono uppercase tracking-wider text-xs">
            <Plus className="w-4 h-4 text-cyan-400" />
            Generate New Key
          </h3>
          <form onSubmit={handleCreateKey} className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Key Name / Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Production Game Client"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full bg-[#050505] border border-[#2F323B] rounded-none px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition placeholder-slate-700"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-400 hover:bg-white text-black font-bold py-2.5 rounded-none text-xs font-mono uppercase tracking-wider transition"
            >
              Generate API Key
            </button>
          </form>

          {/* Key info box */}
          <div className="border-t border-[#2F323B] pt-4">
            <div className="flex gap-2 text-[10px] text-slate-500 font-mono leading-relaxed">
              <Shield className="w-3 h-3 flex-shrink-0 mt-0.5 text-cyan-400/50" />
              <span>Keys are hashed with SHA-256. The raw value is shown only once upon creation.</span>
            </div>
          </div>
        </div>

        {/* Keys List */}
        <div className="lg:col-span-2 bg-[#0c0c0c] border border-[#2F323B] p-6 space-y-6">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 font-mono uppercase tracking-wider text-xs">
            <Key className="w-4 h-4 text-cyan-400" />
            Active API Keys
          </h3>

          {keys.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#2F323B] text-slate-500 text-xs font-mono">
              <Key className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No active API keys found.</p>
              <p className="mt-1 text-slate-600">Use the panel on the left to generate one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between p-4 bg-[#050505] border border-[#2F323B] hover:border-cyan-400/20 transition"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="font-bold text-slate-200 text-sm uppercase tracking-tight">{k.name}</div>
                    <div className="font-mono text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                      {k.displayKey}
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-500 flex-shrink-0" title="Active"></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                    <span className="text-[9px] text-slate-600 font-mono hidden sm:inline-block uppercase tracking-wider">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-2 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition border border-transparent hover:border-rose-500/20"
                      title="Revoke API Key"
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
