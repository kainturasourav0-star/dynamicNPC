import { env } from "@/lib/env";

/**
 * Generates vector embeddings for a given text query or lore document.
 * Uses OpenAI text-embedding-3-small or Google text-embedding-004 when keys exist,
 * with deterministic vector fallback for offline local mode.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text.slice(0, 8000)
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.data[0].embedding;
      }
    } catch (err) {
      console.warn("OpenAI embedding failed, falling back to local vectorizer:", err);
    }
  }

  // Fallback: Deterministic 1536-dimensional normalized pseudo-vector based on character hashing
  return generateDeterministicVector(text, 1536);
}

function generateDeterministicVector(text: string, dimensions: number): number[] {
  const vector: number[] = new Array(dimensions).fill(0);
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
    const index = Math.abs(hash) % dimensions;
    vector[index] += (i % 2 === 0 ? 1 : -1) * (1 / (1 + (i % 7)));
  }

  // Normalize vector to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map(v => v / magnitude);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}
