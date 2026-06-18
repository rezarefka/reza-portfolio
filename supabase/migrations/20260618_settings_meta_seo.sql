-- Migration: Add SEO meta title & description fields for Home page to settings table
-- Field ini menentukan judul/deskripsi yang muncul di hasil pencarian Google (search snippet),
-- terpisah dari tagline yang tampil di UI website.
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS meta_title_id TEXT DEFAULT 'Reza Refka Kurniawan – Full Stack Developer & Data Engineer',
  ADD COLUMN IF NOT EXISTS meta_title_en TEXT DEFAULT 'Reza Refka Kurniawan – Full Stack Developer & Data Engineer',
  ADD COLUMN IF NOT EXISTS meta_description_id TEXT DEFAULT 'Portfolio Reza Refka Kurniawan – Full Stack Developer & Data Engineer dari Makassar, Indonesia.',
  ADD COLUMN IF NOT EXISTS meta_description_en TEXT DEFAULT 'Portfolio of Reza Refka Kurniawan – Full Stack Developer & Data Engineer from Makassar, Indonesia.';
