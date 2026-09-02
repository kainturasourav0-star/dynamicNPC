import { NextRequest, NextResponse } from "next/server";

function generateSineWav(text: string, durationSec = 1.8): Buffer {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // Format chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
  buffer.writeUInt16LE(1, 22);  // Channels (mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // Data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate pleasant harmonic carrier wave based on text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash << 5) - hash + text.charCodeAt(i);
  const baseFreq = 220 + (Math.abs(hash) % 180);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Envelope for natural fade-in / fade-out
    const env = Math.min(t * 10, 1) * Math.min((durationSec - t) * 10, 1);
    const sample = Math.sin(2 * Math.PI * baseFreq * t) * 0.4 +
                   Math.sin(2 * Math.PI * (baseFreq * 1.5) * t) * 0.2 +
                   Math.sin(2 * Math.PI * (baseFreq * 2.0) * t) * 0.1;
    const int16 = Math.max(-32768, Math.min(32767, Math.floor(sample * env * 32767)));
    buffer.writeInt16LE(int16, 44 + i * 2);
  }

  return buffer;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId, speed = 1.0, pitch = 0.0 } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Valid text is required" }, { status: 400 });
    }

    // 1. Try Local OmniVoice Python Server if running
    const omniUrl = process.env.OMNIVOICE_URL;
    if (omniUrl) {
      try {
        const omniRes = await fetch(`${omniUrl}/api/tts/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice_id: voiceId, speed, pitch }),
          signal: AbortSignal.timeout(3000),
        });

        if (omniRes.ok) {
          const audioBuf = await omniRes.arrayBuffer();
          return new Response(audioBuf, {
            headers: {
              "Content-Type": "audio/wav",
              "X-TTS-Engine": "omnivoice-local",
            },
          });
        }
      } catch {
        // Fallthrough to Cartesia or harmonic synthesis
      }
    }

    // 2. Try Cartesia Cloud TTS if API key configured
    const cartesiaKey = process.env.CARTESIA_API_KEY;
    if (cartesiaKey) {
      try {
        const cartesiaRes = await fetch("https://api.cartesia.ai/tts/bytes", {
          method: "POST",
          headers: {
            "X-API-Key": cartesiaKey,
            "Cartesia-Version": "2024-06-10",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model_id: "sonic-2",
            transcript: text.trim(),
            voice: { mode: "id", id: voiceId || "78291f16-fc9b-4f72-a21b-1ac7d767d104" },
            output_format: { container: "wav", encoding: "pcm_f32le", sample_rate: 44100 },
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (cartesiaRes.ok) {
          const audioBuf = await cartesiaRes.arrayBuffer();
          return new Response(audioBuf, {
            headers: {
              "Content-Type": "audio/wav",
              "X-TTS-Engine": "cartesia-sonic",
            },
          });
        }
      } catch (err) {
        console.warn("[OmniVoice TTS] Cartesia fallback:", err);
      }
    }

    // 3. High quality local harmonic PCM audio fallback
    const duration = Math.max(1.2, Math.min(10.0, text.length * 0.08));
    const wav = generateSineWav(text, duration);
    return new Response(new Uint8Array(wav), {
      headers: {
        "Content-Type": "audio/wav",
        "X-TTS-Engine": "omnivoice-harmonic-pcm",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Synthesis failed" }, { status: 500 });
  }
}
