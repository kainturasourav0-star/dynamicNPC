"use client";

import { useState, useEffect, useCallback } from "react";

export function Loader({ onDone }: { onDone: () => void }) {
  const [hidden, setHidden] = useState(false);

  const stableOnDone = useCallback(onDone, [onDone]);

  useEffect(() => {
    const t = setTimeout(() => {
      setHidden(true);
      setTimeout(stableOnDone, 800);
    }, 2800);
    return () => clearTimeout(t);
  }, [stableOnDone]);

  return (
    <div className={`loader-overlay ${hidden ? "hidden" : ""}`}>
      <div className="loader-logo">
        NPC<span>-402</span>
      </div>
      <div className="loader-bar-track">
        <div className="loader-bar" />
      </div>
      <div className="loader-status">Initializing protocol...</div>
    </div>
  );
}
