import { env } from "@/lib/env";
import { generateEmbedding, cosineSimilarity } from "./embeddings";

export interface KnowledgeDocument {
  id: string;
  npcId: string;
  title: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

// In-memory vector store fallback for local development
const localVectorStore: KnowledgeDocument[] = [
  {
    id: "doc-1",
    npcId: "npc-1",
    title: "Elder Theron Lore & History",
    content: "Elder Theron is the keeper of the ancient crystal beacon. He remembers the Great Rift 300 years ago.",
  },
  {
    id: "doc-2",
    npcId: "npc-2",
    title: "Vex the Cyber Rogue Backstory",
    content: "Vex specializes in sub-routing encrypted data packets through abandoned orbital relays in the Underbelly.",
  }
];

/**
 * Indexes a knowledge document into Pinecone (or local memory store)
 */
export async function indexDocument(doc: Omit<KnowledgeDocument, "embedding">): Promise<void> {
  const embedding = await generateEmbedding(doc.content);
  const fullDoc: KnowledgeDocument = { ...doc, embedding };

  if (env.PINECONE_API_KEY) {
    try {
      const { Pinecone } = await import("@pinecone-database/pinecone");
      const pc = new Pinecone({ apiKey: env.PINECONE_API_KEY });
      const index = pc.index(env.PINECONE_INDEX_NAME);

      await index.upsert({
        records: [
          {
            id: doc.id,
            values: embedding,
            metadata: {
              npcId: doc.npcId,
              title: doc.title,
              content: doc.content,
              ...doc.metadata,
            },
          },
        ],
      });
      return;
    } catch (err) {
      console.warn("Pinecone upsert failed, stored in memory fallback:", err);
    }
  }

  // Fallback to memory store
  const existingIdx = localVectorStore.findIndex(d => d.id === doc.id);
  if (existingIdx >= 0) {
    localVectorStore[existingIdx] = fullDoc;
  } else {
    localVectorStore.push(fullDoc);
  }
}

/**
 * Searches for most relevant knowledge documents given an NPC ID and query
 */
export async function queryKnowledge(
  npcId: string,
  query: string,
  topK = 3
): Promise<KnowledgeDocument[]> {
  const queryEmbedding = await generateEmbedding(query);

  if (env.PINECONE_API_KEY) {
    try {
      const { Pinecone } = await import("@pinecone-database/pinecone");
      const pc = new Pinecone({ apiKey: env.PINECONE_API_KEY });
      const index = pc.index(env.PINECONE_INDEX_NAME);

      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK,
        filter: { npcId: { $eq: npcId } },
        includeMetadata: true,
      });

      return (queryResponse.matches || []).map(match => ({
        id: match.id,
        npcId: (match.metadata?.npcId as string) || npcId,
        title: (match.metadata?.title as string) || "Document",
        content: (match.metadata?.content as string) || "",
      }));
    } catch (err) {
      console.warn("Pinecone query failed, falling back to local search:", err);
    }
  }

  // Fallback: Cosine similarity over local docs
  const npcDocs = localVectorStore.filter(d => d.npcId === npcId || !d.npcId);
  if (npcDocs.length === 0) return [];

  const scoredDocs = await Promise.all(
    npcDocs.map(async doc => {
      const emb = doc.embedding || (await generateEmbedding(doc.content));
      doc.embedding = emb;
      const score = cosineSimilarity(queryEmbedding, emb);
      return { doc, score };
    })
  );

  return scoredDocs
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.doc);
}
