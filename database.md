# Database Configuration Guide

This project supports **both** a local in-memory fallback (mock database) and a real, hosted PostgreSQL database (such as Supabase or Neon).

## How it works

1. **Dynamic Initialization**: At runtime, the application checks if the `DATABASE_URL` environment variable is defined in your `.env` file and starts with `postgres://` or `postgresql://`.
2. **Real PostgreSQL Connection**: If a valid URL is found, the app automatically establishes a PostgreSQL pool using Drizzle ORM and runs all operations against your live database.
3. **Mock DB Fallback**: If no `DATABASE_URL` is found (e.g. on Vercel free tier deployments without an associated database), the app transparently falls back to a mock, in-memory database so it can be previewed without crashing.

---

## Setting up your hosted PostgreSQL Database

To configure a hosted database (e.g., Supabase or Neon):

### 1. Get your Database Connection String
- Sign in to your database provider (e.g., [Supabase](https://supabase.com) or [Neon](https://neon.tech)).
- Create a new project or database.
- Go to the database settings and retrieve the transaction/connection string (make sure it starts with `postgresql://` or `postgres://`).

### 2. Configure Environment Variables
Update your local `.env` file (and Vercel environment variables) to include your connection string:

```env
DATABASE_URL=your-postgresql-connection-string
```

### 3. Push the Schema to the Hosted Database
Run the following npm command to push your Drizzle schema (defined in `src/db/schema.ts`) to your remote database:

```bash
npm run db:push
```

This will automatically create all tables (`users`, `projects`, `api_keys`, `npc_profiles`, etc.) and establish relationships in your hosted database.

### 4. Inspect your Database
To inspect, browse, and edit your live database data using a GUI in your web browser, run:

```bash
npm run db:studio
```

---

## Production Deployment (Vercel)

Ensure you add the `DATABASE_URL` key under your Vercel project's Environment Variables settings so that the live serverless functions connect directly to your hosted database rather than the mock DB.
