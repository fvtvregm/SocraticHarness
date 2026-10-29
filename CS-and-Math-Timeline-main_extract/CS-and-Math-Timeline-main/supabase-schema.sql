-- Personal Timeline — Supabase Schema
-- Run this in the Supabase SQL Editor to create the table.
-- No RLS, no auth — single user app.

CREATE TABLE IF NOT EXISTS roadmap_nodes (
  id TEXT PRIMARY KEY,
  track TEXT NOT NULL CHECK (track IN ('cs', 'math')),
  time_block TEXT NOT NULL CHECK (time_block IN (
    'summer-before-11',
    'grade-11',
    'summer-before-12',
    'grade-12',
    'summer-after-12'
  )),
  parent_id TEXT REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_link TEXT,
  how_to_learn TEXT,
  notes TEXT DEFAULT '',
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- Index for fast lookups by track and time_block
CREATE INDEX idx_roadmap_nodes_track ON roadmap_nodes(track);
CREATE INDEX idx_roadmap_nodes_time_block ON roadmap_nodes(time_block);
CREATE INDEX idx_roadmap_nodes_parent ON roadmap_nodes(parent_id);

-- Disable RLS (single user, no auth needed)
ALTER TABLE roadmap_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON roadmap_nodes FOR ALL USING (true) WITH CHECK (true);
