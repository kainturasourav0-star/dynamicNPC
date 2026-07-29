import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { mockDb } from "./mock-db";
import { eq as drizzleEq, and as drizzleAnd, desc as drizzleDesc } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL;

export let isRealDb = false;
export let db: any;

if (databaseUrl && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
  try {
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false }
    });
    db = drizzle(pool, { schema });
    isRealDb = true;
    console.log("Database initialized using real PostgreSQL connection.");
  } catch (err) {
    console.error("Failed to initialize real PostgreSQL, falling back to mock DB:", err);
    db = mockDb;
    isRealDb = false;
  }
} else {
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
