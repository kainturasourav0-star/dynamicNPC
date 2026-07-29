// Simple mock database for integration tests, providing minimal Drizzle-like API
// Supports db.insert(table).values(data).returning() and db.update(table).set(data).where(filter)

let _idCounter = 1;
function generateId() {
  return _idCounter++;
}

// Generic handler for a table that stores records in memory
class TableHandler {
  constructor(tableName) {
    this.tableName = tableName;
    this.storage = [];
  }

  // Insert chain: .values(data).returning()
  values(data) {
    const record = { ...data, id: generateId() };
    this.storage.push(record);
    return {
      returning: async () => [record]
    };
  }

  // Update chain: .set(data).where(filter)
  set(data) {
    // Simplified: no actual data mutation needed for current tests
    return {
      where: async (filter) => {
        // No operation, return empty array
        return [];
      }
    };
  }
}

export const mockDb = {
  // Insert returns a new TableHandler for the given table identifier
  insert: (table) => new TableHandler(table.name || table),
  // Update returns a new TableHandler for chaining set/where
  update: (table) => new TableHandler(table.name || table),
  // Query stubs
  query: {
    spentNonces: {
      async findFirst({ where }) {
        // No spent nonces stored; always return null for replay protection
        return null;
      }
    }
  }
};

// Helper predicate functions used elsewhere
export const eq = (column, value) => ({ field: column.name ?? column, value });
export const and = (...conditions) => ({ and: conditions });
export const desc = (column) => ({ desc: column.name ?? column });
