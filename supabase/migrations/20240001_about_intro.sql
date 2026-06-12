-- Tabel untuk konten "Tentang Saya" di halaman About
create table if not exists public.about_intro (
  id         uuid primary key default gen_random_uuid(),
  bio_id     text not null default '',
  bio_en     text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Hanya boleh ada 1 baris (singleton)
-- RLS: hanya admin yang bisa write, semua bisa read
alter table public.about_intro enable row level security;

create policy "about_intro_read"  on public.about_intro for select using (true);
create policy "about_intro_write" on public.about_intro for all    using (auth.role() = 'authenticated');
