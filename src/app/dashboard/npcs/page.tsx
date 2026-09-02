"use client";

import React, { useEffect, useState } from "react";
import { Bot, Plus, Trash2, Edit2, ShieldAlert, Sparkles, X, Coins, MessageSquare, Zap } from "lucide-react";

const NPC_PRESETS = [
  {
    name: "Custom Persona",
    backstory: "",
    tone: "Neutral",
    style: "",
    safetyRules: "",
    cost: "0.0100"
  },
  {
    name: "Garrick the Bartender",
    backstory: "A friendly but tired tavern keeper who has heard every story in the kingdom. Speaks warmly, uses medieval tavern slang, and offers helpful hints to weary adventurers.",
    tone: "Friendly",
    style: "Uses tavern slang, sounds welcoming and wise",
    safetyRules: "Never discuss violence or real-world politics",
    cost: "0.0100"
  },
  {
    name: "Kaelen the Cyber-Rogue",
    backstory: "A street-smart netrunner who grew up in the neon underbelly of the megacity. Speaks in short tactical sentences and always monitors the network traffic.",
    tone: "Sarcastic",
    style: "Slight whisper, cyberpunk hacker jargon",
    safetyRules: "Never disclose guild master keys or coordinates",
    cost: "0.0200"
  },
  {
    name: "Eldon the Armorer",
    backstory: "A veteran blacksmith and weapon merchant who survived the Great Siege. Speaks grumpily but has a soft heart for novice adventurers.",
    tone: "Grumpy",
    style: "Gruff voice, grumbles occasionally about forge steel",
    safetyRules: "Keep transactions PG-13, no cursing",
    cost: "0.0150"
  },
  {
    name: "Archmage Vaelathor",
    backstory: "A centuries-old mystic who guards the high cosmic archives. Speaks cryptically about ancient prophecies and leylines.",
    tone: "Mysterious",
    style: "Cryptic, dramatic pauses, arcane metaphors",
    safetyRules: "Never reveal forbidden dark magic spells",
    cost: "0.0500"
  }
];

interface NpcProfile {
  id: string;
  name: string;
  backstory: string;
  tone: string;
  style: string;
  safetyRules: string;
  cost: string;
  createdAt: string;
}

export default function NpcsPage() {
  const [npcs, setNpcs] = useState<NpcProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNpc, setEditingNpc] = useState<NpcProfile | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [backstory, setBackstory] = useState("");
  const [tone, setTone] = useState("Neutral");
  const [style, setStyle] = useState("");
  const [safetyRules, setSafetyRules] = useState("");
  const [cost, setCost] = useState("0.0100");

  useEffect(() => {
    fetchNpcs();
  }, []);

  const fetchNpcs = async () => {
    try {
      const res = await fetch("/api/npcs");
      const data = await res.json();
      if (data.status === "success") {
        setNpcs(data.npcs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingNpc(null);
    setName("");
    setBackstory("");
    setTone("Neutral");
    setStyle("");
    setSafetyRules("");
    setCost("0.0100");
    setShowModal(true);
  };

  const handleOpenEdit = (npc: NpcProfile) => {
    setEditingNpc(npc);
    setName(npc.name);
    setBackstory(npc.backstory);
    setTone(npc.tone);
    setStyle(npc.style || "");
    setSafetyRules(npc.safetyRules || "");
    setCost(npc.cost || "0.0100");
    setShowModal(true);
  };

  const handleSelectPreset = (presetName: string) => {
    const preset = NPC_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setName(preset.name === "Custom Persona" ? "" : preset.name);
      setBackstory(preset.backstory);
      setTone(preset.tone);
      setStyle(preset.style);
      setSafetyRules(preset.safetyRules);
      setCost(preset.cost || "0.0100");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingNpc ? `/api/npcs/${editingNpc.id}` : "/api/npcs";
    const method = editingNpc ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, backstory, tone, style, safetyRules, cost }),
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchNpcs();
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this NPC profile?")) return;
    try {
      const res = await fetch(`/api/npcs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success") {
        setNpcs(npcs.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400"></div>
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Loading Persona Database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[11px] font-semibold">
              Neural Personas ({npcs.length})
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            NPC Dialogue Profiles
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Configure backstory, speaking cadence, tone, safety boundaries, and x402 micropayment rates for each NPC.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          Create NPC Profile
        </button>
      </div>

      {npcs.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-2xl bg-[#0a0e18] border border-dashed border-white/15 max-w-2xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No NPC Profiles Configured</h3>
          <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto leading-relaxed">
            AI NPCs require a backstory and tone to generate contextual dialogue responses.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" /> Create First Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {npcs.map((npc) => (
            <div
              key={npc.id}
              className="rounded-2xl bg-[#0a0e18] border border-white/10 p-6 flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 group"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                        {npc.name}
                      </h3>
                      <div className="flex gap-2 flex-wrap items-center mt-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                          {npc.tone}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          ${parseFloat(npc.cost || "0.0100").toFixed(4)} USDC
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(npc)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/5 transition"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(npc.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 transition"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Backstory */}
                <div className="space-y-3 mt-4">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1 font-semibold">Backstory & Knowledge</span>
                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      {npc.backstory}
                    </p>
                  </div>

                  {(npc.style || npc.safetyRules) && (
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      {npc.style && (
                        <div className="p-2.5 rounded-lg bg-white/[0.01] border border-white/5">
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block mb-0.5">Style</span>
                          <p className="text-slate-300 truncate text-[11px]">{npc.style}</p>
                        </div>
                      )}
                      {npc.safetyRules && (
                        <div className="p-2.5 rounded-lg bg-white/[0.01] border border-white/5">
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block mb-0.5">Safety Rule</span>
                          <p className="text-emerald-400/90 truncate flex items-center gap-1 text-[11px]">
                            <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                            Enforced
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-white/5 mt-5 pt-3.5 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>ID: {npc.id.substring(0, 10)}...</span>
                <span>{new Date(npc.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-[#0d121f] border border-white/15 p-8 rounded-2xl w-full max-w-xl shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">
                  {editingNpc ? "Edit NPC Profile" : "Create NPC Profile"}
                </h3>
                <p className="text-xs text-slate-400">Configure persona behavior and payment rate.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingNpc && (
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1.5">Preset Character Template</label>
                  <select
                    onChange={(e) => handleSelectPreset(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                  >
                    {NPC_PRESETS.map((p) => (
                      <option key={p.name} value={p.name} className="bg-[#0d121f] text-slate-200">{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Character Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Garrick the Tavern Keeper"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition placeholder-slate-600"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Backstory & Lore Knowledge</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe where the NPC came from, what they know, and how they behave."
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition resize-none placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1.5">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="Neutral" className="bg-[#0d121f]">Neutral</option>
                    <option value="Friendly" className="bg-[#0d121f]">Friendly</option>
                    <option value="Sarcastic" className="bg-[#0d121f]">Sarcastic</option>
                    <option value="Grumpy" className="bg-[#0d121f]">Grumpy</option>
                    <option value="Mysterious" className="bg-[#0d121f]">Mysterious</option>
                    <option value="Excited" className="bg-[#0d121f]">Excited</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1.5">Dialogue USDC Cost</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    required
                    placeholder="e.g. 0.0100"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Speaking Cadence / Style (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Speaks in short sentences, uses cyberpunk slang"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition placeholder-slate-600"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Safety Constraints & Rules (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Keep discussions PG-13, never break immersion"
                  value={safetyRules}
                  onChange={(e) => setSafetyRules(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition placeholder-slate-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium rounded-xl border border-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
                >
                  {editingNpc ? "Save Profile" : "Create Persona"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
