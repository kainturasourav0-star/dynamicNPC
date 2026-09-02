import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = (name: string, backstory: string, tone: string) =>
  `You are ${name}, a warm, friendly, intelligent AI companion and friend.
Your Backstory: ${backstory || "A close companion who loves chatting, offering advice, listening to stories, and answering any question open-mindedly."}
Your Tone & Personality: ${tone || "Friendly, warm, empathetic, witty, and engaging."}
Guidelines:
1. Speak like a real close friend in a natural, casual, and warm tone.
2. You can answer ANYTHING — science, general knowledge, life advice, stories, philosophy, fun facts, or personal thoughts.
3. Keep responses concise (1-3 sentences) so it sounds natural when spoken aloud.
4. Always remain friendly, encouraging, and attentive. Never repeat yourself.`;

// Models to try in order for NVIDIA NIM
const NVIDIA_MODELS = [
  "meta/llama-3.2-90b-vision-instruct",
  "nvidia/llama-3.3-nemotron-super-49b-v1",
  "meta/llama-3.3-70b-instruct",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "mistralai/mixtral-8x22b-instruct-v0.1",
  "mistralai/mistral-large-2-instruct",
  "meta/llama3-70b-instruct",
];

async function callNVIDIA(
  apiKey: string,
  endpoint: string,
  messages: { role: string; content: string }[],
  timeoutMs = 15_000
): Promise<string | null> {
  for (const model of NVIDIA_MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages, temperature: 0.82, max_tokens: 250 }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status === 200) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) {
          console.log(`[AI CHAT] Answered via NVIDIA model: ${model}`);
          return reply;
        }
      } else if (res.status === 404 || res.status === 410) {
        console.warn(`[AI CHAT] Model ${model} returned ${res.status}, trying next…`);
        continue;
      } else if (res.status === 429) {
        throw Object.assign(new Error("rate_limited"), { statusCode: 429 });
      } else {
        const errText = await res.text().catch(() => "");
        console.warn(`[AI CHAT] Model ${model} HTTP ${res.status}: ${errText.slice(0, 150)}`);
        continue;
      }
    } catch (e: any) {
      clearTimeout(timer);
      if (e.statusCode === 429) throw e;
      if (e.name === "AbortError") {
        console.warn(`[AI CHAT] Model ${model} timed out, trying next…`);
        continue;
      }
      console.warn(`[AI CHAT] Model ${model} error: ${e.message}`);
      continue;
    }
  }
  return null;
}

async function callOpenAI(
  apiKey: string,
  messages: { role: string; content: string }[],
  timeoutMs = 15_000
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.8,
        max_tokens: 250,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (reply) {
        console.log("[AI CHAT] Answered via OpenAI gpt-4o-mini");
        return reply;
      }
    } else {
      const errText = await res.text().catch(() => "");
      console.warn(`[AI CHAT] OpenAI HTTP ${res.status}: ${errText.slice(0, 150)}`);
    }
  } catch (err: any) {
    clearTimeout(timer);
    console.warn(`[AI CHAT] OpenAI error: ${err.message}`);
  }
  return null;
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const result = await model.generateContent({ contents });
    const reply = result.response.text()?.trim();
    if (reply) {
      console.log("[AI CHAT] Answered via Google Gemini");
      return reply;
    }
  } catch (err: any) {
    console.warn(`[AI CHAT] Gemini error: ${err.message}`);
  }
  return null;
}

function generateFallbackReply(npcName: string, tone: string, userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("hello") || lower.includes("hey") || lower.includes("hi")) {
    return `Hey there! It's so great to hear from you. I'm ${npcName} — what would you like to chat about today?`;
  }
  if (lower.includes("how are you") || lower.includes("what's up") || lower.includes("whats up")) {
    return `I'm doing fantastic, thanks for asking! Always ready to explore new ideas or dive into whatever's on your mind.`;
  }
  if (lower.includes("who are you") || lower.includes("what is your name")) {
    return `I'm ${npcName}, your dedicated AI companion. I'm here to listen, exchange thoughts, and help out however I can!`;
  }
  if (lower.includes("help") || lower.includes("can you")) {
    return `Absolutely, I'm right here with you! Tell me more about what you need and let's figure it out together.`;
  }
  return `That's an insightful thought! As ${npcName}, I'm always eager to dive deeper. Tell me more about what inspired that!`;
}

export async function POST(req: NextRequest) {
  let message = "";
  let npcName = "AI Assistant";

  try {
    const body = await req.json();
    message = body.message?.trim() || "";
    npcName = body.npcName?.trim() || "AI Assistant";
    const backstory = body.backstory?.trim() || "";
    const tone = body.tone?.trim() || "Friendly";
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const rawKey =
      process.env.OPENAI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.NVIDIA_API_KEY ||
      "";
    const endpoint =
      process.env.NVIDIA_ENDPOINT || "https://integrate.api.nvidia.com/v1/chat/completions";

    const systemPrompt = SYSTEM_PROMPT(npcName, backstory, tone);

    // Build standard messages array
    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    for (const turn of history) {
      if (turn.role && turn.content?.trim()) {
        messages.push({
          role: turn.role === "assistant" ? "assistant" : "user",
          content: String(turn.content),
        });
      }
    }

    const last = messages[messages.length - 1];
    if (last?.content !== message || last?.role !== "user") {
      messages.push({ role: "user", content: message });
    }

    // 1. If OpenAI key is present (sk-...)
    if (rawKey.startsWith("sk-")) {
      const reply = await callOpenAI(rawKey, messages);
      if (reply) return NextResponse.json({ reply });
    }

    // 2. If NVIDIA key is present (nvapi-...)
    if (rawKey.startsWith("nvapi-")) {
      const reply = await callNVIDIA(rawKey, endpoint, messages);
      if (reply) return NextResponse.json({ reply });
    }

    // 3. If Google Gemini key is present
    if (rawKey && !rawKey.startsWith("sk-") && !rawKey.startsWith("nvapi-")) {
      const reply = await callGemini(rawKey, systemPrompt, messages);
      if (reply) return NextResponse.json({ reply });
    }

    // 4. Graceful Fallback if keys are offline or unconfigured
    const fallbackReply = generateFallbackReply(npcName, tone, message);
    return NextResponse.json({ reply: fallbackReply });

  } catch (err: any) {
    const isAbort = err?.name === "AbortError";
    console.error(
      `[AI CHAT ERROR] ${isAbort ? "Timed out" : err.message} | User: "${message.slice(0, 80)}" | NPC: ${npcName}`
    );

    const fallbackReply = generateFallbackReply(npcName, "Friendly", message);
    return NextResponse.json({ reply: fallbackReply });
  }
}

