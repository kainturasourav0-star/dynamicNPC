"use client";

import { ScrollReveal } from "./shared/ScrollReveal";

const NPCS = [
  {
    emoji: "🧙",
    name: "Garrick Ironbrew",
    role: "The Suspicious Bartender",
    mood: "Suspicious",
    trust: "82%",
    memory: "1,284",
    lastSeen: "2m ago",
    dialogue: "You really want to know? Then put the sword away first.",
  },
  {
    emoji: "🧝",
    name: "Lyra Voss",
    role: "The Merchant Who Knows Too Much",
    mood: "Calculating",
    trust: "45%",
    memory: "892",
    lastSeen: "14m ago",
    dialogue: "Everything has a price, dear. The question is whether you can afford the truth.",
  },
  {
    emoji: "🧙‍♂️",
    name: "Vaelathor",
    role: "The Exiled Archmage",
    mood: "Contemplative",
    trust: "67%",
    memory: "2,341",
    lastSeen: "1h ago",
    dialogue: "The wards are failing. I can feel it in the ley lines. We don't have much time.",
  },
];

export function NPCUniverse() {
  return (
    <section className="landing-section">
      <ScrollReveal>
        <div className="section-eyebrow">NPC Universe</div>
      </ScrollReveal>
      <ScrollReveal delay={1}>
        <h2 className="section-title">
          Characters that<br /><em>live and breathe.</em>
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={2}>
        <p className="section-desc">
          Every NPC has a unique personality, memory, and evolving relationship with
          each player.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={3}>
        <div className="npc-universe-grid">
          {NPCS.map((npc) => (
            <div key={npc.name} className="npc-universe-card">
              <div className="npc-universe-portrait">
                <div style={{
                  width: "100%", height: "100%",
                  background: "linear-gradient(135deg, var(--surface), var(--off-black))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 72,
                }}>
                  {npc.emoji}
                </div>
              </div>

              <div className="npc-universe-name">{npc.name}</div>
              <div className="npc-universe-role">{npc.role}</div>

              {/* Dialogue */}
              <div style={{
                padding: "12px 14px", marginBottom: 16,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)", borderRadius: 8,
                fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6,
                fontStyle: "italic",
              }}>
                &ldquo;{npc.dialogue}&rdquo;
              </div>

              <div className="npc-universe-meta">
                <div className="npc-meta-item">
                  <div className="npc-meta-label">Mood</div>
                  <div className="npc-meta-value">{npc.mood}</div>
                </div>
                <div className="npc-meta-item">
                  <div className="npc-meta-label">Trust</div>
                  <div className="npc-meta-value">{npc.trust}</div>
                </div>
                <div className="npc-meta-item">
                  <div className="npc-meta-label">Memory</div>
                  <div className="npc-meta-value">{npc.memory}</div>
                </div>
                <div className="npc-meta-item">
                  <div className="npc-meta-label">Last Seen</div>
                  <div className="npc-meta-value">{npc.lastSeen}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
