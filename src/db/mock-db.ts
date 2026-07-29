// Simple mock database for integration tests, providing minimal Drizzle-like API
// Supports db.insert(table).values(data).returning() and db.update(table).set(data).where(filter)

let _idCounter = 1;
function generateId(): number {
  return _idCounter++;
}

// Generic handler for a table that stores records in memory
class TableHandler {
  tableName: string;
  storage: Record<string, unknown>[];

  constructor(tableName: string) {
    this.tableName = tableName;
    this.storage = [];
  }

  // Insert chain: .values(data).returning()
  values(data: Record<string, unknown>) {
    const record = { ...data, id: generateId() };
    this.storage.push(record);
    return {
      returning: async (): Promise<Record<string, unknown>[]> => [record]
    };
  }

  // Update chain: .set(data).where(filter)
  set(_data: Record<string, unknown>) {
    return {
      where: async (_filter: unknown): Promise<Record<string, unknown>[]> => []
    };
  }
}

export const mockDb = {
  // Insert returns a new TableHandler for the given table identifier
  insert: (table: { name?: string } | string) =>
    new TableHandler(typeof table === 'string' ? table : (table.name ?? 'unknown')),
  // Update returns a new TableHandler for chaining set/where
  update: (table: { name?: string } | string) =>
    new TableHandler(typeof table === 'string' ? table : (table.name ?? 'unknown')),
  // Query stubs
  query: {
    spentNonces: {
      async findFirst(_opts: unknown): Promise<null> {
        // No spent nonces stored; always return null for replay protection
        return null;
      }
    }
  }
};

// Helper predicate functions used elsewhere
export const eq = (column: { name?: string } | string, value: unknown) => ({
  field: typeof column === 'string' ? column : (column.name ?? column),
  value
});
export const and = (...conditions: unknown[]) => ({ and: conditions });
export const desc = (column: { name?: string } | string) => ({
  desc: typeof column === 'string' ? column : (column.name ?? column)
});
