"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const NPC_DIALOGUES = [
  { player: "What happened here?", npc: "You really want to know? Then put the sword away first." },
  { player: "Can I trust you?", npc: "Trust is earned in this tavern, not given. Buy a drink, we'll talk." },
  { player: "I'm looking for the mines.", npc: "The mines? Sealed since the Dragon Wars. Few dare venture there now." },
  { player: "Tell me about the guard captain.", npc: "That name... I haven't heard it spoken in years. You'd best be careful." },
];

const NPC_RESPONSES = [
  "Interesting question. The answer depends on how much you're willing to pay.",
  "Ha! You've got courage, I'll give you that. Most travelers ask for directions, not secrets.",
  "Old Margret at the library might know more. Tell her Garrick sent you.",
  "The night is dark and full of terrors, friend. Perhaps rest before your journey.",
  "That name carries weight around here. You'd best be careful who you mention it to.",
];

export function HeroSection({ loaded }: { loaded: boolean }) {
  const [wordsVisible, setWordsVisible] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ from: "player" | "npc"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaded) return;
    const t1 = setTimeout(() => setWordsVisible(true), 300);
    const t2 = setTimeout(() => setUiVisible(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loaded]);

  // Cycle dialogues
  useEffect(() => {
    if (!loaded || chatOpen) return;
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setDialogueIdx((prev) => (prev + 1) % NPC_DIALOGUES.length);
        setIsTyping(false);
      }, 1200);
    }, 5000);
    return () => clearInterval(interval);
  }, [loaded, chatOpen]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { from: "player", text: msg }]);
    setTimeout(() => {
      const response = NPC_RESPONSES[Math.floor(Math.random() * NPC_RESPONSES.length)];
      setChatMessages((prev) => [...prev, { from: "npc", text: response }]);
    }, 600 + Math.random() * 800);
  }, [chatInput]);

  const currentDialogue = NPC_DIALOGUES[dialogueIdx];

  return (
    <section className="hero" id="hero">
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 70% 50% at 50% 40%, black 20%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 40%, black 20%, transparent 100%)", pointerEvents: "none" }} />

      <div className="hero-content">
        <div className="hero-eyebrow" style={{ opacity: uiVisible ? 1 : 0, transform: uiVisible ? "none" : "translateY(12px)", transition: "opacity 0.6s, transform 0.6s" }}>
          <div className="hero-eyebrow-dot" />
          x402 Protocol · Live on Base Sepolia
        </div>

        <h1 className="hero-headline">
          <span className="line">
            <span className={`word ${wordsVisible ? "visible" : ""}`} style={{ transitionDelay: "0.1s" }}>Build </span>
            <span className={`word ${wordsVisible ? "visible" : ""}`} style={{ transitionDelay: "0.2s" }}>NPCs</span>
          </span>
          <span className="line">
            <span className={`word ${wordsVisible ? "visible" : ""}`} style={{ transitionDelay: "0.35s" }}>That </span>
            <span className={`word word-accent ${wordsVisible ? "visible" : ""}`} style={{ transitionDelay: "0.5s" }}>Actually</span>
          </span>
          <span className="line">
            <span className={`word word-accent ${wordsVisible ? "visible" : ""}`} style={{ transitionDelay: "0.65s" }}>Think.</span>
          </span>
        </h1>

        <p className="hero-sub" style={{ opacity: uiVisible ? 1 : 0, transform: uiVisible ? "none" : "translateY(16px)", transition: "opacity 0.6s 0.1s, transform 0.6s 0.1s" }}>
          Real-time AI dialogue infrastructure for games, powered by
          contextual memory and autonomous <strong>x402 micropayments</strong>.
        </p>

        <div className="hero-actions" style={{ opacity: uiVisible ? 1 : 0, transform: uiVisible ? "none" : "translateY(16px)", transition: "opacity 0.6s 0.2s, transform 0.6s 0.2s" }}>
          <Link href="/login" className="btn-primary">
            Get Started Free
          </Link>
          <Link href="/dashboard/sandbox" className="btn-secondary">
            Explore API ↗
          </Link>
        </div>
      </div>

      {/* NPC Interactive Panel */}
      <div className="hero-npc-panel" style={{ opacity: uiVisible ? 1 : 0, transform: uiVisible ? "translateY(-50%)" : "translateY(calc(-50% + 20px))", transition: "opacity 0.8s 0.4s, transform 0.8s 0.4s" }}>
        <div className="npc-panel-header">
          <div className="npc-online-badge">NPC Online</div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", color: "var(--text-muted)" }}>LIVE</span>
        </div>

        <div className="npc-avatar-row">
          <div className="npc-avatar">🧙</div>
          <div className="npc-info">
            <h3>Garrick Ironbrew</h3>
            <p>The Suspicious Bartender</p>
          </div>
        </div>

        <div className="npc-traits">
          <span className="npc-trait">Suspicious</span>
          <span className="npc-trait">Loyal</span>
          <span className="npc-trait">Sarcastic</span>
        </div>

        {/* Dialogue */}
        {!chatOpen && (
          <>
            <div className="npc-dialogue-box">
              <span className="npc-dialogue-label player-label">Player</span>
              <div className="npc-dialogue-text" style={{ marginBottom: 12 }}>
                &ldquo;{currentDialogue.player}&rdquo;
              </div>
              <span className="npc-dialogue-label npc-label">Garrick</span>
              {isTyping ? (
                <div className="typing-indicator">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              ) : (
                <div className="npc-dialogue-text">
                  &ldquo;{currentDialogue.npc}&rdquo;
                </div>
              )}
            </div>

            <div className="npc-payment-badge">
              <span>x402 · 0.01 USDC</span>
              <span className="verified">✓ Payment Verified</span>
            </div>

            <button className="npc-talk-btn" onClick={() => setChatOpen(true)} data-cursor="TALK">
              Talk to Garrick →
            </button>
          </>
        )}

        {/* Mini Chat */}
        {chatOpen && (
          <div className="npc-mini-chat">
            <div className="mini-chat-messages" ref={chatRef}>
              <div className="mini-chat-msg from-npc">
                Welcome, traveler! What brings you to the Rusty Flagon?
              </div>
              {chatMessages.map((m, i) => (
                <div key={i} className={`mini-chat-msg from-${m.from}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="mini-chat-input-row">
              <input
                className="mini-chat-input"
                placeholder="Say something..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
              />
              <button className="mini-chat-send" onClick={sendChat}>
                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
              </button>
            </div>
          </div>
        )}

        <div className="npc-stats-row">
          <div className="npc-stat">
            <div className="npc-stat-val">87</div>
            <div className="npc-stat-label">Memory</div>
          </div>
          <div className="npc-stat">
            <div className="npc-stat-val">0.2s</div>
            <div className="npc-stat-label">Latency</div>
          </div>
          <div className="npc-stat">
            <div className="npc-stat-val">82%</div>
            <div className="npc-stat-label">Trust</div>
          </div>
        </div>
      </div>
    </section>
  );
}
