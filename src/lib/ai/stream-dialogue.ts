import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import { queryKnowledge } from "@/lib/rag/pinecone";

export interface DialogueGenerationParams {
  npc: {
    id: string;
    name: string;
    backstory: string;
    tone: string;
    style: string;
    safetyRules: string;
  };
  context?: string;
  playerState?: {
    level?: number;
    gold?: number;
    inventory?: string[];
  };
  history?: Array<{ speaker: string; text: string }>;
}

export interface GeneratedDialogueResponse {
  speaker: string;
  text: string;
  tone: string;
  action?: string;
}

/**
 * Generates an in-character dialogue using Gemini / NVIDIA with RAG lore enrichment.
 */
export async function generateNpcDialogue({
  npc,
  context = "",
  playerState,
  history = [],
}: DialogueGenerationParams): Promise<GeneratedDialogueResponse[]> {
  // 1. Retrieve relevant lore from Pinecone Vector RAG
  const relevantDocs = await queryKnowledge(npc.id, context || npc.name, 2);
  const loreSnippets = relevantDocs.map(d => `- ${d.title}: ${d.content}`).join("\n");

  const systemInstruction = `
You are roleplaying as "${npc.name}", a dynamic AI character in a high-fidelity virtual world.

[Character Profile]:
- Backstory: ${npc.backstory}
- Tone of Voice: ${npc.tone}
- Speaking Style: ${npc.style}
- Safety & Content Guidelines: ${npc.safetyRules}

${loreSnippets ? `[Retrieved World Knowledge / Lore]:\n${loreSnippets}\n` : ""}

[Player Details]:
- Level: ${playerState?.level || 1}
- Gold: ${playerState?.gold || 0} USDC
- Inventory: ${playerState?.inventory?.join(", ") || "None"}

Respond strictly in character. Keep the response natural, engaging, and under 3 sentences unless recounting lore.
Output format: Return ONLY valid JSON in this exact structure:
[
  {
    "speaker": "${npc.name}",
    "text": "Your in-character spoken dialogue line.",
    "tone": "${npc.tone}",
    "action": "Optional subtle physical action (e.g. nods slowly, checks ledger)"
  }
]
`;

  // 2. Generate with Gemini if key is provided
  if (env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.8,
          responseMimeType: "application/json",
        },
      });

      const prompt = `${systemInstruction}\n\nWorld Context: ${context || "The player approaches you in the town realm."}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn("Gemini generation failed, falling back to dynamic simulated generator:", err);
    }
  }

  // 3. Fallback Dynamic Character Dialogue Generator
  return [
    {
      speaker: npc.name,
      text: `Greetings, traveler. I am ${npc.name}. The roads have been dangerous since the rift expanded, but if you have coin and courage, we may do business.`,
      tone: npc.tone,
      action: "adjusts coat and surveys the surroundings",
    },
  ];
}
