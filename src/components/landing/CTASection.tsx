"use client";

import Link from "next/link";
import { ScrollReveal } from "./shared/ScrollReveal";

export function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-glow" />
      <ScrollReveal>
        <div className="section-eyebrow" style={{ justifyContent: "center" }}>
          <span style={{ display: "none" }} />Ready to Deploy
        </div>
      </ScrollReveal>
      <ScrollReveal delay={1}>
        <h2 className="cta-title">
          Give your NPCs<br />a <span style={{ color: "var(--cyan)" }}>memory.</span>
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={2}>
        <p className="cta-sub">
          Build characters that remember, adapt and respond — without static
          dialogue trees.
        </p>
      </ScrollReveal>
      <ScrollReveal delay={3}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/login" className="btn-primary">
            Launch Console
          </Link>
          <Link href="/dashboard/sandbox" className="btn-secondary">
            Explore API ↗
          </Link>
        </div>
      </ScrollReveal>
      <ScrollReveal delay={4}>
        <div className="cta-fine">
          <span><span className="dot">●</span> No credit card required</span>
          <span><span className="dot">●</span> Free tier available</span>
          <span><span className="dot">●</span> Deploy in minutes</span>
        </div>
      </ScrollReveal>
    </section>
  );
}
