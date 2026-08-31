-- ========================================================================
-- SwasthAI First-Party Analytics Schema for Supabase / PostgreSQL
-- Privacy-Conscious Clinic Operations & Blog Traction Tracking
-- ========================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Raw Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    event_type TEXT NOT NULL,
    path TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    is_returning_visitor BOOLEAN DEFAULT FALSE,
    article_slug TEXT,
    article_title TEXT,
    content_pillar TEXT,
    author TEXT,
    audience TEXT,
    scroll_depth INTEGER,
    active_seconds INTEGER,
    cta_text TEXT,
    cta_location TEXT,
    cta_variant TEXT,
    destination_url TEXT,
    referrer TEXT,
    traffic_source TEXT,
    device TEXT,
    browser TEXT,
    country TEXT,
    attribution JSONB,
    meta JSONB
);

-- Indexes for high-speed queries & aggregation
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON analytics_events(path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_article_slug ON analytics_events(article_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_events_traffic_source ON analytics_events(traffic_source);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id ON analytics_events(visitor_id);

-- 2. Content Experiments Table
CREATE TABLE IF NOT EXISTS content_experiments (
    id TEXT PRIMARY KEY,
    article_slug TEXT NOT NULL,
    article_title TEXT NOT NULL,
    experiment_type TEXT NOT NULL,
    change_date DATE NOT NULL,
    description TEXT NOT NULL,
    before_metrics JSONB,
    after_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Search Console Metrics Table
CREATE TABLE IF NOT EXISTS search_console_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    page TEXT,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr NUMERIC(5,2) DEFAULT 0,
    position NUMERIC(5,2) DEFAULT 0,
    trend TEXT DEFAULT 'STABLE',
    recorded_at DATE DEFAULT CURRENT_DATE
);

-- RLS Security Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_console_metrics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous ingestion from Next.js serverless / edge (Service Role or Anon Key)
CREATE POLICY "Allow anonymous event inserts" ON analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read events for dashboard" ON analytics_events
    FOR SELECT USING (true);

CREATE POLICY "Allow experiments access" ON content_experiments
    FOR ALL USING (true);

CREATE POLICY "Allow search console access" ON search_console_metrics
    FOR ALL USING (true);
