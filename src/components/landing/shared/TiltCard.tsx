"use client";

import { useCallback, useRef } from "react";

export function TiltCard({
  children,
  className = "",
  intensity = 6,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -intensity;
      const rotateY = ((x - cx) / cx) * intensity;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      el.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
      el.style.setProperty("--my", `${(y / rect.height) * 100}%`);
    },
    [intensity]
  );

  const handleLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = "perspective(800px) rotateX(0) rotateY(0)";
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="tilt-shine" />
      {children}
    </div>
  );
}
