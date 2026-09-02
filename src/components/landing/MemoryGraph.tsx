"use client";

import { useState } from "react";
import { ScrollReveal } from "./shared/ScrollReveal";

const MEMORY_EVENTS = [
  { text: "Helped Garrick fix the tavern door", type: "positive" },
  { text: "Stole a silver ring from the counter", type: "negative" },
  { text: "Met in the East District market", type: "neutral" },
  { text: "Threatened the guard captain", type: "negative" },
  { text: "Returned after 3 days with supplies", type: "positive" },
  { text: "Asked about the sealed mines", type: "neutral" },
  { text: "Bought a round for the regulars", type: "positive" },
];

export function MemoryGraph() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section id="memory" className="landing-section">
      <ScrollReveal>
        <div className="section-eyebrow">Persistent Memory</div>
      </ScrollReveal>
      <ScrollReveal delay={1}>
        <h2 className="section-title">NPCs Remember.</h2>
      </ScrollReveal>
      <ScrollReveal delay={2}>
        <p className="section-desc">
          Every interaction is stored. NPCs build relationships, track trust, and
          recall past events across sessions and players.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={3}>
        <div className="memory-grid">
          {/* Left: Memory Tree */}
          <div className="memory-tree">
            <div className="memory-tree-root">Player_0x7a3f</div>
            {MEMORY_EVENTS.map((event, i) => (
              <div
                key={i}
                className="memory-tree-node"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  color: hoveredIdx === i ? (event.type === "positive" ? "var(--green)" : event.type === "negative" ? "var(--red)" : "var(--white)") : undefined,
                  borderColor: hoveredIdx === i ? "var(--cyan)" : undefined,
                }}
              >
                {event.text}
              </div>
            ))}
            <div style={{ marginTop: 20, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--green)" }}>■</span> Positive{" "}
              <span style={{ color: "var(--red)", marginLeft: 12 }}>■</span> Negative{" "}
              <span style={{ color: "var(--text-muted)", marginLeft: 12 }}>■</span> Neutral
            </div>
          </div>

          {/* Right: Meters */}
          <div className="memory-meters">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--text-muted)", marginBottom: 24 }}>
              Garrick&apos;s Assessment
            </div>

            <div className="memory-meter">
              <div className="memory-meter-label">
                <span>Trust</span>
                <span>82%</span>
              </div>
              <div className="memory-meter-track">
                <div className="memory-meter-fill" style={{ width: "82%" }} />
              </div>
            </div>

            <div className="memory-meter">
              <div className="memory-meter-label">
                <span>Suspicion</span>
                <span>61%</span>
              </div>
              <div className="memory-meter-track">
                <div className="memory-meter-fill gold" style={{ width: "61%" }} />
              </div>
            </div>

            <div className="memory-meter">
              <div className="memory-meter-label">
                <span>Familiarity</span>
                <span>94%</span>
              </div>
              <div className="memory-meter-track">
                <div className="memory-meter-fill" style={{ width: "94%" }} />
              </div>
            </div>

            <div className="memory-relationship">
              <div className="memory-relationship-label">Relationship</div>
              <div className="memory-relationship-value">ALLY</div>
            </div>

            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 8 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--text-muted)", marginBottom: 4 }}>Memory Events</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--white)" }}>1,284</div>
              </div>
              <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 8 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--text-muted)", marginBottom: 4 }}>Last Interaction</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--white)" }}>2m ago</div>
              </div>
            </div>

            <div style={{ marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "var(--gold)" }}>
              Demo data — illustrative values
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
