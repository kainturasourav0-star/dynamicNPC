"use client";

import { useState, useCallback } from "react";
import { ScrollReveal } from "./shared/ScrollReveal";

const REQUEST_CODE = `POST /api/generate-dialogue HTTP/1.1
Authorization: Bearer npc_sk_••••••
Content-Type: application/json

{
  "npcId": "garrick_bartender",
  "context": "What happened here?",
  "playerState": {
    "location": "tavern",
    "questStage": 2,
    "inventory": ["iron_sword", "health_potion"]
  }
}`;

const STEPS = [
  { label: "Sending request...", delay: 400 },
  { label: "HTTP 402 — Payment Required", delay: 800 },
  { label: "Signing EIP-191 challenge...", delay: 600 },
  { label: "Signature verified", delay: 500 },
  { label: "Settling 0.01 USDC on Base Sepolia...", delay: 700 },
  { label: "Settlement confirmed", delay: 400 },
  { label: "Generating AI dialogue...", delay: 1000 },
  { label: "Response ready", delay: 0 },
];

const RESPONSE = `{
  "status": "success",
  "dialogue": [
    {
      "text": "You really want to know? Then put the sword away first. The walls in this tavern have ears.",
      "emotion": "suspicious",
      "action": "leans_forward"
    }
  ],
  "receipt": {
    "transactionHash": "0x7f3a...92a1",
    "amount": "0.01",
    "token": "USDC"
  }
}`;

export function APIPlayground() {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showResponse, setShowResponse] = useState(false);

  const runRequest = useCallback(() => {
    if (running) return;
    setRunning(true);
    setCurrentStep(0);
    setShowResponse(false);

    let step = 0;
    function next() {
      if (step >= STEPS.length - 1) {
        setShowResponse(true);
        setTimeout(() => setRunning(false), 2000);
        return;
      }
      setTimeout(() => {
        step++;
        setCurrentStep(step);
        next();
      }, STEPS[step].delay);
    }
    next();
  }, [running]);

  return (
    <section id="api" className="landing-section">
      <ScrollReveal>
        <div className="section-eyebrow">Developer Experience</div>
      </ScrollReveal>
      <ScrollReveal delay={1}>
        <h2 className="section-title">
          From API call<br /><em>to character.</em>
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={2}>
        <p className="section-desc">
          One endpoint. Full x402 payment flow. Contextual AI dialogue returned
          with a settlement receipt.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={3}>
        <div className="playground-container">
          <div className="playground-header">
            <div className="playground-dots">
              <div className="playground-dot" />
              <div className="playground-dot" />
              <div className="playground-dot" />
            </div>
            <div className="playground-title">npc-402://api-playground</div>
            <div />
          </div>

          <div className="playground-body">
            {/* Left — Request */}
            <div className="playground-request">
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                <code>
                  {REQUEST_CODE.split("\n").map((line, i) => (
                    <div key={i}>
                      <span style={{ display: "inline-block", width: 24, color: "rgba(255,255,255,0.08)", textAlign: "right", marginRight: 12, userSelect: "none" }}>{i + 1}</span>
                      {line.includes("POST") ? <><span className="fn">{line.split(" ")[0]}</span> <span className="str">{line.split(" ")[1]}</span> {line.split(" ").slice(2).join(" ")}</> :
                       line.includes(":") && !line.includes("{") && !line.includes("}") ? <><span className="str">{line.split(":")[0]}</span>:{line.split(":").slice(1).join(":")}</> :
                       line}
                    </div>
                  ))}
                </code>
              </pre>

              <button
                className="playground-run-btn"
                onClick={runRequest}
                disabled={running}
                data-cursor="RUN"
                style={{ marginTop: 20, opacity: running ? 0.5 : 1 }}
              >
                {running ? "Processing..." : "▶ Run Request"}
              </button>
            </div>

            {/* Right — Response */}
            <div className="playground-response">
              {/* Status steps */}
              {running && (
                <div style={{ marginBottom: 20 }}>
                  {STEPS.map((s, i) => (
                    <div
                      key={i}
                      className={`playground-status-line ${i <= currentStep ? "visible" : ""}`}
                      style={{ transitionDelay: `${i * 0.05}s` }}
                    >
                      {i < currentStep ? (
                        <span className="check">✓</span>
                      ) : i === currentStep ? (
                        <span className="spin">◌</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>·</span>
                      )}
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Response JSON */}
              {showResponse && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.8, color: "var(--text-muted)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)", marginBottom: 12 }}>
                    ✓ 200 OK · 0.24s
                  </div>
                  <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                    <code>{RESPONSE}</code>
                  </pre>
                </div>
              )}

              {!running && !showResponse && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                  Click &quot;Run Request&quot; to see the response
                </div>
              )}

              <div style={{ marginTop: "auto", paddingTop: 16, fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)" }}>
                Simulated response — demo mode
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
