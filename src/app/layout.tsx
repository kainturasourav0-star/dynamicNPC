import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dynamic NPC Dialogue - x402-Powered AI Dialogue for Games",
  description: "Metered pay-per-call AI dialogue generation for NPCs, settled autonomously on-chain using the x402 micro-payment standard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
