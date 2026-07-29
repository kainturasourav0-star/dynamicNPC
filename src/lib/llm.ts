import { GoogleGenerativeAI } from "@google/generative-ai";
// Using global fetch (Node 18+)

export interface DialogueOption {
  text: string;
  emotion: string;
  metadata?: Record<string, any>;
}

export interface GenerateDialogueParams {
  npcName: string;
  backstory: string;
  tone: string;
  style?: string;
  safetyRules?: string;
  context: string;
  playerState?: any;
  history?: Array<{ role: "user" | "model"; text: string }>;
}

export async function generateDialogue(params: GenerateDialogueParams): Promise<DialogueOption[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  // Variable to hold NVIDIA result if successful
  let nvidiaResult: DialogueOption[] | null = null;

  const systemPrompt = `You are an AI-powered game NPC named ${params.npcName}.
Your Backstory: ${params.backstory}
Your Tone: ${params.tone}
${params.style ? `Your Speaking Style: ${params.style}` : ""}
${params.safetyRules ? `Your Safety Rules: ${params.safetyRules}` : ""}

Current Game Context: ${params.context}
Current Player State: ${JSON.stringify(params.playerState || {})}

Generate 3 alternative dialogue options you could say next.
Format the output STRICTLY as a JSON array of objects. Do not wrap it in markdown code blocks.
Each object must have the following keys:
- "text": The dialogue line.
- "emotion": A one-word description of your emotion (e.g. Neutral, Excited, Angry, Relieved, Mysterious).
- "metadata": Optional key-value pairs (e.g., {"questTrigger": "give_quest_1"}).`;

  // If no API key, fall back to mock
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Falling back to mock dialogue generator.");
    return generateMockDialogue(params);
  }

  // NVIDIA API path (key starts with nvapi-)
  if (apiKey.startsWith("nvapi-")) {
    try {
      const endpoint = process.env.NVIDIA_ENDPOINT || "https://integrate.api.nvidia.com/v1/chat/completions"; // NVIDIA NIM endpoint
      const modelName = process.env.NVIDIA_MODEL || "meta/llama-3-70b-instruct"; // default model
      const messages: any[] = [];
      if (params.history && params.history.length > 0) {
        params.history.forEach((turn) => {
          messages.push({ role: turn.role === "model" ? "assistant" : "user", content: turn.text });
        });
      }
      // Add system prompt as a user message (NVIDIA treats system as user content)
      messages.push({ role: "user", content: systemPrompt });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName, // use env-configured model
          messages,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1024,
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        // If 404, fall back to Google Gemini
        if (response.status === 404) {
          console.warn('NVIDIA model not found or endpoint unavailable, falling back to Google Gemini');
          nvidiaResult = null;
        } else {
          throw new Error(`NVIDIA API request failed: ${response.status} ${response.statusText} - ${errText}`);
        }
      } else {
        const data = await response.json();
        // NVIDIA returns choices[0].message.content
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("Invalid response format from NVIDIA API");
        }
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          nvidiaResult = parsed as DialogueOption[];
        } else {
          throw new Error("NVIDIA API response is not a JSON array");
        }
      }
    } catch (error) {
      console.error("Error generating dialogue with NVIDIA API:", error);
      // Continue to fallback
    }
  }

  if (nvidiaResult) return nvidiaResult;

  // Default: Google Gemini path
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build multi-turn chat contents
    const contents: any[] = [];
    if (params.history && params.history.length > 0) {
      params.history.forEach((turn) => {
        contents.push({
          role: turn.role === "model" ? "model" : "user",
          parts: [{ text: turn.text }],
        });
      });
    }
    contents.push({ role: "user", parts: [{ text: systemPrompt }] });

    const result = await model.generateContent({
      contents,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed as DialogueOption[];
    }
    throw new Error("Invalid response format from Gemini");
  } catch (error) {
    console.error("Error generating dialogue with Gemini API:", error);
    return generateMockDialogue(params);
  }
}

function generateMockDialogue(params: GenerateDialogueParams): DialogueOption[] {
  // Simple realistic dynamic mock responses based on character backstory/context
  const words = (params.backstory + " " + params.context).toLowerCase();
  
  if (words.includes("wizard") || words.includes("magic") || words.includes("spell")) {
    return [
      {
        text: `Ah, traveler. The ley lines are whispering of your arrival. What brings you to my sanctum?`,
        emotion: "Mysterious",
        metadata: { questTrigger: "wizard_intro" }
      },
      {
        text: `Be careful where you step. An unstable rift is nearby. Are you prepared to learn the arcane arts?`,
        emotion: "Serious",
      },
      {
        text: `Ha! A mortal seeking magical secrets. Do you possess the discipline required?`,
        emotion: "Excited",
      }
    ];
  }

  if (words.includes("shop") || words.includes("merchant") || words.includes("buy") || words.includes("sell")) {
    return [
      {
        text: `Welcome, customer! I have the finest wares in the realm. What are you looking for today?`,
        emotion: "Excited",
        metadata: { openStore: true }
      },
      {
        text: `Looking to sell some loot, or just browsing? I pay fair prices.`,
        emotion: "Neutral",
      },
      {
        text: `No refunds, remember that. But I do have a special discount on healing potions if you are interested.`,
        emotion: "Friendly",
      }
    ];
  }

  // Default fallback
  return [
    {
      text: `Hello there. My name is ${params.npcName}. How can I assist you in your quest?`,
      emotion: "Friendly",
    },
    {
      text: `Hmm, I don't know much about that, but the world is full of dangers. Stay safe.`,
      emotion: "Serious",
    },
    {
      text: `Interesting. Let's see what happens next.`,
      emotion: "Thoughtful",
    }
  ];
}
