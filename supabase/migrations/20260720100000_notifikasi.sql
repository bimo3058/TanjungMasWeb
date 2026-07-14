-- Sistem notifikasi admin.
--
-- Notifikasi dicatat oleh trigger database, bukan oleh frontend — jadi perubahan
-- yang dilakukan lewat SQL Editor / dashboard / script pun tetap tercatat.
--
-- Pemicu yang ditangani trigger:
--   • konten_baru     — wisata/UMKM/berita ditambahkan dan langsung tayang
--   • konten_diubah   — baris yang sudah tayang diperbarui
--   • draf            — konten disimpan/ditinggal dalam keadaan belum tayang
--   • konten_dihapus  — baris dihapus
--   • pengguna_baru   — akun baru muncul di profiles (menunggu pemberian peran)
--
-- CATATAN PENTING soal serangan siber / server overload:
--   Trigger Postgres HANYA jalan saat ada perubahan baris. Ia tidak bisa melihat
--   lonjakan trafik, brute-force login, atau CPU/koneksi yang penuh. Karena itu
--   tabel ini dibuat generik (tipe 'sistem' + kolom severity) dan disediakan RPC
--   public.notifikasi_sistem() yang HANYA boleh dipanggil service_role. Monitor
--   di luar DB (Supabase log drain/alert, cron health-check, Edge Function, dsb)
--   yang mendeteksi insiden, lalu menulis ke sini. Lihat blok 6 di bawah.
--
-- Aman dijalankan ulang: memakai IF EXISTS / IF NOT EXISTS / CREATE OR REPLACE.

