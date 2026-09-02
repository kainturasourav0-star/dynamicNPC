import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const rawKey =
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.NVIDIA_API_KEY ||
    "";

  const systemPrompt = `You are a friendly, intelligent AI companion named ${params.npcName}.
Your Backstory & Knowledge: ${params.backstory || "An open-minded, knowledgeable friend who can discuss any topic, answer any question, share stories, and chat casually."}
Your Personality Tone: ${params.tone || "Friendly"}
${params.style ? `Your Speaking Style: ${params.style}` : ""}

Current Conversation Context: ${params.context}

Generate 3 alternative response options you could say next as a close friend.
Format the output STRICTLY as a JSON array of 3 objects without markdown formatting.
Each object must have the following keys:
- "text": The response line (1-3 sentences).
- "emotion": A one-word description of your emotion (e.g. Friendly, Excited, Thoughtful, Warm, Curious).
- "metadata": Optional key-value pairs.`;

  if (!rawKey) {
    console.warn("[LLM] No API key defined. Using mock dialogue generator.");
    return generateMockDialogue(params);
  }

  // 1. OpenAI API path
  if (rawKey.startsWith("sk-")) {
    try {
      console.log("[LLM] Attempting OpenAI generation...");
      const messages: any[] = [{ role: "system", content: systemPrompt }];
      if (params.history && params.history.length > 0) {
        params.history.forEach((turn) => {
          messages.push({ role: turn.role === "model" ? "assistant" : "user", content: turn.text });
        });
      }
      messages.push({ role: "user", content: params.context || "Hello!" });

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${rawKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.8,
          max_tokens: 500,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log("[LLM] OpenAI generation succeeded.");
            return parsed as DialogueOption[];
          }
        }
      }
    } catch (error: any) {
      console.warn("[LLM] OpenAI error:", error.message || error);
    }
  }

  // 2. NVIDIA NIM path
  if (rawKey.startsWith("nvapi-")) {
    try {
      console.log("[LLM] Attempting NVIDIA NIM generation...");
      const endpoint = process.env.NVIDIA_ENDPOINT || "https://integrate.api.nvidia.com/v1/chat/completions";
      const modelName = process.env.NVIDIA_MODEL || "meta/llama-3.2-90b-vision-instruct";
      const messages: any[] = [];
      if (params.history && params.history.length > 0) {
        params.history.forEach((turn) => {
          messages.push({ role: turn.role === "model" ? "assistant" : "user", content: turn.text });
        });
      }
      messages.push({ role: "user", content: systemPrompt });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${rawKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          temperature: 0.8,
          max_tokens: 500,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log("[LLM] NVIDIA NIM generation succeeded.");
            return parsed as DialogueOption[];
          }
        }
      } else {
        const errText = await response.text();
        console.warn(`[LLM] NVIDIA API status ${response.status}: ${errText.slice(0, 150)}`);
      }
    } catch (error: any) {
      console.warn("[LLM] NVIDIA error:", error.message || error);
    }
  }

  // 3. Google Gemini path (when key is standard Google AI key)
  if (rawKey && !rawKey.startsWith("sk-") && !rawKey.startsWith("nvapi-")) {
    try {
      const genAI = new GoogleGenerativeAI(rawKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as DialogueOption[];
      }
    } catch (error: any) {
      console.warn("[LLM] Gemini error:", error.message || error);
    }
  }

  return generateMockDialogue(params);
}

function generateMockDialogue(params: GenerateDialogueParams): DialogueOption[] {
  const context = (params.context || "").toLowerCase();
  if (context.includes("drink") || context.includes("ale") || context.includes("bartender")) {
    return [
      { text: "Here's our finest brew! Straight from the cellar casks.", emotion: "Friendly" },
      { text: "Rough day on the road? Sit back, take a sip, and relax.", emotion: "Warm" },
      { text: "Careful with that one — it's got quite a kick!", emotion: "Playful" },
    ];
  }
  if (context.includes("quest") || context.includes("adventure") || context.includes("wizard")) {
    return [
      { text: "The path ahead is dangerous, but fortunes favor the bold.", emotion: "Mysterious" },
      { text: "I've heard rumors of ancient magic stirring in the ruins nearby.", emotion: "Thoughtful" },
      { text: "Take this advice: always keep your wits sharp and your blade ready.", emotion: "Encouraging" },
    ];
  }
  return [
    {
      text: `Hey there! It's so great talking with you. What's on your mind today, my friend?`,
      emotion: "Friendly",
    },
    {
      text: `That's a really interesting point! I love discussing things like this with you.`,
      emotion: "Thoughtful",
    },
    {
      text: `Haha, I totally agree! Tell me more about what you're up to!`,
      emotion: "Excited",
    }
  ];
}

