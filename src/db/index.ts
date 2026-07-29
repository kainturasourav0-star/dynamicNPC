// No direct import needed; re-export schema below
import { mockDb } from "./mock-db";

// Use mock database since Postgres is not running locally on port 5432
export const db: any = mockDb;

// Light mock implementations of Drizzle operators for query parsing
export function eq(column: any, value: any) {
  // If column is a Drizzle column, it has a name property
  const columnName = typeof column === "object" && column !== null ? column.name : column;
  return { field: columnName, value };
}

export function and(...conditions: any[]) {
  return { and: conditions };
}

export function desc(column: any) {
  const columnName = typeof column === "object" && column !== null ? column.name : column;
  return { desc: columnName };
}

export * from "./schema";
export { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
