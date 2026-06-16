-- Tambah kolom untuk melacak kapan file CV terakhir diupdate
alter table public.settings
  add column if not exists cv_updated_at timestamptz;

-- Set nilai awal dari updated_at jika cv_file sudah terisi (best-effort, sekali jalan)
update public.settings
  set cv_updated_at = updated_at
  where cv_file is not null and cv_updated_at is null;
