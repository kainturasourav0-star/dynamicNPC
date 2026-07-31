import crypto from "crypto";
import * as schema from "./schema";

// Global storage to persist data across requests/invocations within the same container
const globalForMockDb = globalThis as typeof globalThis & {
  __mockDbStorage?: Record<string, any[]>;
};

if (!globalForMockDb.__mockDbStorage) {
  globalForMockDb.__mockDbStorage = {
    users: [],
    projects: [],
    api_keys: [],
    npc_profiles: [],
    dialogue_requests: [],
    payment_receipts: [],
    conversation_history: [],
    spent_nonces: [],
  };
}

const storage = globalForMockDb.__mockDbStorage;

function generateUuid(): string {
  return crypto.randomUUID();
}

function getTableName(table: any): string {
  if (typeof table === 'string') return table;
  if (!table) return 'unknown';
  for (const [key, value] of Object.entries(schema)) {
    if (value === table) {
      if (key === 'users') return 'users';
      if (key === 'projects') return 'projects';
      if (key === 'apiKeys') return 'api_keys';
      if (key === 'npcProfiles') return 'npc_profiles';
      if (key === 'dialogueRequests') return 'dialogue_requests';
      if (key === 'paymentReceipts') return 'payment_receipts';
      if (key === 'conversationHistory') return 'conversation_history';
      if (key === 'spentNonces') return 'spent_nonces';
    }
  }
  if (table.name) return table.name;
  return 'unknown';
}

function getRecordValue(record: any, fieldName: string) {
  if (record[fieldName] !== undefined) return record[fieldName];
  // Convert snake_case to camelCase
  const camelName = fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  return record[camelName];
}

function matchCondition(record: any, cond: any): boolean {
  if (!cond) return true;
  if (cond.and) {
    return cond.and.every((c: any) => matchCondition(record, c));
  }
  if (cond.field !== undefined) {
    const recordVal = getRecordValue(record, cond.field);
    const targetVal = cond.value;
    return recordVal === targetVal;
  }
  return true;
}

function populateRelations(tableName: string, record: any, withOpt: any) {
  if (!withOpt) return record;
  const result = { ...record };
  
  if (tableName === 'users') {
    if (withOpt.projects) {
      result.projects = storage.projects.filter(p => p.userId === result.id);
    }
  }
  if (tableName === 'api_keys') {
    if (withOpt.project) {
      result.project = storage.projects.find(p => p.id === result.projectId);
    }
  }
  if (tableName === 'dialogue_requests') {
    if (withOpt.npcProfile) {
      result.npcProfile = storage.npc_profiles.find(n => n.id === result.npcId);
    }
    if (withOpt.paymentReceipts) {
      result.paymentReceipts = storage.payment_receipts.filter(r => r.requestId === result.id);
    }
  }
  
  return result;
}

function sortRecords(records: any[], orderByOpt: any) {
  if (!orderByOpt) return records;
  const isDesc = orderByOpt.desc !== undefined;
  const fieldName = isDesc ? orderByOpt.desc : (typeof orderByOpt === 'object' && orderByOpt !== null ? orderByOpt.name : orderByOpt);
  
  return [...records].sort((a, b) => {
    const valA = getRecordValue(a, fieldName);
    const valB = getRecordValue(b, fieldName);
    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    
    if (isDesc) {
      return valA < valB ? 1 : -1;
    } else {
      return valA > valB ? 1 : -1;
    }
  });
}

class InsertQuery {
  tableName: string;
  data: any;

  constructor(tableName: string, data: any) {
    this.tableName = tableName;
    this.data = data;
  }

  returning() {
    const defaults: Record<string, any> = {};
    if (this.tableName === 'npc_profiles') {
      defaults.isDeleted = false;
      defaults.tone = "Neutral";
      defaults.style = "";
      defaults.safetyRules = "";
      defaults.cost = "0.0100";
    } else if (this.tableName === 'api_keys') {
      defaults.isActive = true;
    } else if (this.tableName === 'dialogue_requests') {
      defaults.cost = "0.0100";
    }

    const record = {
      id: this.data.id || generateUuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...defaults,
      ...this.data
    };
    storage[this.tableName].push(record);
    return Promise.resolve([record]);
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.returning().then(onfulfilled, onrejected);
  }
}

