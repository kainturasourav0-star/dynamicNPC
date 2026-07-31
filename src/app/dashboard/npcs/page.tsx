"use client";

import React, { useEffect, useState } from "react";
import { Bot, Plus, Trash2, Edit2, ShieldAlert, Sparkles, X } from "lucide-react";

const NPC_PRESETS = [
  {
    name: "Custom (Empty)",
    backstory: "",
    tone: "Neutral",
    style: "",
    safetyRules: "",
    cost: "0.0100"
  },
  {
    name: "Garrick the Bartender",
    backstory: "A friendly but tired bartender who has heard every story in the kingdom. Speaks warmly and offers helpful advice to travelers.",
    tone: "Friendly",
    style: "Uses tavern slang, sounds welcoming",
    safetyRules: "Never discuss violence or real-world politics",
    cost: "0.0100"
  },
  {
    name: "Kaelen the Rogue",
    backstory: "A street-smart thief who grew up in the neon underbelly of the city. Speaks in short sentences and always keeps one eye on the door.",
    tone: "Sarcastic",
    style: "Slight whisper, cyberpunk jargon",
    safetyRules: "Never disclose thief guild secrets",
    cost: "0.0200"
  },
  {
    name: "Eldon the Merchant",
    backstory: "A veteran weapon merchant who survived the Great Siege of Oakhaven. Speaks grumpily but has a soft heart for adventurers.",
    tone: "Grumpy",
    style: "Gruff voice, grumbles occasionally",
    safetyRules: "Keep transactions PG-13, no cursing",
    cost: "0.0150"
  },
  {
    name: "Archmage Vaelathor",
    backstory: "A centuries-old wizard who guards the high archives. Speaks cryptically about ancient prophecies and galactic leylines.",
    tone: "Mysterious",
    style: "Cryptic, dramatic pauses",
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
      setName(preset.name === "Custom (Empty)" ? "" : preset.name);
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
    if (!confirm("Are you sure you want to delete this NPC?")) return;
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-400" />
            NPC Dialogue Profiles
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure backstory, behavior rules, and personality styles for each character.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition px-4 py-2.5 rounded-lg text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Create NPC Profile
        </button>
      </div>

      {npcs.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl max-w-4xl mx-auto">
          <div className="p-4 bg-slate-950/60 rounded-full inline-block mb-4 text-slate-600">
            <Bot className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No NPC Profiles Configured</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto px-4">
            AI NPCs require a set backstory and personality profile so that dialogue is generated contextually. Let's create your first profile.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition px-4 py-2 rounded-lg text-sm"
          >
            + Create NPC Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {npcs.map((npc) => (
            <div
              key={npc.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700/80 transition duration-300 relative group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-100">{npc.name}</h3>
                    <div className="flex gap-2 flex-wrap items-center mt-1">
                      <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                        Tone: {npc.tone}
                      </span>
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                        Cost: ${parseFloat(npc.cost || "0.0100").toFixed(4)} USDC
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                    <button
                      onClick={() => handleOpenEdit(npc)}
                      className="p-1.5 bg-slate-800 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 rounded-lg transition"
                      title="Edit NPC"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(npc.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-600/30 text-rose-400 hover:text-rose-300 rounded-lg transition"
                      title="Delete NPC"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Backstory</span>
                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 bg-slate-950/40 p-2.5 rounded border border-slate-800/40">
                      {npc.backstory}
                    </p>
                  </div>

                  {(npc.style || npc.safetyRules) && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {npc.style && (
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Style</span>
                          <p className="text-slate-400 truncate">{npc.style}</p>
                        </div>
                      )}
                      {npc.safetyRules && (
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase block mb-0.5">Safety Constraints</span>
                          <p className="text-rose-400/80 truncate flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                            Active
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800/40 mt-6 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>NPC ID: {npc.id}</span>
                <span>Configured: {new Date(npc.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-lg shadow-2xl relative my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-xl text-slate-100 flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              {editingNpc ? "Edit NPC Profile" : "Create NPC Profile"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingNpc && (
                <div>
                  <label className="text-xs text-indigo-400 font-mono block mb-1">Prepopulate from Preset Template</label>
                  <select
                    onChange={(e) => handleSelectPreset(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-350 focus:outline-none focus:border-indigo-500 transition"
                  >
                    {NPC_PRESETS.map((p) => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eldon the Merchant"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">Backstory & History</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. A veteran weapon merchant who survived the Great Siege of Oakhaven. Speaks grumpily but has a soft heart for adventurers."
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-mono block mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="Neutral">Neutral</option>
                    <option value="Grumpy">Grumpy</option>
                    <option value="Excited">Excited</option>
                    <option value="Mysterious">Mysterious</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Sarcastic">Sarcastic</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-mono block mb-1">Speaking Style (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Uses medieval slang, stutters slightly"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">Dialogue USDC Cost (Per Call)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  required
                  placeholder="e.g. 0.0100"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">Safety Constraints (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Never discuss modern technology, keep PG-13"
                  value={safetyRules}
                  onChange={(e) => setSafetyRules(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-semibold transition"
                >
                  {editingNpc ? "Save Changes" : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
