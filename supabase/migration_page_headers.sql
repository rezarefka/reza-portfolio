-- Migration: Add work & blog page header fields to settings table
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS work_title_id TEXT DEFAULT 'Proyek & Kreasi',
  ADD COLUMN IF NOT EXISTS work_title_en TEXT DEFAULT 'Projects & Creations',
  ADD COLUMN IF NOT EXISTS work_description_id TEXT DEFAULT 'Kumpulan karya nyata — dari web app, mobile, visualisasi data, hingga desain kreatif.',
  ADD COLUMN IF NOT EXISTS work_description_en TEXT DEFAULT 'A collection of real works — from web apps, mobile, data visualization, to creative design.',
  ADD COLUMN IF NOT EXISTS blog_title_id TEXT DEFAULT 'Insight & Perspektif dari Dunia Dev',
  ADD COLUMN IF NOT EXISTS blog_title_en TEXT DEFAULT 'Insight & Perspectives from the Dev World',
  ADD COLUMN IF NOT EXISTS blog_description_id TEXT DEFAULT 'Perspektif, pengalaman, dan insight dari Reza Refka Kurniawan seputar dunia pengembangan perangkat lunak.',
  ADD COLUMN IF NOT EXISTS blog_description_en TEXT DEFAULT 'Perspectives, experiences, and insights from Reza Refka Kurniawan about software development.';
