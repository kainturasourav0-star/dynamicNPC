import { env } from "@/lib/env";

/**
 * Production Error Monitoring & Exception Logging Utility (Sentry Wrapper)
 */
export function captureException(error: unknown, context?: Record<string, any>) {
  console.error("🚨 [Captured Exception]:", error, context || "");
  
  if (typeof window !== "undefined" && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, { extra: context });
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  console.log(`ℹ️ [Monitoring Message - ${level.toUpperCase()}]: ${message}`);
  
  if (typeof window !== "undefined" && (window as any).Sentry) {
    (window as any).Sentry.captureMessage(message, level);
  }
}
