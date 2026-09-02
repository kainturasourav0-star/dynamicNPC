"use client";

import React from "react";
import Link from "next/link";
import { Bot } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090C] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400">
        <Bot className="w-8 h-8" />
      </div>
      <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-2">
        Error 404 • Resource Missing
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        The requested console route or resource does not exist or has been relocated to another enclave.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition"
      >
        ← Return to Developer Console
      </Link>
    </div>
  );
}
