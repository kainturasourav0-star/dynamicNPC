"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Mic, Volume2, Square, Settings, Send,
  RotateCcw, X, Bot, Zap, ChevronDown, AlertCircle, Sparkles, MessageSquare
} from "lucide-react";
import { PageHeader } from "@/components/console/ConsoleUI";

// ─── Voice presets ───────────────────────────────────────────────────────────
const VOICES = [
  { name: "Nolan", label: "Warm Bartender",  id: "78291f16-fc9b-4f72-a21b-1ac7d767d104", color: "#34d399" },
  { name: "Yua",   label: "Wise Archmage",   id: "dd610410-2b01-426e-b673-2c69bcf5f93b", color: "#a78bfa" },
  { name: "Aoi",   label: "Cyberpunk Rogue", id: "882079ce-8513-4a0e-8c0c-c7b8995b12f4", color: "#f472b6" },
  { name: "Kenta", label: "Grumpy Dwarf",    id: "d1708217-3c6f-46c5-a46f-d47abdcd59e5", color: "#fb923c" },
];

const TONE_VOICE_MAP: Record<string, number> = {
  friendly: 0, mysterious: 1, sarcastic: 2, grumpy: 3,
};

interface Npc  { id: string; name: string; backstory: string; tone: string; cost: string; }
interface Msg  { role: "user" | "assistant"; content: string; }
type State = "idle" | "listening" | "thinking" | "speaking";

