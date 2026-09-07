import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in · NPC-402 — Dialogue Infrastructure',
  description: 'Sign in to your NPC-402 workspace to manage personas and API keys.',
};

/**
 * Login-specific layout.
 * - Intentionally minimal: no ClerkProvider interception, no extra wrappers.
 * - The login page controls its own <body> styles via dangerouslySetInnerHTML <style>.
 * - We override the root layout's body bg + text classes that would conflict.
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#020610',
        overflow: 'auto',
        // Reset root layout's tailwind body classes that conflict
        fontFamily: 'inherit',
      }}
    >
      {children}
    </div>
  );
}
