"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollReveal } from "./shared/ScrollReveal";

const AI_STEPS = [
  { icon: "📖", label: "Understanding Context" },
  { icon: "🧠", label: "Retrieving Memory" },
  { icon: "🌍", label: "Checking World State" },
  { icon: "⚡", label: "Generating Response" },
  { icon: "✓", label: "Response Ready" },
];

export function AIThinking() {
  const [activeStep, setActiveStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Auto-play when visible
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && activeStep === -1 && !isPlaying) {
          startAnimation();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [activeStep, isPlaying]);

  function startAnimation() {
    setIsPlaying(true);
    setActiveStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < AI_STEPS.length) {
        setActiveStep(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsPlaying(false);
        }, 3000);
      }
    }, 800);
  }

  return (
    <section className="landing-section" ref={sectionRef}>
      <ScrollReveal>
        <div className="section-eyebrow">AI Engine</div>
      </ScrollReveal>
      <ScrollReveal delay={1}>
        <h2 className="section-title">
          Intelligence,<br /><em>not scripts.</em>
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={2}>
        <p className="section-desc">
          Every NPC response is generated through a multi-step reasoning pipeline
          — personality, memory, world state, and player history.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={3}>
        <div className="ai-thinking-flow">
          {/* Player Input */}
          <div className="ai-step completed" style={{ minWidth: 320 }}>
            <div className="ai-step-icon">👤</div>
            <div>
              <div className="ai-step-label">Player Input</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                &ldquo;What happened here?&rdquo;
              </div>
            </div>
          </div>

          <div className="ai-flow-connector" />

          {/* Processing Steps */}
          {AI_STEPS.map((step, i) => (
            <div key={i}>
              <div className={`ai-step ${i < activeStep ? "completed" : i === activeStep ? "active" : ""}`} style={{ minWidth: 320 }}>
                <div className="ai-step-icon">{step.icon}</div>
                <div className="ai-step-label">{step.label}</div>
              </div>
              {i < AI_STEPS.length - 1 && <div className="ai-flow-connector" />}
            </div>
          ))}

          <div className="ai-flow-connector" />

          {/* NPC Response */}
          <div className={`ai-step ${activeStep >= AI_STEPS.length - 1 ? "completed" : ""}`} style={{ minWidth: 320 }}>
            <div className="ai-step-icon">🧙</div>
            <div>
              <div className="ai-step-label">NPC Response</div>
              {activeStep >= AI_STEPS.length - 1 && (
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  &ldquo;You really want to know? Then put the sword away first.&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={4}>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button
            className="btn-secondary"
            onClick={startAnimation}
            disabled={isPlaying}
            style={{ opacity: isPlaying ? 0.5 : 1 }}
          >
            ↻ Replay
          </button>
        </div>
      </ScrollReveal>
    </section>
  );
}
