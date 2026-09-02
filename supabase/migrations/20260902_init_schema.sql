-- ==============================================================================
-- NPC-402 AI Dialogue Infrastructure - PostgreSQL Initial Schema & RLS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Projects / Workspaces Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. NPC Profiles Table
CREATE TABLE IF NOT EXISTS npcs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    backstory TEXT NOT NULL,
    tone VARCHAR(100) NOT NULL,
    style VARCHAR(100) NOT NULL,
    safety_rules TEXT NOT NULL,
    cost NUMERIC(10, 4) DEFAULT 0.0100 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Scoped API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    masked_key VARCHAR(50) NOT NULL,
    revoked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Dialogue Logs & x402 Telemetry Table
CREATE TABLE IF NOT EXISTS dialogue_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    npc_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    cost NUMERIC(10, 4) NOT NULL,
    payer_address VARCHAR(255),
    tx_hash VARCHAR(255),
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. Knowledge Documents / RAG Table
CREATE TABLE IF NOT EXISTS knowledge_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    npc_id UUID REFERENCES npcs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    pinecone_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_npcs_project_id ON npcs(project_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_project_id ON api_keys(project_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_dialogue_logs_project_id ON dialogue_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_dialogue_logs_created_at ON dialogue_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_npc_id ON knowledge_docs(npc_id);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogue_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own profile
CREATE POLICY "Users can manage their own profile" 
ON users FOR ALL 
USING (clerk_id = auth.jwt()->>'sub');

-- Allow users to manage projects they own
CREATE POLICY "Users can manage their own projects" 
ON projects FOR ALL 
USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'));

-- Allow access to NPCs under user's projects
CREATE POLICY "Users can manage NPCs in their projects" 
ON npcs FOR ALL 
USING (project_id IN (
    SELECT p.id FROM projects p 
    JOIN users u ON u.id = p.user_id 
    WHERE u.clerk_id = auth.jwt()->>'sub'
));

-- Allow access to API keys under user's projects
CREATE POLICY "Users can manage API keys in their projects" 
ON api_keys FOR ALL 
USING (project_id IN (
    SELECT p.id FROM projects p 
    JOIN users u ON u.id = p.user_id 
    WHERE u.clerk_id = auth.jwt()->>'sub'
));

-- Allow access to dialogue logs under user's projects
CREATE POLICY "Users can view dialogue logs in their projects" 
ON dialogue_logs FOR SELECT 
USING (project_id IN (
    SELECT p.id FROM projects p 
    JOIN users u ON u.id = p.user_id 
    WHERE u.clerk_id = auth.jwt()->>'sub'
));
