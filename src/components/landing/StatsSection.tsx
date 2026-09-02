"use client";

import { useState, useEffect, useRef } from "react";

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);

  return { count, ref };
}

export function StatsSection() {
  const s1 = useCountUp(10000, 2000);
  const s2 = useCountUp(200, 1800);

  return (
    <div className="stats-section">
      <div className="stats-grid">
        <div className="stat-item scroll-reveal" ref={s1.ref}>
          <span className="stat-number">
            {s1.count.toLocaleString()}<span className="accent">+</span>
          </span>
          <span className="stat-label">NPCs Created</span>
          <span className="stat-tag">Target</span>
        </div>
        <div className="stat-item scroll-reveal delay-1" ref={s2.ref}>
          <span className="stat-number">
            <span className="accent">0.</span>{s2.count}
            <span className="accent">s</span>
          </span>
          <span className="stat-label">Avg Response</span>
          <span className="stat-tag">Target</span>
        </div>
        <div className="stat-item scroll-reveal delay-2">
          <span className="stat-number">
            99.9<span className="accent">%</span>
          </span>
          <span className="stat-label">Uptime</span>
          <span className="stat-tag">Target</span>
        </div>
        <div className="stat-item scroll-reveal delay-3">
          <span className="stat-number">
            $0.<span className="accent">01</span>
          </span>
          <span className="stat-label">Per Conversation</span>
          <span className="stat-tag">Target</span>
        </div>
      </div>
    </div>
  );
}
