import { NextRequest, NextResponse } from "next/server";

export interface VoiceProfile {
  id: string;
  name: string;
  category: "neural" | "cloned" | "custom";
  language: string;
  gender: "male" | "female" | "neutral";
  previewUrl?: string;
  traits: string[];
  color: string;
}

const DEFAULT_VOICES: VoiceProfile[] = [
  {
    id: "78291f16-fc9b-4f72-a21b-1ac7d767d104",
    name: "Nolan (Bartender)",
    category: "neural",
    language: "en-US",
    gender: "male",
    traits: ["Warm", "Tavern Slang", "Resonant"],
    color: "#34d399",
  },
  {
    id: "dd610410-2b01-426e-b673-2c69bcf5f93b",
    name: "Yua (Archmage)",
    category: "neural",
    language: "en-US",
    gender: "female",
    traits: ["Mystical", "Wise", "Ethereal"],
    color: "#a78bfa",
  },
  {
    id: "882079ce-8513-4a0e-8c0c-c7b8995b12f4",
    name: "Aoi (Cyber-Rogue)",
    category: "neural",
    language: "en-US",
    gender: "female",
    traits: ["Cyberpunk", "Fast-Paced", "Tactical"],
    color: "#f472b6",
  },
  {
    id: "d1708217-3c6f-46c5-a46f-d47abdcd59e5",
    name: "Kenta (Blacksmith)",
    category: "neural",
    language: "en-US",
    gender: "male",
    traits: ["Gruff", "Deep", "Authoritative"],
    color: "#fb923c",
  },
  {
    id: "omni-elena-v1",
    name: "Elena (OmniStudio Clone)",
    category: "cloned",
    language: "en-US",
    gender: "female",
    traits: ["Clear", "Narrative", "Studio Grade"],
    color: "#38bdf8",
  },
  {
    id: "omni-marcus-v1",
    name: "Marcus (Cinematic Trailer)",
    category: "cloned",
    language: "en-US",
    gender: "male",
    traits: ["Cinematic", "Epic", "Bass-Boosted"],
    color: "#e879f9",
  }
];

// In-memory cloned voices storage for runtime session
let customClonedVoices: VoiceProfile[] = [];

export async function GET(req: NextRequest) {
  try {
    // If local OmniVoice backend is running, fetch profiles from it
    const omniUrl = process.env.OMNIVOICE_URL;
    if (omniUrl) {
      try {
        const res = await fetch(`${omniUrl}/api/profiles`, {
          signal: AbortSignal.timeout(1000),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.profiles)) {
            const externalProfiles: VoiceProfile[] = data.profiles.map((p: any) => ({
              id: p.id || p.profile_id,
              name: p.name || "Local Clone",
              category: "cloned",
              language: p.language || "en-US",
              gender: p.gender || "neutral",
              traits: p.traits || ["Local GPU"],
              color: "#22d3ee",
            }));
            return NextResponse.json({
              status: "success",
              voices: [...DEFAULT_VOICES, ...externalProfiles, ...customClonedVoices],
            });
          }
        }
      } catch {
        // Skip local server timeout
      }
    }

    return NextResponse.json({
      status: "success",
      voices: [...DEFAULT_VOICES, ...customClonedVoices],
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, gender, language, traits, color } = body;

    if (!name) {
      return NextResponse.json({ status: "error", message: "Voice name is required" }, { status: 400 });
    }

    const newVoice: VoiceProfile = {
      id: `clone-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      category: "cloned",
      language: language || "en-US",
      gender: gender || "neutral",
      traits: traits || ["Zero-Shot Clone"],
      color: color || "#22d3ee",
    };

    customClonedVoices.unshift(newVoice);

    return NextResponse.json({
      status: "success",
      voice: newVoice,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
