"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const FALLBACK_CLERK_KEY = "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || FALLBACK_CLERK_KEY;

  return (
    <ClerkProvider
      appearance={{ baseTheme: dark } as any}
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/signup"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  );
}
