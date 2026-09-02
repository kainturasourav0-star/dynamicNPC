import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { mockDb } from "./mock-db";
import { eq as drizzleEq, and as drizzleAnd, desc as drizzleDesc } from "drizzle-orm";
import "@/lib/env";

const databaseUrl = process.env.DATABASE_URL;

const isBuilding = 
  process.env.NEXT_PHASE === "phase-production-build" || 
  process.argv.includes("build") || 
  process.argv.some(arg => typeof arg === "string" && (arg.includes("next-build") || arg.endsWith("next")));

export let isRealDb = false;
export let db: any;

if (databaseUrl && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 1500, // Fail fast if unreachable
  });

  try {
    // Probe the connection
    const client = await pool.connect();
    client.release();
    db = drizzle(pool, { schema });
    isRealDb = true;
    console.log("Database initialized using real PostgreSQL connection.");
  } catch (err) {
    if (process.env.NODE_ENV === "production" && !isBuilding) {
      console.error("FATAL: Database connection failed in production mode:", err);
      throw new Error(`FATAL: Database connection failed in production mode: ${err instanceof Error ? err.message : String(err)}`);
    }
    console.warn("Failed to connect to real PostgreSQL, falling back to mock DB:", err);
    await pool.end().catch(() => {});
    db = mockDb;
    isRealDb = false;
  }
} else {
  if (process.env.NODE_ENV === "production" && !isBuilding) {
    console.error("FATAL: DATABASE_URL is missing or invalid in production mode.");
    throw new Error("FATAL: DATABASE_URL is missing or invalid in production mode.");
  }
  db = mockDb;
  isRealDb = false;
  console.log("Database initialized using mock/in-memory DB.");
}

export function eq(column: any, value: any) {
  if (isRealDb) {
    return drizzleEq(column, value);
  }
  const columnName = typeof column === "object" && column !== null ? column.name : column;
  return { field: columnName, value };
}

export function and(...conditions: any[]) {
  if (isRealDb) {
    return drizzleAnd(...conditions);
  }
  return { and: conditions };
}

export function desc(column: any) {
  if (isRealDb) {
    return drizzleDesc(column);
  }
  const columnName = typeof column === "object" && column !== null ? column.name : column;
  return { desc: columnName };
}

export * from "./schema";
export { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
