import { describe, it, expect } from "vitest";
import { generateEmbedding, cosineSimilarity } from "@/lib/rag/embeddings";

describe("Vector Embeddings & Semantic Search", () => {
  it("should generate a normalized vector embedding of correct dimension", async () => {
    const text = "Elder Theron guards the crystal beacon.";
    const embedding = await generateEmbedding(text);

    expect(embedding).toBeInstanceOf(Array);
    expect(embedding.length).toBe(1536);

    // Magnitude of normalized vector should be approximately 1
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    expect(magnitude).toBeCloseTo(1, 4);
  });

  it("should compute accurate cosine similarity between vectors", () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    const v3 = [0, 1, 0];

    expect(cosineSimilarity(v1, v2)).toBeCloseTo(1, 4);
    expect(cosineSimilarity(v1, v3)).toBeCloseTo(0, 4);
  });
});
