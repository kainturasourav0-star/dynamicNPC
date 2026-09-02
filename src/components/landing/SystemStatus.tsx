"use client";

import { ScrollReveal } from "./shared/ScrollReveal";

export function SystemStatus() {
  return (
    <ScrollReveal>
      <div className="status-panel">
        <div className="status-header">NPC-402 System Status</div>

        <div className="status-row"><div className="status-dot" /> API Gateway</div>
        <div className="status-row"><div className="status-dot" /> AI Engine</div>
        <div className="status-row"><div className="status-dot" /> Payment Relayer</div>
        <div className="status-row"><div className="status-dot" /> Memory Service</div>

        <div className="status-divider" />

        <div className="status-metric">
          <span>Latency</span>
          <span className="value">~0.2s</span>
        </div>
        <div className="status-metric">
          <span>Cost</span>
          <span className="value">0.01 USDC</span>
        </div>
        <div className="status-metric">
          <span>Network</span>
          <span className="value">Base Sepolia</span>
        </div>

        <div className="status-demo-tag">Demo environment</div>
      </div>
    </ScrollReveal>
  );
}
