import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { WalletProvider } from "@/context/WalletContext";
import { Web3QueryProvider } from "@/context/Web3Provider";
import { PostHogProvider } from "@/lib/analytics/posthog";

export const viewport: Viewport = {
  themeColor: "#00E5FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "NPC-402 — AI Dialogue Infrastructure for Games",
  description: "Build NPCs that actually think. Real-time AI dialogue infrastructure powered by contextual memory, vector RAG, and autonomous x402 micropayments.",
  keywords: ["NPC", "AI dialogue", "game development", "x402", "micropayments", "AI infrastructure", "Unreal Engine", "Unity", "Supabase", "Pinecone"],
  manifest: "/manifest.json",
  openGraph: {
    title: "NPC-402 — AI Dialogue Infrastructure for Games",
    description: "Build NPCs that actually think. Real-time AI dialogue infrastructure powered by contextual memory and autonomous x402 micropayments.",
    type: "website",
    siteName: "NPC-402 Console",
  },
  twitter: {
    card: "summary_large_image",
    title: "NPC-402 — AI Dialogue Infrastructure for Games",
    description: "Real-time AI dialogue infrastructure powered by contextual memory and autonomous x402 micropayments.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NPC-402",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description": "AI Dialogue Infrastructure and autonomous x402 micropayments for game development.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#07090C] text-slate-100 min-h-screen">
        <PostHogProvider>
          <Web3QueryProvider>
            <AuthProvider>
              <WalletProvider>
                {children}
              </WalletProvider>
            </AuthProvider>
          </Web3QueryProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
