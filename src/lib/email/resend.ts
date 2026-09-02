import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

/**
 * Sends a transactional email using Resend with local logging fallback.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: `NPC-402 <${env.EMAIL_FROM}>`,
        to,
        subject,
        html,
      });
      return { success: true, id: response.data?.id };
    } catch (err: any) {
      console.error("Resend delivery failed:", err);
      return { success: false, error: err.message };
    }
  }

  // Local development mock
  console.log(`✉️ [Mock Email Sent via Resend] To: ${Array.isArray(to) ? to.join(", ") : to} | Subject: "${subject}"`);
  return { success: true, id: `mock_email_${Date.now()}` };
}

/**
 * Pre-built templates
 */
export async function sendWelcomeEmail(userEmail: string, userName?: string) {
  return sendEmail({
    to: userEmail,
    subject: "Welcome to NPC-402 — AI Dialogue Infrastructure",
    html: `
      <div style="background-color: #07090C; color: #f1f5f9; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h1 style="color: #00E5FF; margin-bottom: 16px;">Welcome to NPC-402, ${userName || "Developer"}!</h1>
        <p style="color: #94a3b8; line-height: 1.6;">Your developer account is ready. You can now build, test, and deploy AI-driven NPCs with on-chain x402 micropayments.</p>
        <div style="margin-top: 24px;">
          <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #00E5FF; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Open Developer Console</a>
        </div>
      </div>
    `,
  });
}
