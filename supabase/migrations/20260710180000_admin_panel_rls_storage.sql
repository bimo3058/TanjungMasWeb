-- Admin panel: RLS policies for all content tables, gallery FK cascade, and the
-- public-media storage bucket used by image uploads.
-- Safe to re-run: every statement either uses IF EXISTS/IF NOT EXISTS or
-- drops-then-recreates the policy/constraint it touches.

-- ---------------------------------------------------------------------------
-- 1. Enable RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.kategori_wisata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kategori_umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kategori_berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wisata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri_wisata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri_umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profil_desa ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. Policies
-- ---------------------------------------------------------------------------

-- kategori_* : public read (needed for public site + admin selects),
-- authenticated-only insert (quick-add from the admin forms). No update/delete
-- policy — there is no category-management screen in scope.
DROP POLICY IF EXISTS "kategori_wisata_select" ON public.kategori_wisata;
CREATE POLICY "kategori_wisata_select" ON public.kategori_wisata
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "kategori_wisata_insert" ON public.kategori_wisata;
CREATE POLICY "kategori_wisata_insert" ON public.kategori_wisata
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "kategori_umkm_select" ON public.kategori_umkm;
CREATE POLICY "kategori_umkm_select" ON public.kategori_umkm
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "kategori_umkm_insert" ON public.kategori_umkm;
CREATE POLICY "kategori_umkm_insert" ON public.kategori_umkm
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "kategori_berita_select" ON public.kategori_berita;
CREATE POLICY "kategori_berita_select" ON public.kategori_berita
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "kategori_berita_insert" ON public.kategori_berita;
CREATE POLICY "kategori_berita_insert" ON public.kategori_berita
  FOR INSERT TO authenticated WITH CHECK (true);

-- wisata / umkm: anon sees published rows only; authenticated (admin) sees
-- everything including drafts; all writes are authenticated-only.
DROP POLICY IF EXISTS "wisata_select_public" ON public.wisata;
CREATE POLICY "wisata_select_public" ON public.wisata
  FOR SELECT TO anon USING (published = true);

DROP POLICY IF EXISTS "wisata_select_admin" ON public.wisata;
CREATE POLICY "wisata_select_admin" ON public.wisata
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "wisata_write_admin" ON public.wisata;
CREATE POLICY "wisata_write_admin" ON public.wisata
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "umkm_select_public" ON public.umkm;
CREATE POLICY "umkm_select_public" ON public.umkm
  FOR SELECT TO anon USING (published = true);

DROP POLICY IF EXISTS "umkm_select_admin" ON public.umkm;
CREATE POLICY "umkm_select_admin" ON public.umkm
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "umkm_write_admin" ON public.umkm;
CREATE POLICY "umkm_write_admin" ON public.umkm
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- berita: anon sees only status = 'Terpublikasi'; authenticated sees everything.
DROP POLICY IF EXISTS "berita_select_public" ON public.berita;
CREATE POLICY "berita_select_public" ON public.berita
  FOR SELECT TO anon USING (status = 'Terpublikasi');

DROP POLICY IF EXISTS "berita_select_admin" ON public.berita;
CREATE POLICY "berita_select_admin" ON public.berita
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "berita_write_admin" ON public.berita;
CREATE POLICY "berita_write_admin" ON public.berita
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- galeri_wisata / galeri_umkm: public read, authenticated-only writes.
DROP POLICY IF EXISTS "galeri_wisata_select" ON public.galeri_wisata;
CREATE POLICY "galeri_wisata_select" ON public.galeri_wisata
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "galeri_wisata_write_admin" ON public.galeri_wisata;
CREATE POLICY "galeri_wisata_write_admin" ON public.galeri_wisata
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "galeri_umkm_select" ON public.galeri_umkm;
CREATE POLICY "galeri_umkm_select" ON public.galeri_umkm
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "galeri_umkm_write_admin" ON public.galeri_umkm;
CREATE POLICY "galeri_umkm_write_admin" ON public.galeri_umkm
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- profil_desa: public read (homepage About section), authenticated-only writes.
DROP POLICY IF EXISTS "profil_desa_select" ON public.profil_desa;
CREATE POLICY "profil_desa_select" ON public.profil_desa
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profil_desa_write_admin" ON public.profil_desa;
CREATE POLICY "profil_desa_write_admin" ON public.profil_desa
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 3. Gallery FK cascade — deleting a wisata/umkm row should delete its photos.
-- (The admin app also deletes gallery rows explicitly before the parent row,
-- so deletes work correctly even before this migration is applied.)
-- ---------------------------------------------------------------------------
ALTER TABLE public.galeri_wisata DROP CONSTRAINT IF EXISTS galeri_wisata_wisata_id_fkey;
ALTER TABLE public.galeri_wisata
  ADD CONSTRAINT galeri_wisata_wisata_id_fkey
  FOREIGN KEY (wisata_id) REFERENCES public.wisata(id) ON DELETE CASCADE;

ALTER TABLE public.galeri_umkm DROP CONSTRAINT IF EXISTS galeri_umkm_umkm_id_fkey;
ALTER TABLE public.galeri_umkm
  ADD CONSTRAINT galeri_umkm_umkm_id_fkey
  FOREIGN KEY (umkm_id) REFERENCES public.umkm(id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- 4. Storage bucket for gambar_utama / url_gambar uploads
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-media', 'public-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_media_select" ON storage.objects;
CREATE POLICY "public_media_select" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'public-media');

DROP POLICY IF EXISTS "public_media_insert" ON storage.objects;
CREATE POLICY "public_media_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public-media');

DROP POLICY IF EXISTS "public_media_update" ON storage.objects;
CREATE POLICY "public_media_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'public-media') WITH CHECK (bucket_id = 'public-media');

DROP POLICY IF EXISTS "public_media_delete" ON storage.objects;
CREATE POLICY "public_media_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'public-media');
