// Use mock database since no Postgres is available on Vercel free tier.
// The mock DB provides a minimal Drizzle-like API backed by in-memory storage.
export { mockDb as db } from "../src/db/mock-db";
export { eq, and, desc } from "../src/db/index";
export * from "../src/db/schema";
