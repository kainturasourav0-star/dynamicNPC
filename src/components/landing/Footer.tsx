"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-brand-logo">
            NPC<span>-402</span>
          </div>
          <div className="footer-brand-tagline">
            AI dialogue infrastructure for the next generation of games.
          </div>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/dashboard/sandbox">Sandbox</Link></li>
            <li><Link href="/dashboard/npcs">NPC Profiles</Link></li>
            <li><Link href="/dashboard/logs">Analytics</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Developers</h4>
          <ul>
            <li><Link href="/dashboard/keys">API Keys</Link></li>
            <li><Link href="/dashboard/docs">Documentation</Link></li>
            <li><a href="#api">SDK</a></li>
            <li><a href="#api">Examples</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Protocol</h4>
          <ul>
            <li><a href="#how-it-works">x402</a></li>
            <li><a href="#how-it-works">Payments</a></li>
            <li><a href="#protocol">Architecture</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Community</h4>
          <ul>
            <li><a href="https://github.com/kainturasourav0-star/dynamicNPC" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="#">Devpost</a></li>
            <li><a href="#">Discord</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} NPC-402 Protocol</span>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <div className="footer-status">
            <span className="dot">●</span> Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
