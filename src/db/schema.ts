import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const npcProfiles = pgTable("npc_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  backstory: text("backstory").notNull(),
  tone: varchar("tone", { length: 255 }).default("Neutral").notNull(),
  style: text("style"),
  safetyRules: text("safety_rules"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dialogueRequests = pgTable("dialogue_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  npcId: uuid("npc_id").references(() => npcProfiles.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // 'CHALLENGE_ISSUED' | 'PAID_COMPLETED' | 'FAILED'
  cost: decimal("cost", { precision: 10, scale: 4 }).default("0.0100").notNull(),
  rawRequest: jsonb("raw_request").notNull(), // { context, playerState }
  rawResponse: jsonb("raw_response"), // { dialogue: [...] }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentReceipts = pgTable("payment_receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id").references(() => dialogueRequests.id, { onDelete: "cascade" }).notNull(),
  transactionHash: varchar("transaction_hash", { length: 255 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull(), // 'SETTLED' | 'FAILED'
  signature: text("signature").notNull(),
  payload: jsonb("payload").notNull(), // { amount, token, payerAddress }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationHistory = pgTable("conversation_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  npcId: uuid("npc_id").references(() => npcProfiles.id, { onDelete: "cascade" }).notNull(),
  playerAddress: varchar("player_address", { length: 255 }).notNull(),
  messages: jsonb("messages").notNull(), // Array of { role: 'user'|'model', text: string }
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  apiKeys: many(apiKeys),
  npcProfiles: many(npcProfiles),
  dialogueRequests: many(dialogueRequests),
  conversationHistories: many(conversationHistory),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  project: one(projects, { fields: [apiKeys.projectId], references: [projects.id] }),
}));

export const npcProfilesRelations = relations(npcProfiles, ({ one, many }) => ({
  project: one(projects, { fields: [npcProfiles.projectId], references: [projects.id] }),
  dialogueRequests: many(dialogueRequests),
  conversationHistories: many(conversationHistory),
}));

export const dialogueRequestsRelations = relations(dialogueRequests, ({ one, many }) => ({
  project: one(projects, { fields: [dialogueRequests.projectId], references: [projects.id] }),
  npcProfile: one(npcProfiles, { fields: [dialogueRequests.npcId], references: [npcProfiles.id] }),
  paymentReceipts: many(paymentReceipts),
}));

export const paymentReceiptsRelations = relations(paymentReceipts, ({ one }) => ({
  dialogueRequest: one(dialogueRequests, { fields: [paymentReceipts.requestId], references: [dialogueRequests.id] }),
}));

export const conversationHistoryRelations = relations(conversationHistory, ({ one }) => ({
  project: one(projects, { fields: [conversationHistory.projectId], references: [projects.id] }),
  npcProfile: one(npcProfiles, { fields: [conversationHistory.npcId], references: [npcProfiles.id] }),
}));

export const spentNonces = pgTable("spent_nonces", {
  nonce: varchar("nonce", { length: 255 }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
