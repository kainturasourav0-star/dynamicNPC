"use client";

import React, { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090C] text-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Critical Application Error</h1>
        <p className="text-slate-400 text-xs font-mono mb-6 max-w-md">
          {error.message || "An unhandled exception occurred at the root layout."}
        </p>
        <button
          onClick={() => reset()}
          className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
        >
          Reload Application
        </button>
      </body>
    </html>
  );
}
