import { env } from "@/lib/env";

/**
 * Server-side verification for Cloudflare Turnstile CAPTCHA / Bot tokens
 */
export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  // Pass automatically for dummy testing tokens or in local development without secret key
  if (
    token === "dummy-turnstile-token" || 
    !env.TURNSTILE_SECRET_KEY || 
    env.TURNSTILE_SECRET_KEY.startsWith("1x0000000000000000000000000000000AA")
  ) {
    return true;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", env.TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return false;
  }
}
