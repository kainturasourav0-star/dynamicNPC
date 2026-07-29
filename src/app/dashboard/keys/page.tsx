"use client";

import React, { useEffect, useState } from "react";
import { Key, Plus, Trash2, Copy, Check, EyeOff, ShieldCheck } from "lucide-react";

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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <Key className="w-8 h-8 text-amber-400" />
          API Credentials
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage high-entropy authorization keys to authenticate your game clients with the dialogue service.
        </p>
      </div>

      {/* Warning if new key is created */}
      {createdKey && (
        <div className="bg-amber-600/10 border border-amber-500/30 p-6 rounded-xl space-y-3 relative animate-fadeIn shadow-[0_0_20px_rgba(245,158,11,0.05)]">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <EyeOff className="w-5 h-5" />
            Copy your API Key now!
          </div>
          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
            For security reasons, we store only cryptographic hashes of your API keys. We cannot show this key to you again. If you lose it, you will need to revoke it and generate a new one.
          </p>
          <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-sm max-w-xl">
            <span className="text-emerald-400 flex-1 truncate">{createdKey}</span>
            <button
              onClick={() => handleCopy(createdKey, "created")}
              className="p-1.5 hover:bg-slate-800 rounded transition text-slate-400 hover:text-slate-200"
            >
              {copiedId === "created" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={() => setCreatedKey(null)}
            className="text-xs text-slate-400 hover:text-slate-200 underline mt-2 block"
          >
            I have copied the key, close this warning
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit space-y-4">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            Generate New Key
          </h3>
          <form onSubmit={handleCreateKey} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">Key Name / Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Production Game Client"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-sm transition shadow-[0_0_10px_rgba(79,70,229,0.2)]"
            >
              Generate API Key
            </button>
          </form>
        </div>

        {/* Keys List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            Active API Keys
          </h3>

          {keys.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
              No active API keys found. Use the panel on the left to generate one.
            </div>
          ) : (
            <div className="space-y-4">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700/60 transition"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-200 text-sm">{k.name}</div>
                    <div className="font-mono text-xs text-slate-500 flex items-center gap-1.5">
                      {k.displayKey}
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active"></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">
                      Created: {new Date(k.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-2 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-lg transition"
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
