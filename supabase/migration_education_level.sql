-- ============================================================
-- Migration: education_level system
-- Hapus: degree, field_of_study
-- Tambah: education_level ('S1','D3','D4','S2','S3','SMA/SMK')
-- ============================================================

-- 1. Tambah kolom education_level dengan default S1
ALTER TABLE about_education
  ADD COLUMN IF NOT EXISTS education_level TEXT NOT NULL DEFAULT 'S1';

-- 2. Set semua baris existing ke S1 (sesuaikan manual jika perlu)
UPDATE about_education SET education_level = 'S1' WHERE education_level IS NULL OR education_level = '';

-- 3. Hapus kolom lama
ALTER TABLE about_education DROP COLUMN IF EXISTS degree;
ALTER TABLE about_education DROP COLUMN IF EXISTS field_of_study;

-- ============================================================
-- Jalankan query ini di Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================
