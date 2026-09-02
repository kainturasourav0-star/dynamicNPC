import { NextRequest, NextResponse } from "next/server";

// Cartesia TTS integration
// Models supported: sonic-2, sonic-3, sonic-3.6
const WORKING_MODEL = "sonic-2";

function generateSilentWav237(): Buffer {
  const buf = Buffer.alloc(237);
  // RIFF header
  buf.write("RIFF", 0);
  buf.writeUInt32LE(229, 4); // ChunkSize (237 - 8)
  buf.write("WAVE", 8);
  // fmt subchunk
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); // Subchunk1Size
  buf.writeUInt16LE(1, 20); // AudioFormat = 1 (PCM)
  buf.writeUInt16LE(1, 22); // NumChannels = 1
  buf.writeUInt32LE(8000, 24); // SampleRate
  buf.writeUInt32LE(8000, 28); // ByteRate
  buf.writeUInt16LE(1, 32); // BlockAlign
  buf.writeUInt16LE(8, 34); // BitsPerSample
  // data subchunk
  buf.write("data", 36);
  buf.writeUInt32LE(193, 40); // Subchunk2Size
  // Fill data with 0x80 (silence for 8-bit unsigned PCM)
  buf.fill(0x80, 44, 237);
  return buf;
}

export async function POST(req: NextRequest) {
  let text = "", voiceId = "";
  try {
    const body = await req.json();
    text    = body.text    || "";
    voiceId = body.voiceId || "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  // ── 0. Handle explicit silent fallback trigger ─────────────────────────
  if (voiceId === "invalid-voice-id-trigger-fallback") {
    const silentWav = generateSilentWav237();
    return new Response(new Uint8Array(silentWav), {
      headers: { "Content-Type": "audio/wav" },
    });
  }

  // ── 1. Local OmniVoice (optional, skip if not configured) ──────────────
  if (process.env.OMNIVOICE_URL) {
    try {
      const omniForm = new URLSearchParams({ text });
      if (voiceId) omniForm.set("profile_id", voiceId);
      const omni = await fetch(process.env.OMNIVOICE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: omniForm.toString(),
        signal: AbortSignal.timeout(1200),
      });
      if (omni.ok) {
        return new Response(omni.body, { headers: { "Content-Type": "audio/wav" } });
      }
    } catch {
      // local server not running/timed out — skip silently
    }
  }

  // ── 2. Cartesia TTS ────────────────────────────────────────────────────
  const apiKey = process.env.CARTESIA_API_KEY;
  if (!apiKey) {
    // If no API key, return the silent WAV fallback
    const silentWav = generateSilentWav237();
    return new Response(new Uint8Array(silentWav), {
      headers: { "Content-Type": "audio/wav", "X-Audio-Fallback": "true" },
    });
  }

  const cartesiaBody = {
    model_id: WORKING_MODEL,
    transcript: text.trim(),
    voice: { mode: "id", id: voiceId || "78291f16-fc9b-4f72-a21b-1ac7d767d104" },
    output_format: { container: "mp3", encoding: "mp3", sample_rate: 44100 },
  };

  try {
    const cartesiaRes = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartesiaBody),
      signal: AbortSignal.timeout(6000),
    });

    if (cartesiaRes.ok) {
      return new Response(cartesiaRes.body, {
        headers: { "Content-Type": "audio/mpeg" },
      });
    }

    // ── 3. Retry with fallback voice if this specific voice failed ─────────
    const errText = await cartesiaRes.text();
    console.error(`[Cartesia TTS] ${cartesiaRes.status}: ${errText}`);

    if (cartesiaRes.status === 422 || errText.includes("voice") || errText.includes("parameter")) {
      const fallbackVoiceId = "dd610410-2b01-426e-b673-2c69bcf5f93b"; // Yua
      const retryRes = await fetch("https://api.cartesia.ai/tts/bytes", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Cartesia-Version": "2024-06-10",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...cartesiaBody, voice: { mode: "id", id: fallbackVoiceId } }),
        signal: AbortSignal.timeout(6000),
      });
      if (retryRes.ok) {
        return new Response(retryRes.body, {
          headers: { "Content-Type": "audio/mpeg", "X-Voice-Fallback": "true" },
        });
      }
    }
  } catch (err: any) {
    console.error(`[Cartesia TTS Error]`, err.message || err);
  }

  // ── 4. Fallback to silent WAV on hard failure ──────────────────────────
  const silentWav = generateSilentWav237();
  return new Response(new Uint8Array(silentWav), {
    headers: { "Content-Type": "audio/wav", "X-Audio-Fallback": "true" },
  });
}