// ─── Animated orb (canvas-based) ──────────────────────────────────────────────
function VoiceOrb({
  state, amp, color, onClick,
}: { state: State; amp: number; color: string; onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const tRef      = useRef(0);

  const stateRef = useRef(state);
  const ampRef   = useRef(amp);
  const colorRef = useRef(color);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { ampRef.current   = amp;   }, [amp]);
  useEffect(() => { colorRef.current = color; }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W   = canvas.width;
    const H   = canvas.height;
    const cx  = W / 2, cy = H / 2;
    const BR  = W * 0.27;

    function frame() {
      tRef.current += 0.018;
      const t  = tRef.current;
      const ph = stateRef.current;
      const a  = Math.min(ampRef.current * 2.5, 1);
      const c  = colorRef.current;

      ctx.clearRect(0, 0, W, H);

      // Glow rings
      const rings = ph === "speaking" ? 4 : ph === "listening" ? 3 : ph === "thinking" ? 2 : 0;
      for (let i = 0; i < rings; i++) {
        const pulse = Math.sin(t * 1.4 + i * 0.9) * 0.5 + 0.5;
        const rr    = BR + 14 + i * 18 + (ph === "speaking" ? a * 28 * pulse : pulse * 8);
        const alpha = (0.14 - i * 0.03) * (ph === "speaking" ? 0.6 + a * 0.4 : 0.45);
        const g     = ctx.createRadialGradient(cx, cy, rr - 5, cx, cy, rr + 8);
        g.addColorStop(0,   c + "00");
        g.addColorStop(0.5, c + Math.round(alpha * 255).toString(16).padStart(2, "0"));
        g.addColorStop(1,   c + "00");
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }

      // Morphing blob
      const morph = ph === "speaking"  ? a * 20 + Math.sin(t * 6) * 2
                  : ph === "listening" ? a * 14 + Math.sin(t * 2.2) * 2
                  : ph === "thinking"  ? Math.sin(t * 1.6) * 5
                  : 0;

      const bg = ctx.createRadialGradient(cx - BR * 0.3, cy - BR * 0.3, BR * 0.05, cx, cy, BR + morph + 4);
      if (ph === "idle") {
        bg.addColorStop(0, "#1e293b"); bg.addColorStop(0.6, "#0f172a"); bg.addColorStop(1, "#07090C");
      } else if (ph === "thinking") {
        const bl = Math.sin(t * 1.8) * 0.5 + 0.5;
        bg.addColorStop(0, `rgba(96,165,250,${0.25 + bl * 0.2})`);
        bg.addColorStop(0.5, "#0f172a"); bg.addColorStop(1, "#07090C");
      } else {
        bg.addColorStop(0, c + "55"); bg.addColorStop(0.35, c + "18");
        bg.addColorStop(0.7, "#0f172a"); bg.addColorStop(1, "#07090C");
      }

      ctx.beginPath();
      for (let i = 0; i <= 128; i++) {
        const θ = (i / 128) * Math.PI * 2;
        const n = Math.sin(θ * 3 + t * 1.1) * morph * 0.4
                + Math.sin(θ * 5 - t * 0.9) * morph * 0.3
                + Math.sin(θ * 7 + t * 1.5) * morph * 0.2
                + Math.sin(θ * 2 - t * 0.7) * morph * 0.1;
        const r = BR + morph * 0.5 + n;
        const x = cx + Math.cos(θ) * r, y = cy + Math.sin(θ) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fillStyle = bg; ctx.fill();

      // Gloss
      const hl = ctx.createRadialGradient(cx - BR * 0.35, cy - BR * 0.35, 0, cx - BR * 0.2, cy - BR * 0.2, BR * 0.6);
      hl.addColorStop(0, "rgba(255,255,255,0.1)"); hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.arc(cx, cy, BR + morph * 0.5, 0, Math.PI * 2); ctx.fillStyle = hl; ctx.fill();

      // Border
      ctx.beginPath(); ctx.arc(cx, cy, BR + morph * 0.5 + 1, 0, Math.PI * 2);
      ctx.strokeStyle = ph !== "idle" ? c + "55" : "#1e293b"; ctx.lineWidth = 1.5; ctx.stroke();

      // Waveform bars (speaking)
      if (ph === "speaking" && a > 0.01) {
        const wr = BR + morph * 0.5 + 9;
        for (let i = 0; i < 52; i++) {
          const θ = (i / 52) * Math.PI * 2;
          const h = 3 + a * 16 * (Math.sin(i * 0.5 + t * 9) * 0.5 + 0.5);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(θ) * wr,       cy + Math.sin(θ) * wr);
          ctx.lineTo(cx + Math.cos(θ) * (wr + h), cy + Math.sin(θ) * (wr + h));
          ctx.strokeStyle = c + "88"; ctx.lineWidth = 1.5; ctx.stroke();
        }
      }

      // Thinking dots
      if (ph === "thinking") {
        for (let d = 0; d < 3; d++) {
          const dy = Math.sin(t * 4 + d * 1.1) * 6;
          const al = 0.5 + Math.sin(t * 3 + d) * 0.4;
          ctx.beginPath();
          ctx.arc(cx - 16 + d * 16, cy + dy, 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96,165,250,${al})`; ctx.fill();
        }
      }

      // Mic icon (idle / listening)
      if (ph === "idle" || ph === "listening") {
        const ic = ph === "listening" ? c + "ee" : "#64748baa";
        const s  = 20;
        ctx.save(); ctx.translate(cx, cy);
        ctx.beginPath(); ctx.roundRect(-s * 0.42, -s * 0.88, s * 0.84, s * 1.15, s * 0.42);
        ctx.fillStyle = ic; ctx.fill();
        ctx.beginPath(); ctx.arc(0, s * 0.32, s * 0.72, Math.PI, 0);
        ctx.strokeStyle = ic; ctx.lineWidth = 3; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, s * 1.04); ctx.lineTo(0, s * 1.28);
        ctx.strokeStyle = ic; ctx.lineWidth = 3; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-s * 0.38, s * 1.28); ctx.lineTo(s * 0.38, s * 1.28);
        ctx.strokeStyle = ic; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
      }

      // Speaker icon (speaking)
      if (ph === "speaking") {
        ctx.save(); ctx.translate(cx, cy);
        ctx.fillStyle = c + "cc";
        const sw = 18;
        ctx.fillRect(-sw * 0.85, -sw * 0.5, sw * 0.55, sw);
        ctx.beginPath(); ctx.moveTo(-sw * 0.3, -sw * 0.5); ctx.lineTo(sw * 0.7, -sw * 0.9);
        ctx.lineTo(sw * 0.7, sw * 0.9); ctx.lineTo(-sw * 0.3, sw * 0.5); ctx.closePath();
        ctx.fill();
        for (let i = 1; i <= 2; i++) {
          const al = 0.4 + Math.sin(t * 6 + i) * 0.3;
          ctx.beginPath();
          ctx.arc(sw * 0.75, 0, sw * i * 0.35 + (Math.sin(t * 8 + i) * 2), -0.7, 0.7);
          ctx.strokeStyle = c + Math.round(al * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = 2; ctx.stroke();
        }
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <button
      onClick={onClick}
      className="focus:outline-none active:scale-95 transition-transform duration-100 select-none"
      style={{
        filter: state !== "idle" ? `drop-shadow(0 0 32px ${color}66)` : "none",
        transition: "filter .5s ease",
      }}
    >
      <canvas ref={canvasRef} width={300} height={300}
        className="w-[220px] h-[220px] sm:w-[260px] sm:h-[260px]" />
    </button>
  );
}

const MAX_FULL     = 40;
const RECENT_WINDOW = 20;

function buildContextHistory(allMsgs: Msg[]): { role: string; content: string }[] {
  if (allMsgs.length <= MAX_FULL) {
    return allMsgs.map(m => ({ role: m.role, content: m.content }));
  }

  const older  = allMsgs.slice(0, allMsgs.length - RECENT_WINDOW);
  const recent = allMsgs.slice(-RECENT_WINDOW);

  const summary = older.reduce((acc, m) => {
    const tag = m.role === "user" ? "User" : "Assistant";
    return acc + `${tag}: ${m.content.slice(0, 120)}\n`;
  }, "");

  const summaryNote: { role: string; content: string } = {
    role: "system",
    content:
      `[Earlier conversation summary — ${older.length} messages]\n` +
      summary.trim() +
      "\n[End of summary — continue naturally from recent messages below]",
  };

  return [summaryNote, ...recent.map(m => ({ role: m.role, content: m.content }))];
}

export default function VoiceAssistantPage() {
  const [npcs,     setNpcs]     = useState<Npc[]>([]);
  const [npcId,    setNpcId]    = useState("");
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [history,  setHistory]  = useState<Msg[]>([]);
  const [liveText, setLiveText] = useState("");
  const [inputText,setInputText]= useState("");
  const [state,    setState]    = useState<State>("idle");
  const [amp,      setAmp]      = useState(0);
  const [active,   setActive]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [showPanel,setPanel]    = useState(false);

  const voiceRef      = useRef(VOICES[0]);
  const npcRef        = useRef<Npc | undefined>(undefined);
  const histRef       = useRef<Msg[]>([]);
  const activeRef     = useRef(false);
  const stateRef      = useRef<State>("idle");
  const recRef        = useRef<any>(null);
  const audRef        = useRef<HTMLAudioElement | null>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const actxRef       = useRef<AudioContext | null>(null);
  const ampRafRef     = useRef(0);
  const smoothRef     = useRef(0);
  const silRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTextRef   = useRef("");
  const endRef        = useRef<HTMLDivElement>(null);
  const isProcessing    = useRef(false);
  const sttErrorCount   = useRef(0);
  const sttRestartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const listenFn = useRef<() => void>(() => {});
  const chatFn   = useRef<(msg: string) => Promise<void>>(async () => {});
  const speakFn  = useRef<(text: string) => Promise<void>>(async () => {});

  useEffect(() => { histRef.current   = history; }, [history]);
  useEffect(() => { activeRef.current  = active;  }, [active]);
  useEffect(() => { stateRef.current   = state;   }, [state]);
  useEffect(() => { voiceRef.current   = VOICES[voiceIdx]; }, [voiceIdx]);
  useEffect(() => { npcRef.current     = npcs.find(n => n.id === npcId); }, [npcId, npcs]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, liveText]);

  useEffect(() => {
    fetch("/api/npcs").then(r => r.json()).then(d => {
      if (d.status === "success" && d.npcs.length > 0) {
        setNpcs(d.npcs); setNpcId(d.npcs[0].id);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;
    setVoiceIdx(TONE_VOICE_MAP[npc.tone.toLowerCase()] ?? 0);
  }, [npcId, npcs]);

  const startAmp = (stream: MediaStream) => {
    const ctx  = new AudioContext();
    const src  = ctx.createMediaStreamSource(stream);
    const an   = ctx.createAnalyser();
    an.fftSize = 256; an.smoothingTimeConstant = 0.75;
    src.connect(an); actxRef.current = ctx;
    const buf = new Float32Array(an.fftSize);
    const loop = () => {
      an.getFloatTimeDomainData(buf);
      const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length);
      smoothRef.current = smoothRef.current * 0.82 + rms * 0.18;
      setAmp(smoothRef.current);
      ampRafRef.current = requestAnimationFrame(loop);
    };
    ampRafRef.current = requestAnimationFrame(loop);
  };

  const stopAmp = () => {
    cancelAnimationFrame(ampRafRef.current);
    actxRef.current?.close(); actxRef.current = null;
    smoothRef.current = 0; setAmp(0);
  };

  const go = (s: State) => { stateRef.current = s; setState(s); };

  const speak = useCallback(async (text: string) => {
    go("speaking");
    try {
      const res = await fetch("/api/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), voiceId: voiceRef.current.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `TTS ${res.status}`);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const aud  = new Audio(url);
      audRef.current = aud;

      await new Promise<void>(resolve => {
        aud.onended  = () => { URL.revokeObjectURL(url); resolve(); };
        aud.onerror  = () => { URL.revokeObjectURL(url); resolve(); };
        aud.play().catch(() => resolve());
      });
    } catch (e: any) {
      console.error("[speak]", e.message);
    } finally {
      audRef.current = null;
      if (activeRef.current) {
        go("idle");
        setTimeout(() => { if (activeRef.current) listenFn.current(); }, 450);
      } else {
        go("idle");
      }
    }
  }, []);

  const chat = useCallback(async (userMsg: string) => {
    if (!userMsg.trim()) {
      if (activeRef.current) listenFn.current();
      return;
    }

    if (isProcessing.current) return;
    isProcessing.current = true;

    go("thinking");
    setLiveText("");
    setError(null);

    const userTurn: Msg = { role: "user", content: userMsg };
    const msgs: Msg[] = [...histRef.current, userTurn];
    setHistory(prev => [...prev, userTurn]);
    histRef.current = msgs;

    try {
      const npc = npcRef.current;
      const recentHistory = buildContextHistory(msgs);

      const res = await fetch("/api/voice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:   userMsg,
          npcName:   npc?.name      || "AI Assistant",
          backstory: npc?.backstory || "A helpful, engaging AI assistant.",
          tone:      npc?.tone      || "Friendly",
          history:   recentHistory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const status = res.status;
        if (status === 429) throw new Error("Rate limited — please wait a moment and try again.");
        if (status === 500 || status === 502 || status === 503)
          throw new Error("AI service temporarily unavailable. Please retry in a moment.");
        throw new Error(errData.error || `Server error ${status}`);
      }

      const data  = await res.json();
      const reply = data.reply?.trim() || "Interesting — tell me more.";

      const assistantTurn: Msg = { role: "assistant", content: reply };
      setHistory(prev => [...prev, assistantTurn]);
      histRef.current = [...histRef.current, assistantTurn];

      await speakFn.current(reply);
    } catch (e: any) {
      console.error("[chat]", e.message);
      setError(e.message || "Failed to get a response. Please try again.");
      go("idle");
      if (activeRef.current) setTimeout(() => listenFn.current(), 600);
    } finally {
      isProcessing.current = false;
    }
  }, []);

  const listen = useCallback(() => {
    if (!activeRef.current) return;
    if (stateRef.current === "thinking" || stateRef.current === "speaking") return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Web Speech API not supported. Please use Chrome or Edge.");
      return;
    }

    const rec = new SR();
    rec.lang           = "en-US";
    rec.interimResults = true;
    rec.continuous     = true;
    recRef.current     = rec;
    go("listening");
    setLiveText("");
    lastTextRef.current = "";

    const submitCapturedText = () => {
      if (silRef.current) clearTimeout(silRef.current);
      try { rec.stop(); } catch {}
      const text = lastTextRef.current.trim();
      setLiveText("");
      if (text && activeRef.current) {
        chatFn.current(text);
      } else if (activeRef.current) {
        go("idle");
        setTimeout(() => { if (activeRef.current) listenFn.current(); }, 300);
      }
    };

    rec.onresult = (e: any) => {
      sttErrorCount.current = 0;
      let final = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      const combined = (final + interim).trim();
      if (combined) {
        setLiveText(combined);
        lastTextRef.current = combined;
        if (silRef.current) clearTimeout(silRef.current);
        silRef.current = setTimeout(submitCapturedText, 1400);
      }
    };

    rec.onend = () => {
      recRef.current = null;
      if (stateRef.current === "listening") {
        const text = lastTextRef.current.trim();
        setLiveText("");
        if (text && activeRef.current) {
          chatFn.current(text);
        } else if (activeRef.current) {
          go("idle");
          setTimeout(() => { if (activeRef.current) listenFn.current(); }, 300);
        } else {
          go("idle");
        }
      }
    };

    rec.onerror = (e: any) => {
      recRef.current = null;
      if (e.error === "aborted") return;
      console.warn("[STT error]", e.error);
      go("idle");

      if (!activeRef.current) return;

      sttErrorCount.current = Math.min(sttErrorCount.current + 1, 8);
      if (sttErrorCount.current >= 8) {
        setError("Microphone appears unavailable. Please check permissions and restart the session.");
        activeRef.current = false;
        setActive(false);
        return;
      }

      const delay = Math.min(400 * Math.pow(2, sttErrorCount.current - 1), 5000);
      if (sttRestartTimer.current) clearTimeout(sttRestartTimer.current);
      sttRestartTimer.current = setTimeout(() => {
        sttRestartTimer.current = null;
        if (activeRef.current) listenFn.current();
      }, delay);
    };

    try { rec.start(); } catch (e) { console.warn("rec.start()", e); }
  }, []);

  useEffect(() => { listenFn.current = listen; }, [listen]);
  useEffect(() => { chatFn.current   = chat;   }, [chat]);
  useEffect(() => { speakFn.current  = speak;  }, [speak]);

  const startSession = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startAmp(stream);
    } catch {
      setError("Microphone access denied. Please allow microphone permissions.");
      return;
    }
    activeRef.current = true;
    setActive(true);
    go("idle");
    setTimeout(() => listenFn.current(), 300);
  };

  const stopSession = () => {
    activeRef.current = false;
    setActive(false);
    try { recRef.current?.abort(); } catch {}
    recRef.current = null;
    if (audRef.current) { audRef.current.pause(); audRef.current = null; }
    if (silRef.current) clearTimeout(silRef.current);
    if (sttRestartTimer.current) { clearTimeout(sttRestartTimer.current); sttRestartTimer.current = null; }
    sttErrorCount.current = 0;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    stopAmp();
    go("idle");
    setLiveText("");
  };

  const interrupt = () => {
    if (audRef.current) { audRef.current.pause(); audRef.current = null; }
    go("idle");
    setTimeout(() => { if (activeRef.current) listenFn.current(); }, 300);
  };

  const handleOrbClick = () => {
    if (!active) { startSession(); return; }
    if (state === "speaking") { interrupt(); return; }
    stopSession();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (isProcessing.current) return;
    const txt = inputText.trim();
    setInputText("");
    if (audRef.current) { audRef.current.pause(); audRef.current = null; }
    chatFn.current(txt);
  };

  const voice = VOICES[voiceIdx];
  const npc   = npcs.find(n => n.id === npcId);
  const stateLabel: Record<State, string> = {
    idle:      active ? "Tap orb to stop voice stream" : "Tap orb or type below to speak",
    listening: "Listening to your voice…",
    thinking:  "Synthesizing neural response…",
    speaking:  "NPC speaking — tap orb to interrupt",
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400" />
        <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Loading Voice Agent...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ─── Page Header ────────────────────────────────────────── */}
      <PageHeader
        badge="Real-time Audio"
        title="Voice Agent Studio"
        description="Low-latency voice dialogue synthesis, neural acoustic wave modeling, and live speech interaction."
        actions={
          <div className="flex items-center gap-2">
            {history.length > 0 && !active && (
              <button
                onClick={() => { setHistory([]); histRef.current = []; }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F141A] hover:bg-[#151C26] border border-white/[0.08] text-xs font-semibold text-slate-300 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Chat</span>
              </button>
            )}
            <button
              onClick={() => setPanel(p => !p)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                showPanel
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                  : "bg-[#0F141A] hover:bg-[#151C26] text-slate-300 border-white/[0.08]"
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voice Settings</span>
            </button>
          </div>
        }
      />

      {/* ─── Settings Drawer ───────────────────────────────────── */}
      {showPanel && (
        <div className="rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 font-bold">
                <Bot className="w-3.5 h-3.5 text-cyan-400" /> Character Persona
              </label>
              {npcs.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">No NPCs configured — create one first in NPC Profiles.</p>
              ) : (
                <div className="relative">
                  <select
                    value={npcId}
                    onChange={e => setNpcId(e.target.value)}
                    className="w-full bg-[#07090C] border border-white/[0.08] px-4 py-2.5 rounded-xl text-xs font-sans text-slate-200 focus:outline-none focus:border-cyan-400 transition appearance-none pr-8"
                  >
                    {npcs.map(n => <option key={n.id} value={n.id}>{n.name} ({n.tone})</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              )}
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 font-bold">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Acoustic Voice Profile
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VOICES.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setVoiceIdx(i)}
                    className={`text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${
                      voiceIdx === i
                        ? "border-cyan-500/40 bg-cyan-500/10 text-white font-bold"
                        : "border-white/[0.06] bg-[#07090C] text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: v.color }} />
                    <span className="truncate">{v.name} ({v.label})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          {npc && (
            <div className="border-t border-white/[0.06] pt-3">
              <p className="text-[10px] font-mono uppercase text-slate-500 mb-1 font-bold">Character Context</p>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{npc.backstory}</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Error Notification ─────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-rose-300 flex-1 leading-relaxed">{error}</span>
          <button onClick={() => setError(null)} className="flex-shrink-0">
            <X className="w-4 h-4 text-rose-400 hover:text-white transition" />
          </button>
        </div>
      )}

      {/* ─── Main Interactive Studio Area ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Orb & Mic Controls) */}
        <div className="lg:col-span-6 rounded-2xl bg-[#0F141A] border border-white/[0.08] p-8 flex flex-col items-center justify-between text-center shadow-sm">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
              {npc?.name || "AI Agent"}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: voice.color }} />
              <span>{voice.name} Voice</span>
            </div>
          </div>

          <div className="py-6 flex flex-col items-center justify-center relative">
            <VoiceOrb state={state} amp={amp} color={voice.color} onClick={handleOrbClick} />
            <p className="font-mono text-xs uppercase tracking-wider text-slate-300 mt-4">
              {stateLabel[state]}
            </p>
            {liveText && (
              <div className="mt-3 text-xs text-cyan-300 font-mono bg-[#07090C] px-4 py-2 rounded-xl border border-cyan-500/20 max-w-sm">
                &ldquo;{liveText}&rdquo;
              </div>
            )}
          </div>

          {/* Text Input Fallback Bar */}
          <form onSubmit={handleTextSubmit} className="w-full flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`Type message to ${npc?.name || "NPC"}...`}
              className="flex-1 bg-[#07090C] border border-white/[0.08] px-4 py-2.5 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              type="submit"
              disabled={state === "thinking" || state === "speaking"}
              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition"
            >
              <Send className="w-3.5 h-3.5" /> Speak
            </button>
          </form>
        </div>

        {/* Right Column (Dialogue Transcript Stream) */}
        <div className="lg:col-span-6 rounded-2xl bg-[#0F141A] border border-white/[0.08] p-6 flex flex-col justify-between shadow-sm min-h-[420px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Dialogue Stream</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {history.length} turns recorded
              </span>
            </div>

            {history.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-[340px] pr-2">
                {history.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-cyan-500/10 border border-cyan-500/20 text-slate-100 rounded-br-none"
                        : "bg-[#07090C] border border-white/[0.06] text-slate-200 rounded-bl-none"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center gap-2 text-slate-500">
                <Mic className="w-8 h-8 opacity-20" />
                <p className="text-xs font-semibold text-slate-400">Transcript is empty</p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Click the neural voice orb or type a phrase to begin a real-time conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

