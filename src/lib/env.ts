import { z } from "zod";

/**
 * Server and Client Environment Variable Schema
 * Validates critical infrastructure configuration with automatic fallbacks for local demo mode.
 */
const envSchema = z.object({
  // Web Application URL
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Database Connection (Supabase / Postgres)
  DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default("placeholder_anon_key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/login"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/signup"),

  // AI & Inference Providers
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  NVIDIA_ENDPOINT: z.string().url().optional().default("https://integrate.api.nvidia.com/v1/chat/completions"),
  NVIDIA_MODEL: z.string().optional().default("nvidia/llama-3.1-nemotron-70b-instruct"),
  CARTESIA_API_KEY: z.string().optional(),

  // Vector Database / RAG
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX_NAME: z.string().optional().default("npc402-knowledge"),

  // Transactional Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional().default("notifications@npc402.dev"),

  // Analytics & Error Tracking
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional().default("https://us.i.posthog.com"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Cloudflare Turnstile Bot Protection
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional().default("1x00000000000000000000AA"),
  TURNSTILE_SECRET_KEY: z.string().optional().default("1x0000000000000000000000000000000AA"),

  // x402 Micropayments Protocol
  MERCHANT_ADDRESS: z.string().default("0x9876543210FEDCBA9876543210FEDCBA98765432"),
  CHAIN_ID: z.coerce.number().default(84532), // Base Sepolia
});

// Parse and validate process.env
const _parsedEnv = envSchema.safeParse(process.env);

if (!_parsedEnv.success) {
  console.warn("⚠️ [Environment Warning] Some optional env variables are unconfigured. Falling back to local mock modes:", _parsedEnv.error.format());
}

export const env = _parsedEnv.success ? _parsedEnv.data : envSchema.parse({});
