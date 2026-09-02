"use client";

import React, { useEffect } from "react";
import posthog from "posthog-js";
import { env } from "@/lib/env";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: true,
      });
    }
  }, []);

  return <>{children}</>;
}

export const analytics = {
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== "undefined" && (posthog as any).__loaded) {
      posthog.capture(eventName, properties);
    } else {
      // Local development logger
      console.log(`📊 [Analytics Event] ${eventName}:`, properties || {});
    }
  },
  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== "undefined" && (posthog as any).__loaded) {
      posthog.identify(userId, traits);
    }
  }
};
