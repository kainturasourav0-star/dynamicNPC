"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Mic,
  Volume2,
  Square,
  Sparkles,
  Layers,
  Play,
  RotateCcw,
  Bot,
  Globe,
  Settings,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Activity
} from "lucide-react";
import { PageHeader } from "@/components/console/ConsoleUI";

interface Voice {
  id: string;
  name: string;
  category: "neural" | "cloned" | "custom";
  language: string;
  gender: "male" | "female" | "neutral";
  traits: string[];
  color: string;
}

export default function OmniVoiceStudioPage() {
  const [activeTab, setActiveTab] = useState<"agent" | "clone" | "tts" | "dubbing">("agent");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [loadingVoices, setLoadingVoices] = useState(true);

  // ─── TTS State ──────────────────────────────────────────────────────────
  const [ttsText, setTtsText] = useState(
    "Welcome to OmniVoice Studio. High-fidelity real-time neural voice synthesis, zero-shot cloning, and dialogue infrastructure."
  );
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [synthesizing, setSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);

  // ─── Clone State ────────────────────────────────────────────────────────
  const [cloneName, setCloneName] = useState("");
  const [cloneGender, setCloneGender] = useState<"male" | "female" | "neutral">("female");
  const [cloneLang, setCloneLang] = useState("en-US");
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [cloning, setCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState<string | null>(null);

  // ─── Real-Time Agent State ──────────────────────────────────────────────
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { role: "assistant", text: "Hello! I am your OmniVoice conversational agent. Tap the microphone or click below to speak." }
  ]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [agentError, setAgentError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const isAgentActiveRef = useRef(false);

  useEffect(() => {
    isAgentActiveRef.current = isAgentActive;
  }, [isAgentActive]);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const res = await fetch("/api/omnivoice/voices");
      const data = await res.json();
      if (data.status === "success" && data.voices.length > 0) {
        setVoices(data.voices);
        setSelectedVoiceId(data.voices[0].id);
      }
    } catch (err) {
      console.error("Failed to load voices:", err);
    } finally {
      setLoadingVoices(false);
    }
  };

  // ─── Handle TTS Generate ────────────────────────────────────────────────
  const handleGenerateTTS = async () => {
    if (!ttsText.trim()) return;
    setSynthesizing(true);
    setTtsError(null);

    try {
      const res = await fetch("/api/omnivoice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ttsText,
          voiceId: selectedVoiceId,
          speed: ttsSpeed,
          pitch: ttsPitch,
        }),
      });

      if (!res.ok) throw new Error("TTS generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const aud = new Audio(url);
      aud.play().catch(() => {});
    } catch (err: any) {
      setTtsError(err.message || "Failed to synthesize audio.");
    } finally {
      setSynthesizing(false);
    }
  };

  // ─── Handle Voice Clone ─────────────────────────────────────────────────
  const handleCloneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneName || !cloneFile) return;

    setCloning(true);
    setCloneSuccess(null);

    try {
      const formData = new FormData();
      formData.append("name", cloneName);
      formData.append("audio", cloneFile);
      formData.append("gender", cloneGender);
      formData.append("language", cloneLang);

      const res = await fetch("/api/omnivoice/clone", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.status === "success") {
        setCloneSuccess(`Voice profile "${cloneName}" cloned successfully!`);
        fetchVoices();
        setCloneName("");
        setCloneFile(null);
      } else {
        throw new Error(data.message || "Failed to clone voice");
      }
    } catch (err: any) {
      alert(err.message || "Error during voice cloning");
    } finally {
      setCloning(false);
    }
  };

  // ─── Real-Time Agent Voice Loop ─────────────────────────────────────────
  const startAgentConversation = () => {
    setIsAgentActive(true);
    isAgentActiveRef.current = true;
    setAgentError(null);
    listenForSpeech();
  };

  const stopAgentConversation = () => {
    setIsAgentActive(false);
    isAgentActiveRef.current = false;
    setAgentStatus("idle");
    setLiveTranscript("");
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  };

  const listenForSpeech = () => {
    if (!isAgentActiveRef.current) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAgentError("Speech recognition is not supported in this browser. Use Chrome or Edge.");
      setIsAgentActive(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognitionRef.current = recognition;

      setAgentStatus("listening");
      let capturedText = "";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        capturedText = transcript.trim();
        setLiveTranscript(capturedText);

        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        silenceTimer.current = setTimeout(() => {
          if (capturedText && isAgentActiveRef.current) {
            try { recognition.stop(); } catch {}
            processAgentResponse(capturedText);
          }
        }, 1200);
      };

      recognition.onerror = (e: any) => {
        if (e.error === "no-speech") return;
        console.warn("[Agent STT Error]", e);
      };

      recognition.onend = () => {
        if (isAgentActiveRef.current && agentStatus === "listening" && capturedText) {
          processAgentResponse(capturedText);
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Mic start failed", err);
    }
  };

  const processAgentResponse = async (userText: string) => {
    if (!userText.trim()) return;
    setAgentStatus("thinking");
    setLiveTranscript("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);

    try {
      const res = await fetch("/api/voice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          npcName: "OmniVoice Assistant",
          tone: "Warm, witty, and concise",
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      const data = await res.json();
      const reply = data.reply || "I heard you loud and clear. How can I help you next?";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);

      // Synthesize audio
      await playAgentVoice(reply);
    } catch (err: any) {
      setAgentError(err.message || "Failed to process reply.");
      setAgentStatus("idle");
    }
  };

  const playAgentVoice = async (textToSpeak: string) => {
    setAgentStatus("speaking");
    try {
      const res = await fetch("/api/omnivoice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, voiceId: selectedVoiceId }),
      });

      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioPlayerRef.current = audio;

      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    } catch (err) {
      console.error("[TTS play error]", err);
    } finally {
      if (isAgentActiveRef.current) {
        setAgentStatus("listening");
        setTimeout(() => listenForSpeech(), 300);
      } else {
        setAgentStatus("idle");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-slate-100 font-sans p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* ─── Top Nav / Breadcrumbs ────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            ← Back to Console
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-cyan-400 text-xs font-mono font-bold">OmniVoice Studio</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>GPU Neural Engine Online</span>
          </div>
        </div>
      </div>

      {/* ─── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[11px] font-semibold">
              Open-Source Voice Intelligence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            OmniVoice Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Real-time conversational agents, zero-shot voice cloning, neural text-to-speech, and automated AI video dubbing.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 rounded-xl bg-[#0F141A] border border-white/[0.08] self-start md:self-auto">
          <button
            onClick={() => setActiveTab("agent")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "agent"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Voice Agent
          </button>
          <button
            onClick={() => setActiveTab("clone")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "clone"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Cloning
          </button>
          <button
            onClick={() => setActiveTab("tts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "tts"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            TTS Studio
          </button>
          <button
            onClick={() => setActiveTab("dubbing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "dubbing"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            AI Dubbing
          </button>
        </div>
      </div>

      {/* ─── Tab Content 1: Real-Time Interactive Voice Agent ─────────── */}
      {activeTab === "agent" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualizer & Controller */}
          <div className="lg:col-span-2 rounded-2xl bg-[#0F141A] border border-white/[0.08] p-8 flex flex-col items-center justify-between min-h-[500px] relative overflow-hidden shadow-2xl">
            {/* Ambient Background Light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Status Header */}
            <div className="w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    agentStatus === "listening"
                      ? "bg-emerald-400 animate-ping"
                      : agentStatus === "thinking"
                      ? "bg-amber-400 animate-pulse"
                      : agentStatus === "speaking"
                      ? "bg-cyan-400 animate-bounce"
                      : "bg-slate-600"
                  }`}
                />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold">
                  Status: {agentStatus}
                </span>
              </div>

              {/* Voice Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Voice:</span>
                <select
                  value={selectedVoiceId}
                  onChange={(e) => setSelectedVoiceId(e.target.value)}
                  className="bg-[#07090C] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
                >
                  {voices.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#0F141A] text-slate-200">
                      {v.name} ({v.gender})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Orb Visualizer & Button */}
            <div className="my-10 flex flex-col items-center z-10">
              <button
                onClick={isAgentActive ? stopAgentConversation : startAgentConversation}
                className={`relative group p-8 rounded-full transition-all duration-300 ${
                  isAgentActive
                    ? "bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border-2 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)] hover:scale-105"
                    : "bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] hover:scale-105"
                }`}
              >
                {isAgentActive ? (
                  <Square className="w-16 h-16 text-rose-400 animate-pulse" />
                ) : (
                  <Mic className="w-16 h-16 text-cyan-400 group-hover:text-cyan-300" />
                )}
              </button>

              <p className="text-xs text-slate-400 mt-4 font-mono">
                {isAgentActive ? "Tap to pause conversation" : "Click microphone to start conversational agent"}
              </p>

              {liveTranscript && (
                <div className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-cyan-300 font-mono animate-pulse">
                  "{liveTranscript}"
                </div>
              )}

              {agentError && (
                <div className="mt-4 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {agentError}
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="w-full flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-4 z-10">
              <span>Full-Duplex Audio & STT</span>
              <span>Sub-150ms Latency Pipeline</span>
            </div>
          </div>

          {/* Conversation History Stream */}
          <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 flex flex-col justify-between h-[500px]">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                Dialogue Memory Thread
              </h3>
              <p className="text-xs text-slate-400 mb-4">Live multi-turn conversation logs.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-white/5 border border-white/10 text-slate-200 self-end ml-4"
                      : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 mr-4"
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider block mb-1 text-slate-400">
                    {m.role === "user" ? "You" : "OmniVoice AI"}
                  </span>
                  {m.text}
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                setMessages([{ role: "assistant", text: "Conversation history cleared. Ready for fresh prompt." }])
              }
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs text-slate-400 hover:text-white rounded-lg border border-white/5 transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Dialogue History
            </button>
          </div>
        </div>
      )}

      {/* ─── Tab Content 2: Zero-Shot Voice Cloning ──────────────────── */}
      {activeTab === "clone" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-[#0F141A] border border-white/[0.08] p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-1">Clone Any Voice in Seconds</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Upload a 3-10 second audio recording (.mp3, .wav, .m4a) to generate a high-fidelity neural voice clone with zero model retraining.
            </p>

            <form onSubmit={handleCloneSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Voice Profile Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commander Sarah, Tavern Elf, Cyberpunk Broker"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1.5">Gender Archetype</label>
                  <select
                    value={cloneGender}
                    onChange={(e) => setCloneGender(e.target.value as any)}
                    className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1.5">Primary Language</label>
                  <select
                    value={cloneLang}
                    onChange={(e) => setCloneLang(e.target.value)}
                    className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="ja-JP">Japanese</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                  </select>
                </div>
              </div>

              {/* Audio Upload Dropzone */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Audio Sample (3-15 seconds)</label>
                <div className="border border-dashed border-white/20 hover:border-cyan-500/50 rounded-2xl p-6 text-center bg-[#07090C] cursor-pointer transition">
                  <input
                    type="file"
                    accept="audio/*"
                    required
                    onChange={(e) => setCloneFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20"
                  />
                  {cloneFile && (
                    <p className="text-xs text-emerald-400 mt-2 font-mono">
                      ✓ Selected: {cloneFile.name} ({(cloneFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>

              {cloneSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {cloneSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={cloning}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
              >
                {cloning ? "Cloning Voice Sample..." : "Extract & Save Voice Profile"}
              </button>
            </form>
          </div>

          {/* Preset Voice Gallery */}
          <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Available Voice Profiles ({voices.length})
            </h3>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {voices.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-[#07090C] border border-white/5 flex items-center justify-between hover:border-cyan-500/30 transition"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{v.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {v.language} · {v.gender}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                    {v.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content 3: TTS Studio ───────────────────────────────── */}
      {activeTab === "tts" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-[#0F141A] border border-white/[0.08] p-8 shadow-xl space-y-5">
            <h2 className="text-lg font-bold text-white">Neural Speech Synthesis</h2>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Input Text</label>
              <textarea
                rows={5}
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder="Type anything you want the neural voice to speak aloud..."
                className="w-full bg-[#07090C] border border-white/10 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Speaking Speed ({ttsSpeed}x)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={ttsSpeed}
                  onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">
                  Pitch Shift ({ttsPitch > 1 ? `+${ttsPitch}` : ttsPitch})
                </label>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.05"
                  value={ttsPitch}
                  onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {ttsError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {ttsError}
              </div>
            )}

            <button
              onClick={handleGenerateTTS}
              disabled={synthesizing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              {synthesizing ? "Synthesizing Audio..." : "Generate Speech"}
            </button>

            {audioUrl && (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Audio Ready
                  </span>
                  <a
                    href={audioUrl}
                    download="omnivoice-output.wav"
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Download WAV
                  </a>
                </div>
                <audio controls src={audioUrl} className="w-full rounded-lg" />
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              Active Voice Model
            </h3>
            <div className="p-4 rounded-xl bg-[#07090C] border border-white/5 space-y-3">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Selected Persona</span>
              <p className="text-sm font-bold text-white">
                {voices.find((v) => v.id === selectedVoiceId)?.name || "Default Voice"}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by OmniVoice acoustic vector models and sub-millisecond neural vocoders.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content 4: AI Dubbing & Video Localization ──────────── */}
      {activeTab === "dubbing" && (
        <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-8 shadow-xl space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-white mb-1">Cinematic Video & Audio Dubbing</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              OmniVoice Demucs splits vocals from background score, WhisperX diarizes multi-speaker dialogues, and zero-shot cloning re-voices in 646 languages while preserving original background audio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[#07090C] border border-white/5 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">01. Demucs Separation</span>
              <p className="text-xs text-slate-400">Isolates speaker dialogue track from ambient audio and music stems.</p>
            </div>
            <div className="p-5 rounded-xl bg-[#07090C] border border-white/5 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">02. Diarization & Translate</span>
              <p className="text-xs text-slate-400">Identifies who said what with word-level timestamps across 600+ languages.</p>
            </div>
            <div className="p-5 rounded-xl bg-[#07090C] border border-white/5 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">03. Voice Match & Re-Mux</span>
              <p className="text-xs text-slate-400">Clones original actors' vocal timbres into target language and exports MP4.</p>
            </div>
          </div>

          <div className="border border-dashed border-white/20 hover:border-cyan-500/50 rounded-2xl p-10 text-center bg-[#07090C] cursor-pointer transition">
            <Play className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Drop video or audio file for dubbing</h4>
            <p className="text-xs text-slate-400 font-mono">Supports MP4, MOV, WAV, MP3 up to 500 MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
