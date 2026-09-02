"use client";

import dynamic from "next/dynamic";
import { CustomCursor } from "@/components/landing/CustomCursor";

// Dynamically import Cinematic3DScroll to ensure client-only rendering
const Cinematic3DScroll = dynamic(
  () => import("@/components/landing/Cinematic3DScroll").then((mod) => mod.Cinematic3DScroll),
  {
    ssr: false,
    loading: () => (
      <div id="loader">
        <div className="l1">NPC-402</div>
        <div className="bar">
          <i />
        </div>
        <div className="l2">CALIBRATING NEURAL SUBSTRATE</div>
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <main className="landing-page" style={{ minHeight: "100vh", background: "var(--bg, #04060a)" }}>
      <CustomCursor />
      <Cinematic3DScroll />
    </main>
  );
}

