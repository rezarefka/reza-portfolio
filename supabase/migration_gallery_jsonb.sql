-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Convert projects.gallery from text[] to JSONB
-- Setiap item sekarang: { url: string, caption: string, sort_order: number }
-- Jalankan di Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Tambah kolom sementara bertipe JSONB
alter table projects add column if not exists gallery_jsonb jsonb not null default '[]'::jsonb;

-- 2. Migrasi data lama (text[]) ke format baru (jsonb array of objects)
--    Baris yang sudah JSONB (array of objects) akan dibiarkan
update projects
set gallery_jsonb = (
  select jsonb_agg(
    jsonb_build_object(
      'url',        elem.value,
      'caption',    '',
      'sort_order', elem.ordinality - 1
    )
  )
  from jsonb_array_elements_text(
    case
      -- sudah JSONB text array
      when jsonb_typeof(gallery::jsonb) = 'array' then gallery::jsonb
      else '[]'::jsonb
    end
  ) with ordinality as elem
)
where gallery is not null
  and gallery::text <> '[]'
  and gallery::text <> 'null';

-- 3. Hapus kolom lama dan rename
alter table projects drop column if exists gallery;
alter table projects rename column gallery_jsonb to gallery;

-- 4. Set default
alter table projects alter column gallery set default '[]'::jsonb;

-- ─── Verifikasi ──────────────────────────────────────────────────────────────
-- select id, title_id, gallery from projects limit 5;
