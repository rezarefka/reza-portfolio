-- Tambah kolom tools ke tabel projects
-- Jalankan sekali di Supabase SQL Editor

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS tools TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_projects_tools ON projects USING GIN(tools);
