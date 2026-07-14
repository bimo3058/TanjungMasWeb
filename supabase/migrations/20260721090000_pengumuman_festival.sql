-- Pengumuman Desa & Kalender Festival — sidebar halaman Berita.
--
-- Dua entitas kecil yang dikelola dari layar Manajemen Berita (tab), bukan
-- menu tersendiri, karena secara redaksional satu paket dengan kabar desa.
--
-- Aman dijalankan ulang: IF NOT EXISTS / DROP POLICY IF EXISTS.

-- ---------------------------------------------------------------------------
-- 1. Tabel
-- ---------------------------------------------------------------------------
-- Catatan: pakai gen_random_uuid() (bawaan Postgres), bukan uuid_generate_v4()
-- seperti tabel-tabel lama. Fungsi uuid-ossp itu terpasang di schema
-- `extensions`, yang tidak ikut search_path saat CLI menjalankan migration —
-- jadi `supabase db push` gagal meski jalan di SQL Editor dashboard.
CREATE TABLE IF NOT EXISTS public.pengumuman (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  judul character varying NOT NULL,
  isi text,
  -- 'penting' ditandai ikon peringatan di sidebar; 'info' tampil biasa.
  tingkat text NOT NULL DEFAULT 'info',
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pengumuman_pkey PRIMARY KEY (id)
);

ALTER TABLE public.pengumuman DROP CONSTRAINT IF EXISTS pengumuman_tingkat_check;
ALTER TABLE public.pengumuman
  ADD CONSTRAINT pengumuman_tingkat_check CHECK (tingkat IN ('info', 'penting'));

CREATE TABLE IF NOT EXISTS public.festival (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nama character varying NOT NULL,
  -- Tanggal acara (bukan tanggal input) — dipakai mengurutkan kalender.
  tanggal date NOT NULL,
  lokasi character varying,
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT festival_pkey PRIMARY KEY (id)
);

-- Sidebar selalu memfilter published lalu mengurut tanggal/waktu terbit.
CREATE INDEX IF NOT EXISTS pengumuman_published_created_idx
  ON public.pengumuman (published, created_at DESC);
CREATE INDEX IF NOT EXISTS festival_published_tanggal_idx
  ON public.festival (published, tanggal);

-- ---------------------------------------------------------------------------
-- 2. RLS
--    Policy SELECT publik dan SELECT admin bersifat permissive => di-OR-kan.
--    Efeknya: anon & user biasa melihat baris published, admin melihat semua
--    (termasuk yang belum dipublikasikan) tanpa perlu policy terpisah.
-- ---------------------------------------------------------------------------
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festival ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pengumuman_select_public" ON public.pengumuman;
CREATE POLICY "pengumuman_select_public" ON public.pengumuman
  FOR SELECT TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "pengumuman_select_admin" ON public.pengumuman;
CREATE POLICY "pengumuman_select_admin" ON public.pengumuman
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "pengumuman_write_admin" ON public.pengumuman;
CREATE POLICY "pengumuman_write_admin" ON public.pengumuman
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "festival_select_public" ON public.festival;
CREATE POLICY "festival_select_public" ON public.festival
  FOR SELECT TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "festival_select_admin" ON public.festival;
CREATE POLICY "festival_select_admin" ON public.festival
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "festival_write_admin" ON public.festival;
CREATE POLICY "festival_write_admin" ON public.festival
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
