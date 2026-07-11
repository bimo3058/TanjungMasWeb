-- Profil Desa needs a hero image editable by the admin (previously hardcoded on
-- the homepage). Safe to re-run: ADD COLUMN IF NOT EXISTS.
ALTER TABLE public.profil_desa
  ADD COLUMN IF NOT EXISTS gambar_profil text;
