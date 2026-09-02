"use client";

import { ScrollReveal } from "./shared/ScrollReveal";

export function FeaturesBento() {
  return (
    <section id="features" className="landing-section">
      <ScrollReveal>
        <div className="section-eyebrow">Capabilities</div>
      </ScrollReveal>
      <ScrollReveal delay={1}>
        <h2 className="section-title">
          Everything you need<br /><em>to ship intelligent NPCs.</em>
        </h2>
      </ScrollReveal>

      <ScrollReveal delay={2}>
        <div className="bento-grid">
          {/* AI Dialogue — large */}
          <div className="bento-card span-2">
            <div className="bento-card-label">AI Dialogue</div>
            <div className="bento-card-title">Contextual Conversation Engine</div>
            <div className="bento-card-desc">
              Every response considers NPC personality, player history, world state,
              and conversational context. No static dialogue trees.
            </div>
            <div className="bento-visual">
              <div><span className="kw">const</span> response = <span className="kw">await</span> <span className="fn">generateDialogue</span>({"{"}</div>
              <div>{"  "}npcId: <span className="str">&quot;garrick_bartender&quot;</span>,</div>
              <div>{"  "}message: <span className="str">&quot;What happened here?&quot;</span>,</div>
              <div>{"  "}context: {"{"} location: <span className="str">&quot;tavern&quot;</span>, time: <span className="str">&quot;night&quot;</span> {"}"}</div>
              <div>{"});"}</div>
            </div>
          </div>

          {/* Latency stat */}
          <div className="bento-card">
            <div className="bento-card-label">Performance</div>
            <div className="bento-stat-value">~0.2s</div>
            <div className="bento-stat-note">Average response time (target)</div>
          </div>

          {/* Memory */}
          <div className="bento-card">
            <div className="bento-card-label">Memory</div>
            <div className="bento-card-title">Persistent Context</div>
            <div className="bento-card-desc">
              Every conversation stored in PostgreSQL with vector recall across
              sessions and players.
            </div>
          </div>

          {/* x402 Payments — large */}
          <div className="bento-card span-2">
            <div className="bento-card-label">Payments</div>
            <div className="bento-card-title">x402 Micropayment Settlements</div>
            <div className="bento-card-desc">
              Pay per conversation with cryptographic micropayments. No subscriptions,
              no upfront costs.
            </div>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}>
                <span style={{ color: "var(--text-secondary)" }}>Garrick → Player_0x7a..</span>
                <span className="bento-tag bento-tag-green">SETTLED</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}>
                <span style={{ color: "var(--text-secondary)" }}>Lyra → Player_0x3f..</span>
                <span className="bento-tag bento-tag-green">SETTLED</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}>
                <span style={{ color: "var(--text-secondary)" }}>Thorne → Player_0xb2..</span>
                <span className="bento-tag bento-tag-gold">PENDING</span>
              </div>
            </div>
          </div>

          {/* Cost */}
          <div className="bento-card">
            <div className="bento-card-label">Cost</div>
            <div className="bento-stat-value">$0.01</div>
            <div className="bento-stat-note">Per conversation (target)</div>
          </div>

          {/* Developer API */}
          <div className="bento-card">
            <div className="bento-card-label">Developer API</div>
            <div className="bento-card-title">REST + SDK</div>
            <div className="bento-card-desc">
              Single endpoint. Full x402 support. SDKs for Unity, Node.js, and cURL.
            </div>
          </div>

          {/* NPC Personalities */}
          <div className="bento-card">
            <div className="bento-card-label">Personalities</div>
            <div className="bento-card-title">Custom NPC Profiles</div>
            <div className="bento-card-desc">
              Define backstory, tone, style, safety rules, and behavioral boundaries
              for every NPC.
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
