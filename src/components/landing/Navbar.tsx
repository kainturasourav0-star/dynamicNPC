"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WalletConnectButton } from "@/components/WalletConnectButton";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { href: "#protocol", label: "Protocol" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#memory", label: "Memory" },
    { href: "#features", label: "Features" },
    { href: "#api", label: "API" },
  ];

  return (
    <>
      <nav className={`site-nav ${scrolled ? "scrolled" : ""}`}>
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">⬡</div>
          NPC-402
        </Link>

        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WalletConnectButton />
          <Link href="/login" className="nav-cta">
            Launch Console
          </Link>
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="16" x2="20" y2="16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`nav-mobile-menu ${mobileOpen ? "open" : ""}`}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
            {l.label}
          </a>
        ))}
        <div className="pt-2 pb-2">
          <WalletConnectButton />
        </div>
        <Link href="/login" className="btn-primary" onClick={() => setMobileOpen(false)}>
          Launch Console
        </Link>
      </div>
    </>
  );
}

