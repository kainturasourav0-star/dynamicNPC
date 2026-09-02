"use client";

import React, { useEffect, useRef } from "react";
import { env } from "@/lib/env";

export function TurnstileWidget({
  onVerify,
  onError,
  siteKey,
}: {
  onVerify: (token: string) => void;
  onError?: () => void;
  siteKey?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const key = siteKey || env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    // Inject Turnstile script if not already present
    if (!document.getElementById("cloudflare-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cloudflare-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const interval = setInterval(() => {
      const turnstile = (window as any).turnstile;
      if (turnstile && containerRef.current && containerRef.current.children.length === 0) {
        try {
          turnstile.render(containerRef.current, {
            sitekey: key,
            callback: (token: string) => onVerify(token),
            "error-callback": () => onError?.(),
            theme: "dark",
          });
          clearInterval(interval);
        } catch {
          // Retry next tick
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [key, onVerify, onError]);

  return <div ref={containerRef} className="my-2 flex justify-center" />;
}
