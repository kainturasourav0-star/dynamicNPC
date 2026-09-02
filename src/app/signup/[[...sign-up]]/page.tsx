"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bot, Zap, ShieldCheck, Coins, Layers } from "lucide-react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090C] text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-screen z-10">
        {/* ─── Left Section (~55% / 7 cols): Cinematic Brand Experience ─── */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 xl:p-16 border-r border-white/[0.08] relative bg-[#0B0F14]/60 backdrop-blur-xl">
          {/* Top Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-150">
                <div className="w-full h-full bg-[#07090C] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">NPC-402</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-semibold">
                  PRO
                </span>
              </div>
            </Link>
          </div>

          {/* Central Hero Pitch */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                AI Dialogue Infrastructure
              </span>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Create next-gen NPCs. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Ready in seconds.
                </span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empower your game studio with dynamic AI NPCs that hold persistent state and monetize autonomously through on-chain x402 micropayments.
              </p>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#0F141A] border border-white/[0.06] space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-2">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">Instant Deployment</h4>
                <p className="text-[11px] text-slate-400">Generate API keys and connect Unreal/Unity clients immediately.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F141A] border border-white/[0.06] space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">x402 Micropayments</h4>
                <p className="text-[11px] text-slate-400">Zero subscription lock-in. Pay only for exact dialogue inferences.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F141A] border border-white/[0.06] space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">Lore & Knowledge</h4>
                <p className="text-[11px] text-slate-400">Inject custom backstories, personality tones, and safety filters.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F141A] border border-white/[0.06] space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">SDK Support</h4>
                <p className="text-[11px] text-slate-400">REST, Python, Node.js, Unity, and Web SDKs available.</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-xs text-slate-500 font-mono">
            NPC-402 Protocol © 2026 • Powering Next-Gen Game Worlds
          </div>
        </div>

        {/* ─── Right Section (~45% / 5 cols): Authentication ───────────── */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-md space-y-6">
            {/* Mobile Header */}
            <div className="text-center lg:text-left space-y-2">
              <div className="inline-flex items-center gap-2 lg:hidden mb-2">
                <Bot className="w-6 h-6 text-cyan-400" />
                <span className="font-bold text-base text-white">NPC-402 Console</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Create account
              </h2>
              <p className="text-slate-400 text-xs">
                Register to deploy custom NPC characters and manage payment vaults.
              </p>
            </div>

            {/* Quick Access Card */}
            <div className="bg-[#0F141A] border border-white/[0.08] p-6 rounded-2xl shadow-xl space-y-4">
              <Link
                href="/dashboard"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all duration-150 hover:scale-[1.01]"
              >
                <Bot className="w-4 h-4" />
                Enter Developer Console Directly
              </Link>
              
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-white/[0.08] w-full" />
                <span className="bg-[#0F141A] px-3 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                  Or Register with Clerk
                </span>
              </div>

              {mounted ? (
                <SignUp
                  path="/signup"
                  signInUrl="/login"
                  fallbackRedirectUrl="/dashboard"
                  appearance={{
                    variables: {
                      colorPrimary: "#06b6d4",
                      colorBackground: "transparent",
                      borderRadius: "0.75rem",
                    },
                    elements: {
                      cardBox: "shadow-none border-none bg-transparent w-full",
                      card: "bg-transparent shadow-none border-none p-0 w-full",
                      headerTitle: "!text-white font-bold text-base text-center",
                      headerSubtitle: "!text-slate-400 text-xs text-center mt-0.5",
                      socialButtonsBlockButton: "border border-white/10 !bg-white/5 hover:!bg-white/10 transition !text-white text-xs font-medium rounded-xl py-2.5",
                      socialButtonsBlockButtonText: "!text-white font-medium",
                      formButtonPrimary: "!bg-cyan-400 hover:!bg-cyan-300 !text-black font-bold text-xs py-2.5 rounded-xl transition duration-150 shadow-md shadow-cyan-400/20",
                      footerActionLink: "!text-cyan-400 hover:!text-cyan-300 hover:underline font-semibold text-xs",
                      formFieldInput: "!bg-[#07090C] !border !border-white/10 !text-white placeholder:!text-slate-500 focus:!border-cyan-400 focus:outline-none rounded-xl text-xs py-2.5 px-3.5",
                      formFieldLabel: "!text-slate-300 text-xs font-medium",
                      dividerLine: "bg-white/10",
                      dividerText: "!text-slate-500 text-xs",
                      footer: "bg-transparent border-t border-white/10 pt-3 text-center text-xs !text-slate-400",
                    }
                  }}
                />
              ) : (
                <div className="w-full h-36 flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-400"></div>
                  <span className="text-xs font-mono text-cyan-400/80">Loading secure console...</span>
                </div>
              )}
            </div>

            <div className="text-center">
              <Link href="/" className="text-xs text-slate-500 hover:text-cyan-400 transition font-mono">
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
