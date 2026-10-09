-- =========================================================================
-- ARES: Autonomous Resilience & Emergency System — Supabase Database Migration
-- Fully typed schema with Row Level Security (RLS) integrated with Clerk Auth
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_clerk_user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspaces: owner can view and manage"
    ON workspaces
    FOR ALL
    USING (owner_clerk_user_id = auth.jwt() ->> 'sub');

-- 2. Simulations
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_clerk_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    scenario_key TEXT NOT NULL,
    seed BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'idle',
    simulated_tick INT NOT NULL DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Simulations: user isolation"
    ON simulations
    FOR ALL
    USING (owner_clerk_user_id = auth.jwt() ->> 'sub');

CREATE INDEX IF NOT EXISTS idx_simulations_owner ON simulations(owner_clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_workspace ON simulations(workspace_id);

-- 3. Simulation Events Log
CREATE TABLE IF NOT EXISTS simulation_events (
    id TEXT PRIMARY KEY,
    simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
    tick INT NOT NULL,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE simulation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Simulation Events: owner can access"
    ON simulation_events
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM simulations s
            WHERE s.id = simulation_events.simulation_id
            AND s.owner_clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE INDEX IF NOT EXISTS idx_simulation_events_sim_tick ON simulation_events(simulation_id, tick DESC);

-- 4. Agent Decisions Log
CREATE TABLE IF NOT EXISTS agent_decisions (
    id TEXT PRIMARY KEY,
    simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
    tick INT NOT NULL,
    agent_type TEXT NOT NULL,
    action_type TEXT NOT NULL,
    summary TEXT NOT NULL,
    rationale TEXT NOT NULL,
    facts JSONB NOT NULL DEFAULT '{}'::jsonb,
    proposal JSONB NOT NULL DEFAULT '{}'::jsonb,
    validation_status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agent Decisions: owner can access"
    ON agent_decisions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM simulations s
            WHERE s.id = agent_decisions.simulation_id
            AND s.owner_clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE INDEX IF NOT EXISTS idx_agent_decisions_sim_tick ON agent_decisions(simulation_id, tick DESC);

-- 5. Simulation Snapshots (Periodic / on-demand)
CREATE TABLE IF NOT EXISTS simulation_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
    tick INT NOT NULL,
    state JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE simulation_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Simulation Snapshots: owner can access"
    ON simulation_snapshots
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM simulations s
            WHERE s.id = simulation_snapshots.simulation_id
            AND s.owner_clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE INDEX IF NOT EXISTS idx_snapshots_sim_tick ON simulation_snapshots(simulation_id, tick DESC);

-- 6. Simulation Metrics
CREATE TABLE IF NOT EXISTS simulation_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
    tick INT NOT NULL,
    metrics JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE simulation_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Simulation Metrics: owner can access"
    ON simulation_metrics
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM simulations s
            WHERE s.id = simulation_metrics.simulation_id
            AND s.owner_clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE INDEX IF NOT EXISTS idx_metrics_sim_tick ON simulation_metrics(simulation_id, tick DESC);
