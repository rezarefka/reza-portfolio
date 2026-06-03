-- ─────────────────────────────────────────────────────────────────────────────
-- Gallery Photos table
-- Stores photos uploaded from CMS → displayed in public gallery with zoom
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists gallery_photos (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  caption     text,
  orientation text not null default 'horizontal' check (orientation in ('horizontal','vertical')),
  created_at  timestamptz not null default now()
);

-- RLS
alter table gallery_photos enable row level security;

-- Public can read
create policy "gallery_photos_select_public"
  on gallery_photos for select using (true);

-- Only authenticated users (admin) can insert / update / delete
create policy "gallery_photos_insert_auth"
  on gallery_photos for insert with check (auth.role() = 'authenticated');

create policy "gallery_photos_update_auth"
  on gallery_photos for update using (auth.role() = 'authenticated');

create policy "gallery_photos_delete_auth"
  on gallery_photos for delete using (auth.role() = 'authenticated');

-- Index for ordering
create index if not exists gallery_photos_created_at_idx on gallery_photos(created_at desc);
