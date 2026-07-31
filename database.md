# Database – Dynamic NPC Dialogue (x402-Powered)

## 1. Overview

The platform uses PostgreSQL via Drizzle ORM. The schema is designed to:

- Support multi-user, multi-project usage.
- Track NPC profiles and dialogue requests.
- Persist x402 payment receipts for each billable API call.

This document describes the conceptual schema and key relationships to guide implementation in `src/db/schema.ts`.

## 2. Core Entities & Relationships

- **User**
  - Has many Projects.

- **Project**
  - Belongs to a User.
  - Has many NPC Profiles.
  - Has many API Keys.
  - Has many Dialogue Requests.

- **ApiKey**
  - Belongs to a Project.
  - Used to authenticate API calls.

- **NpcProfile**
  - Belongs to a Project.
  - Referenced by Dialogue Requests.

- **DialogueRequest**
  - Belongs to a Project.
  - Optionally linked to an NpcProfile.
  - Has one PaymentReceipt.

- **PaymentReceipt**
  - Belongs to a DialogueRequest.

## 3. Tables (Conceptual Design)

### 3.1 users

- `id` (UUID, PK)
- `email` (string, unique)
- `password_hash` (string, optional if using OAuth)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 3.2 projects

- `id` (UUID, PK)
- `user_id` (FK → users.id)
- `name` (string)
- `description` (text, optional)
- `default_price_cents` (int, default: 1, representing $0.01)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 3.3 api_keys

- `id` (UUID, PK)
- `project_id` (FK → projects.id)
- `key_hash` (string) – hashed API key for storage.
- `label` (string, optional)
- `last_used_at` (timestamp, nullable)
- `created_at` (timestamp)
- `revoked_at` (timestamp, nullable)

### 3.4 npc_profiles

- `id` (UUID, PK)
- `project_id` (FK → projects.id)
- `name` (string)
- `archetype` (string) – e.g., merchant, guard, quest_giver.
- `persona` (text) – description of personality and traits.
- `backstory` (text) – optional narrative backstory.
- `default_tone` (string, e.g., `friendly`, `hostile`, `formal`)
- `default_language` (string, e.g., `en`)
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 3.5 dialogue_requests

- `id` (UUID, PK)
- `project_id` (FK → projects.id)
- `npc_id` (FK → npc_profiles.id, nullable if NPC is inline)
- `api_key_id` (FK → api_keys.id, nullable but useful for analytics)
- `request_id` (string, unique per project if used for idempotency)
- `status` (enum/string) – values like:
  - `PENDING_CHALLENGE`
  - `CHALLENGE_ISSUED`
  - `PAYMENT_PENDING`
  - `PAID`
  - `PAYMENT_FAILED`
  - `GENERATION_FAILED`
  - `COMPLETED`
- `price_cents` (int)
- `currency` (string, e.g., `USD` or token symbol)
- `input_context` (jsonb) – redacted/summarized context.
- `player_state` (jsonb)
- `output_dialogue` (jsonb) – array of dialogue options.
- `error_code` (string, nullable)
- `error_message` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 3.6 payment_receipts

- `id` (UUID, PK)
- `dialogue_request_id` (FK → dialogue_requests.id, unique)
- `x402_transaction_id` (string)
- `x402_raw_receipt` (jsonb) – full or partial receipt payload.
- `amount_cents` (int)
- `currency` (string)
- `paid_at` (timestamp)
- `created_at` (timestamp)

## 4. Indexing & Query Patterns

- `projects.user_id` – for listing user’s projects.
- `api_keys.project_id`, `api_keys.key_hash` – for fast authentication.
- `npc_profiles.project_id` – for project-scoped NPC listing.
- `dialogue_requests.project_id` + `created_at` – for analytics and logs.
- `dialogue_requests.request_id` – for idempotent handling.
- `payment_receipts.dialogue_request_id` – for joins in logs.

## 5. Drizzle ORM Considerations

- Use `pgTable` for each table in `src/db/schema.ts`.
- Use `uuid` type for primary keys.
- Use `jsonb` for `input_context`, `player_state`, `output_dialogue`, `x402_raw_receipt`.
- Use TypeScript enums or union string types for `dialogue_requests.status`.

## 6. Data Retention & Privacy

- Truncate or summarize `input_context` and `player_state` to avoid storing unnecessary PII.
- Consider optional anonymization for player-related data.
- Allow users to delete a project, which:
  - Soft-deletes or anonymizes related dialogue requests for analytics.

## 7. Migration Strategy

- Define all tables in `schema.ts`.
- Use `drizzle-kit push` to apply schema to the local Postgres instance.
- Evolve schema iteratively during hackathon while preserving core entities.

## 8. Notes for Antigravity

- Use this schema to generate:
  - Drizzle models
  - TypeScript types for entities
  - Repository/helper functions for each entity (e.g., `getProjectByApiKey`, `createDialogueRequest`).
- Ensure all dialogue-related operations go through the `dialogue_requests` and `payment_receipts` tables so logs and analytics stay consistent.
- Match table and column names consistently with what is eventually implemented in `src/db/schema.ts`.