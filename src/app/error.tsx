"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { captureException } from "@/lib/monitoring/sentry";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#07090C] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 text-rose-400">
        <AlertCircle className="w-8 h-8" />
      </div>
      <span className="font-mono text-xs uppercase tracking-widest text-rose-400 font-semibold mb-2">
        System Anomaly Detected
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
        Something went wrong
      </h1>
      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed font-mono text-xs">
        {error.message || "An unexpected runtime error occurred. Our telemetry logs have captured this incident."}
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition"
      >
        <RotateCcw className="w-4 h-4" />
        Retry Operation
      </button>
    </div>
  );
}
