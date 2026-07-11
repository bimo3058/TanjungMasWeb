-- Homepage hero section becomes admin-editable: copy (eyebrow/title/lead) and
-- a dedicated hero image, separate from `gambar_profil` (used on the Tentang
-- page). Safe to re-run: ADD COLUMN IF NOT EXISTS.
ALTER TABLE public.profil_desa
  ADD COLUMN IF NOT EXISTS hero_eyebrow text,
  ADD COLUMN IF NOT EXISTS hero_title text,
  ADD COLUMN IF NOT EXISTS hero_lead text,
  ADD COLUMN IF NOT EXISTS hero_image text;
