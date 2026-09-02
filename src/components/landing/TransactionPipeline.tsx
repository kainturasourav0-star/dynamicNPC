"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ScrollReveal } from "./shared/ScrollReveal";

const PIPELINE_NODES = [
  { id: "player", icon: "👤", label: "Player", detail: { title: "Player Input", desc: 'Player sends a message to the NPC: "What happened here?"' } },
  { id: "client", icon: "🎮", label: "Game Client", detail: { title: "Game Client", desc: "Game engine packages the message with NPC ID and context, sends POST to /api/generate-dialogue." } },
  { id: "402", icon: "⚡", label: "HTTP 402", detail: { title: "Payment Required", desc: "Server returns HTTP 402 with a payment challenge: amount 0.01 USDC on Base Sepolia." } },
  { id: "sign", icon: "✍️", label: "Signature", detail: { title: "EIP-191 Signature", desc: "Game client signs the challenge cryptographically. No token transfer — pure authorization." } },
  { id: "chain", icon: "🔗", label: "Blockchain", detail: { title: "On-Chain Settlement", desc: "Signature verified. USDC settled on Base Sepolia. Transaction receipt generated." } },
  { id: "ai", icon: "🧠", label: "AI Engine", detail: { title: "AI Generation", desc: "Google Gemini processes NPC personality, memory, world state, and player history." } },
  { id: "npc", icon: "💬", label: "NPC Response", detail: { title: "Dialogue Delivered", desc: "Contextual NPC dialogue returned to game client with settlement receipt." } },
];

const SIMULATION_STATES = [
  { label: "Signing payment...", status: "pending" },
  { label: "Verifying signature...", status: "pending" },
  { label: "Settling on-chain...", status: "pending" },
  { label: "Generating dialogue...", status: "pending" },
  { label: "Response ready", status: "complete" },
];

export function TransactionPipeline() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(-1);
  const [flowingConnectors, setFlowingConnectors] = useState<Set<number>>(new Set());

  const runSimulation = useCallback(() => {
    if (simulating) return;
    setSimulating(true);
    setSimStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < SIMULATION_STATES.length) {
        setSimStep(step);
        // Animate connector flow
        setFlowingConnectors((prev) => new Set([...prev, step]));
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setSimulating(false);
          setSimStep(-1);
          setFlowingConnectors(new Set());
        }, 3000);
      }
    }, 1000);
  }, [simulating]);

  const selectedDetail = activeNode
    ? PIPELINE_NODES.find((n) => n.id === activeNode)?.detail
    : null;

  return (
    <section id="how-it-works" className="landing-section">
      <ScrollReveal>
        <div className="section-eyebrow">How It Works</div>
      </ScrollReveal>
      <ScrollReveal delay={1}>
        <h2 className="section-title">
          Three steps.<br /><em>0.2 seconds.</em>
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={2}>
        <p className="section-desc">
          Every NPC conversation follows the x402 protocol — cryptographic micropayment, AI generation, contextual response.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={3}>
        <div className="pipeline-container">
          {PIPELINE_NODES.map((node, i) => (
            <React.Fragment key={node.id}>
              <div
                className={`pipeline-node ${activeNode === node.id ? "active" : ""} ${simulating && i <= simStep + 2 ? "active" : ""}`}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                role="button"
                tabIndex={0}
                aria-label={node.label}
              >
                <div className="pipeline-node-icon">{node.icon}</div>
                <div className="pipeline-node-label">{node.label}</div>
              </div>
              {i < PIPELINE_NODES.length - 1 && (
                <div className={`pipeline-connector ${flowingConnectors.has(i) ? "flowing" : ""}`}>
                  <div className="flow-dot" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </ScrollReveal>

      {/* Detail panel */}
      {selectedDetail && !simulating && (
        <ScrollReveal>
          <div className="pipeline-detail" style={{ margin: "40px auto 0" }}>
            <div className="detail-label">{activeNode?.toUpperCase()}</div>
            <div className="detail-value" style={{ marginBottom: 8 }}>{selectedDetail.title}</div>
            <div style={{ fontSize: 12, lineHeight: 1.7 }}>{selectedDetail.desc}</div>
          </div>
        </ScrollReveal>
      )}

      {/* Simulation panel */}
      {simulating && (
        <div className="pipeline-detail" style={{ margin: "40px auto 0" }}>
          <div className="detail-label">Demo Transaction</div>
          <div style={{ marginTop: 12 }}>
            {SIMULATION_STATES.map((s, i) => (
              <div key={i} style={{ padding: "6px 0", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: i <= simStep ? (i === simStep && i < SIMULATION_STATES.length - 1 ? "var(--cyan)" : "var(--green)") : "var(--text-muted)", transition: "color 0.3s" }}>
                <span>{i < simStep ? "✓" : i === simStep ? "◌" : "·"}</span>
                {s.label}
              </div>
            ))}
          </div>
          <div className="pipeline-demo-tag">
            <span>⚠</span> Simulated transaction — no real funds transferred
          </div>
        </div>
      )}

      {/* Run simulation button */}
      <ScrollReveal delay={4}>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button
            className="btn-primary"
            onClick={runSimulation}
            disabled={simulating}
            data-cursor="RUN"
            style={{ opacity: simulating ? 0.5 : 1 }}
          >
            {simulating ? "Processing..." : "▶ Run Demo Transaction"}
          </button>
        </div>
      </ScrollReveal>
    </section>
  );
}