class InsertBuilder {
  tableName: string;
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  values(data: any) {
    return new InsertQuery(this.tableName, data);
  }
}

class UpdateBuilder {
  tableName: string;
  data: any;
  condition: any;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  set(data: any) {
    this.data = data;
    return this;
  }

  where(condition: any) {
    this.condition = condition;
    return this;
  }

  async returning() {
    const records = storage[this.tableName];
    const updated: any[] = [];
    for (let i = 0; i < records.length; i++) {
      if (matchCondition(records[i], this.condition)) {
        records[i] = {
          ...records[i],
          ...this.data,
          updatedAt: new Date()
        };
        updated.push(records[i]);
      }
    }
    return updated;
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.returning().then(onfulfilled, onrejected);
  }
}

class DeleteBuilder {
  tableName: string;
  condition: any;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  where(condition: any) {
    this.condition = condition;
    return this;
  }

  async execute() {
    const records = storage[this.tableName];
    const remaining: any[] = [];
    for (const record of records) {
      if (!matchCondition(record, this.condition)) {
        remaining.push(record);
      }
    }
    storage[this.tableName] = remaining;
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class SelectBuilder {
  fields: any;
  table: any;
  condition: any;

  constructor(fields?: any) {
    this.fields = fields;
  }

  from(table: any) {
    this.table = table;
    return this;
  }

  where(condition: any) {
    this.condition = condition;
    return this;
  }

  async execute() {
    const tableName = getTableName(this.table);
    let records = storage[tableName] || [];
    if (this.condition) {
      records = records.filter(r => matchCondition(r, this.condition));
    }

    let count = records.length;
    let sumCost = 0;
    for (const r of records) {
      if (r.cost) {
        sumCost += parseFloat(r.cost || "0");
      }
    }

    const result: any = {};
    if (this.fields) {
      for (const [key, value] of Object.entries(this.fields)) {
        if (key === 'count') {
          result.count = count;
        } else if (key === 'totalCost') {
          result.totalCost = String(sumCost);
        } else {
          result[key] = records[0] ? getRecordValue(records[0], key) : null;
        }
      }
    } else {
      return records;
    }

    return [result];
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

// Generate the query handlers
const queryHandlers: Record<string, any> = {};
for (const tableName of ['users', 'projects', 'api_keys', 'npc_profiles', 'dialogue_requests', 'payment_receipts', 'conversation_history', 'spent_nonces']) {
  let queryName = tableName;
  if (tableName === 'api_keys') queryName = 'apiKeys';
  if (tableName === 'npc_profiles') queryName = 'npcProfiles';
  if (tableName === 'dialogue_requests') queryName = 'dialogueRequests';
  if (tableName === 'payment_receipts') queryName = 'paymentReceipts';
  if (tableName === 'conversation_history') queryName = 'conversationHistory';
  if (tableName === 'spent_nonces') queryName = 'spentNonces';

  queryHandlers[queryName] = {
    findFirst: async (options?: any) => {
      let records = storage[tableName] || [];
      if (options?.where) {
        records = records.filter(r => matchCondition(r, options.where));
      }
      records = sortRecords(records, options?.orderBy);
      if (records.length === 0) return null;
      const record = records[0];
      return populateRelations(tableName, record, options?.with);
    },
    findMany: async (options?: any) => {
      let records = storage[tableName] || [];
      if (options?.where) {
        records = records.filter(r => matchCondition(r, options.where));
      }
      records = sortRecords(records, options?.orderBy);
      if (options?.limit) {
        records = records.slice(0, options.limit);
      }
      return records.map(r => populateRelations(tableName, r, options?.with));
    }
  };
}

export const mockDb = {
  insert: (table: any) => new InsertBuilder(getTableName(table)),
  update: (table: any) => new UpdateBuilder(getTableName(table)),
  delete: (table: any) => new DeleteBuilder(getTableName(table)),
  select: (fields?: any) => new SelectBuilder(fields),
  execute: async () => {
    return { rows: [] };
  },
  query: queryHandlers,
};
