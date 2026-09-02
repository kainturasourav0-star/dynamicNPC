"use client";

export function MarqueeStrip() {
  const items = [
    "AI Dialogue Infrastructure",
    "x402 Micropayments",
    "0.01 USDC Per Conversation",
    "Contextual Memory",
    "Real-time Generation",
    "Base Sepolia",
    "Google Gemini",
    "Developer API",
  ];
  return (
    <div className="marquee-section" aria-hidden="true">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="marquee-item">
            {item} <span className="dot">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