-- ---------------------------------------------------------------------------
-- 1. Tabel
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifikasi (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipe       text NOT NULL,
  severity   text NOT NULL DEFAULT 'info',
  judul      text NOT NULL,
  pesan      text,
  sumber     text,          -- 'wisata' | 'umkm' | 'berita' | 'profiles' | 'sistem'
  entitas_id uuid,          -- id baris terkait, untuk deep-link ke halaman edit
  aktor_id   uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifikasi DROP CONSTRAINT IF EXISTS notifikasi_tipe_check;
ALTER TABLE public.notifikasi
  ADD CONSTRAINT notifikasi_tipe_check CHECK (tipe IN (
    'konten_baru', 'konten_diubah', 'konten_dihapus', 'draf', 'pengguna_baru', 'sistem'
  ));

ALTER TABLE public.notifikasi DROP CONSTRAINT IF EXISTS notifikasi_severity_check;
ALTER TABLE public.notifikasi
  ADD CONSTRAINT notifikasi_severity_check
  CHECK (severity IN ('info', 'peringatan', 'kritis'));

CREATE INDEX IF NOT EXISTS notifikasi_created_at_idx
  ON public.notifikasi (created_at DESC);

-- Status "sudah dibaca" per admin: satu baris = satu admin sudah membaca satu
-- notifikasi. Tanpa baris = belum dibaca.
CREATE TABLE IF NOT EXISTS public.notifikasi_dibaca (
  notifikasi_id uuid NOT NULL REFERENCES public.notifikasi (id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  dibaca_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notifikasi_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 2. RLS — hanya admin yang boleh membaca; tidak ada satu pun policy tulis,
--    jadi klien (anon/authenticated) TIDAK bisa mengarang notifikasi.
--    Penulisan hanya lewat trigger & RPC (SECURITY DEFINER, milik postgres,
--    sehingga tidak tunduk RLS) atau service_role.
-- ---------------------------------------------------------------------------
ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikasi_dibaca ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifikasi_select_admin" ON public.notifikasi;
CREATE POLICY "notifikasi_select_admin" ON public.notifikasi
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "notifikasi_dibaca_select_own" ON public.notifikasi_dibaca;
CREATE POLICY "notifikasi_dibaca_select_own" ON public.notifikasi_dibaca
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifikasi_dibaca_insert_own" ON public.notifikasi_dibaca;
CREATE POLICY "notifikasi_dibaca_insert_own" ON public.notifikasi_dibaca
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_admin(auth.uid()));

-- Grant eksplisit (pertahanan berlapis). Supabase memasang DEFAULT PRIVILEGES
-- yang otomatis memberi anon/authenticated DML penuh atas tabel baru di schema
-- public — artinya tanpa baris di bawah ini, satu-satunya penghalang tulis
-- adalah RLS. Kita cabut dulu, lalu berikan hanya yang memang dibutuhkan:
-- notifikasi = baca saja; notifikasi_dibaca = baca + tandai (insert).
REVOKE ALL ON public.notifikasi FROM anon, authenticated;
GRANT SELECT ON public.notifikasi TO authenticated;

REVOKE ALL ON public.notifikasi_dibaca FROM anon, authenticated;
GRANT SELECT, INSERT ON public.notifikasi_dibaca TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Trigger konten (wisata / umkm / berita)
--    Satu fungsi generik: nama kolom judul & status tayang berbeda tiap tabel
--    (nama / nama_usaha / judul; published boolean vs status text), jadi baris
--    dibaca lewat to_jsonb() alih-alih menulis tiga fungsi kembar.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notifikasi_konten()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  rec       jsonb;
  judul_row text;
  tayang    boolean;
  label     text;
  v_tipe    text;
  v_pesan   text;
BEGIN
  -- UPDATE yang tidak mengubah apa pun (mis. re-save identik) tidak perlu dicatat.
  IF TG_OP = 'UPDATE' AND to_jsonb(OLD) IS NOT DISTINCT FROM to_jsonb(NEW) THEN
    RETURN NULL;
  END IF;

  IF TG_OP = 'DELETE' THEN
    rec := to_jsonb(OLD);
  ELSE
    rec := to_jsonb(NEW);
  END IF;

  judul_row := COALESCE(rec->>'nama', rec->>'nama_usaha', rec->>'judul', '(tanpa judul)');

  IF TG_TABLE_NAME = 'berita' THEN
    tayang := (rec->>'status') = 'Terpublikasi';
  ELSE
    tayang := COALESCE((rec->>'published')::boolean, false);
  END IF;

  label := CASE TG_TABLE_NAME
             WHEN 'wisata' THEN 'Wisata'
             WHEN 'umkm'   THEN 'UMKM'
             WHEN 'berita' THEN 'Berita'
             ELSE TG_TABLE_NAME
           END;

  IF TG_OP = 'DELETE' THEN
    v_tipe  := 'konten_dihapus';
    v_pesan := label || ' "' || judul_row || '" dihapus.';
  ELSIF NOT tayang THEN
    v_tipe  := 'draf';
    v_pesan := label || ' "' || judul_row || '" tersimpan sebagai draf — belum tayang.';
  ELSIF TG_OP = 'INSERT' THEN
    v_tipe  := 'konten_baru';
    v_pesan := label || ' "' || judul_row || '" ditambahkan dan sudah tayang.';
  ELSE
    v_tipe  := 'konten_diubah';
    v_pesan := label || ' "' || judul_row || '" diperbarui.';
  END IF;

  INSERT INTO public.notifikasi (tipe, severity, judul, pesan, sumber, entitas_id, aktor_id)
  VALUES (
    v_tipe,
    CASE WHEN v_tipe = 'konten_dihapus' THEN 'peringatan' ELSE 'info' END,
    judul_row,
    v_pesan,
    TG_TABLE_NAME,
    -- Baris sudah tiada saat DELETE: jangan tinggalkan deep-link yang pasti 404.
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE (rec->>'id')::uuid END,
    auth.uid()
  );

  RETURN NULL; -- AFTER trigger: nilai balik diabaikan
END;
$$;

DROP TRIGGER IF EXISTS notifikasi_wisata ON public.wisata;
CREATE TRIGGER notifikasi_wisata
  AFTER INSERT OR UPDATE OR DELETE ON public.wisata
  FOR EACH ROW EXECUTE FUNCTION public.notifikasi_konten();

DROP TRIGGER IF EXISTS notifikasi_umkm ON public.umkm;
CREATE TRIGGER notifikasi_umkm
  AFTER INSERT OR UPDATE OR DELETE ON public.umkm
  FOR EACH ROW EXECUTE FUNCTION public.notifikasi_konten();

DROP TRIGGER IF EXISTS notifikasi_berita ON public.berita;
CREATE TRIGGER notifikasi_berita
  AFTER INSERT OR UPDATE OR DELETE ON public.berita
  FOR EACH ROW EXECUTE FUNCTION public.notifikasi_konten();

-- ---------------------------------------------------------------------------
-- 4. Trigger pengguna baru
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notifikasi_pengguna_baru()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifikasi (tipe, severity, judul, pesan, sumber, entitas_id, aktor_id)
  VALUES (
    'pengguna_baru',
    'info',
    COALESCE(NULLIF(NEW.nama_lengkap, ''), 'Pengguna baru'),
    'Akun baru terdaftar dengan peran "' || NEW.role || '". Tinjau di Kelola Pengguna.',
    'profiles',
    NEW.id,
    NEW.id
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS notifikasi_profiles ON public.profiles;
CREATE TRIGGER notifikasi_profiles
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notifikasi_pengguna_baru();

-- ---------------------------------------------------------------------------
-- 5. RPC untuk panel admin
-- ---------------------------------------------------------------------------

-- Daftar notifikasi + status baca milik pemanggil.
CREATE OR REPLACE FUNCTION public.notifikasi_list(batas int DEFAULT 20)
RETURNS TABLE (
  id         uuid,
  tipe       text,
  severity   text,
  judul      text,
  pesan      text,
  sumber     text,
  entitas_id uuid,
  created_at timestamptz,
  dibaca     boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Akses ditolak: hanya admin.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT n.id, n.tipe, n.severity, n.judul, n.pesan, n.sumber, n.entitas_id, n.created_at,
         (d.notifikasi_id IS NOT NULL) AS dibaca
  FROM public.notifikasi n
  LEFT JOIN public.notifikasi_dibaca d
    ON d.notifikasi_id = n.id AND d.user_id = auth.uid()
  ORDER BY n.created_at DESC
  LIMIT LEAST(GREATEST(batas, 1), 100);
END;
$$;

-- Jumlah yang belum dibaca (tidak dibatasi `batas` seperti notifikasi_list).
CREATE OR REPLACE FUNCTION public.notifikasi_belum_dibaca()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  jumlah integer;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Akses ditolak: hanya admin.' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO jumlah
  FROM public.notifikasi n
  WHERE NOT EXISTS (
    SELECT 1 FROM public.notifikasi_dibaca d
    WHERE d.notifikasi_id = n.id AND d.user_id = auth.uid()
  );

  RETURN jumlah;
END;
$$;

-- Tandai dibaca. ids = NULL berarti "tandai semua".
CREATE OR REPLACE FUNCTION public.notifikasi_tandai_dibaca(ids uuid[] DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Akses ditolak: hanya admin.' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.notifikasi_dibaca (notifikasi_id, user_id)
  SELECT n.id, auth.uid()
  FROM public.notifikasi n
  WHERE ids IS NULL OR n.id = ANY (ids)
  ON CONFLICT (notifikasi_id, user_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.notifikasi_list(int)            FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.notifikasi_belum_dibaca()       FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.notifikasi_tandai_dibaca(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.notifikasi_list(int)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.notifikasi_belum_dibaca()        TO authenticated;
GRANT EXECUTE ON FUNCTION public.notifikasi_tandai_dibaca(uuid[]) TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. Kanal alert sistem (serangan siber / server overload / dsb)
--
--    Postgres TIDAK bisa mendeteksi insiden semacam ini sendiri — lihat catatan
--    di kepala berkas. RPC ini adalah pintu masuknya: monitor di luar DB yang
--    mendeteksi, lalu memanggil ini dengan SERVICE ROLE KEY (jangan pernah taruh
--    kunci itu di frontend). Sengaja tidak di-grant ke `authenticated`.
--
--    Contoh dari Edge Function / cron / skrip monitoring:
--      await supabaseAdmin.rpc('notifikasi_sistem', {
--        p_judul: 'Lonjakan kegagalan login',
--        p_pesan: '412 percobaan login gagal dari 3 IP dalam 5 menit.',
--        p_severity: 'kritis',
--      })
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notifikasi_sistem(
  p_judul text,
  p_pesan text,
  p_severity text DEFAULT 'peringatan'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  baru uuid;
BEGIN
  IF p_severity NOT IN ('info', 'peringatan', 'kritis') THEN
    RAISE EXCEPTION 'Severity tidak valid: %', p_severity USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.notifikasi (tipe, severity, judul, pesan, sumber)
  VALUES ('sistem', p_severity, p_judul, p_pesan, 'sistem')
  RETURNING id INTO baru;

  RETURN baru;
END;
$$;

REVOKE ALL ON FUNCTION public.notifikasi_sistem(text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.notifikasi_sistem(text, text, text) TO service_role;

-- ---------------------------------------------------------------------------
-- 7. Realtime (opsional). Bila publication tidak ada (self-host tanpa realtime),
--    blok ini dilewati diam-diam — panel tetap jalan lewat polling/refetch.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifikasi'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikasi;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
END
$$;
