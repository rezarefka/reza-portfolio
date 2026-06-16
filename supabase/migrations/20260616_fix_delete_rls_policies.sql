-- Memastikan setiap tabel CMS punya RLS policy yang mengizinkan operasi penuh
-- (select/insert/update/DELETE) untuk user yang sudah login (authenticated),
-- dan read-only untuk publik. Tanpa policy DELETE eksplisit, Supabase akan
-- menolak permintaan delete secara diam-diam jika RLS aktif, sehingga di UI
-- terlihat seperti berhasil (state lokal terhapus) tapi data di database
-- tetap ada (muncul lagi setelah refresh).
--
-- Aman dijalankan berulang kali: policy lama dengan nama sama akan di-drop
-- dulu sebelum dibuat ulang.

do $$
declare
  t text;
  tables text[] := array[
    'about_education', 'about_experiences', 'about_organizations',
    'about_skills', 'about_intro', 'blogs', 'certificates',
    'gallery_photos', 'media', 'projects', 'settings'
  ];
begin
  foreach t in array tables loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security;', t);

      execute format('drop policy if exists "%s_public_read" on public.%I;', t, t);
      execute format(
        'create policy "%s_public_read" on public.%I for select using (true);',
        t, t
      );

      execute format('drop policy if exists "%s_auth_write" on public.%I;', t, t);
      execute format(
        'create policy "%s_auth_write" on public.%I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');',
        t, t
      );
    end if;
  end loop;
end $$;
