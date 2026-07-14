-- Role-based access control (RBAC) + hardening.
--
-- Sebelum migrasi ini, SEMUA policy tulis memakai `TO authenticated USING (true)`,
-- sehingga akun apa pun yang login bisa menulis seluruh konten & storage lewat API.
-- Migrasi ini menambahkan role ('admin' | 'viewer'), menggerbang semua policy tulis
-- di balik public.is_admin(), melindungi kolom role dari self-escalation, dan
-- menyediakan RPC untuk halaman kelola pengguna in-app.
--
-- Aman untuk dijalankan ulang: memakai IF EXISTS / IF NOT EXISTS / CREATE OR REPLACE.
--
-- ============================================================================
-- BOOTSTRAP ADMIN PERTAMA (jalankan sekali secara manual di SQL Editor / dashboard):
--   UPDATE public.profiles SET role = 'admin'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'email-anda@contoh.com');
-- Setelah ada satu admin, admin tsb bisa mengangkat admin lain lewat menu Kelola Pengguna.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Kolom role di profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'viewer';

-- CHECK constraint (drop-then-add supaya idempotent)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'viewer'));

-- Lindungi kolom role dari self-escalation: user biasa TIDAK boleh mengubah
-- kolom role sama sekali (update nama_lengkap sendiri tetap boleh). Role hanya
-- diubah lewat RPC admin_set_role (SECURITY DEFINER) atau service_role/dashboard.
--
-- Penting: privilege UPDATE level-tabel meng-override REVOKE level-kolom. Karena
-- Supabase memberi `authenticated` UPDATE level-tabel secara default, kita cabut
-- dulu level-tabel lalu berikan kembali HANYA untuk kolom yang boleh diedit user.
REVOKE UPDATE ON public.profiles FROM authenticated, anon;
GRANT UPDATE (nama_lengkap) ON public.profiles TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Helper is_admin() — dipakai semua policy tulis.
--    SECURITY DEFINER + search_path kosong => baca profiles tanpa memicu RLS
--    (menghindari rekursi policy) dan tidak rentan search_path hijacking.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. Gerbang ulang semua policy tulis: dari USING (true) menjadi is_admin().
--    Policy SELECT publik (anon lihat published) tetap; SELECT draft untuk
--    admin digerbang is_admin() juga.
-- ---------------------------------------------------------------------------

-- kategori_*: insert quick-add hanya admin (select publik tetap)
DROP POLICY IF EXISTS "kategori_wisata_insert" ON public.kategori_wisata;
CREATE POLICY "kategori_wisata_insert" ON public.kategori_wisata
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "kategori_umkm_insert" ON public.kategori_umkm;
CREATE POLICY "kategori_umkm_insert" ON public.kategori_umkm
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "kategori_berita_insert" ON public.kategori_berita;
CREATE POLICY "kategori_berita_insert" ON public.kategori_berita
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- wisata
DROP POLICY IF EXISTS "wisata_select_admin" ON public.wisata;
CREATE POLICY "wisata_select_admin" ON public.wisata
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "wisata_write_admin" ON public.wisata;
CREATE POLICY "wisata_write_admin" ON public.wisata
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- umkm
DROP POLICY IF EXISTS "umkm_select_admin" ON public.umkm;
CREATE POLICY "umkm_select_admin" ON public.umkm
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "umkm_write_admin" ON public.umkm;
CREATE POLICY "umkm_write_admin" ON public.umkm
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- berita
DROP POLICY IF EXISTS "berita_select_admin" ON public.berita;
CREATE POLICY "berita_select_admin" ON public.berita
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "berita_write_admin" ON public.berita;
CREATE POLICY "berita_write_admin" ON public.berita
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- galeri_wisata / galeri_umkm (select publik tetap)
DROP POLICY IF EXISTS "galeri_wisata_write_admin" ON public.galeri_wisata;
CREATE POLICY "galeri_wisata_write_admin" ON public.galeri_wisata
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "galeri_umkm_write_admin" ON public.galeri_umkm;
CREATE POLICY "galeri_umkm_write_admin" ON public.galeri_umkm
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- profil_desa (select publik tetap)
DROP POLICY IF EXISTS "profil_desa_write_admin" ON public.profil_desa;
CREATE POLICY "profil_desa_write_admin" ON public.profil_desa
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- storage: hanya admin yang boleh upload/update/hapus (select publik tetap)
DROP POLICY IF EXISTS "public_media_insert" ON storage.objects;
CREATE POLICY "public_media_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'public-media' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "public_media_update" ON storage.objects;
CREATE POLICY "public_media_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'public-media' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'public-media' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "public_media_delete" ON storage.objects;
CREATE POLICY "public_media_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'public-media' AND public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. RPC untuk halaman Kelola Pengguna (in-app)
--    Keduanya SECURITY DEFINER dan MEMERIKSA is_admin() di awal — GRANT EXECUTE
--    ke authenticated aman karena non-admin akan ditolak di dalam fungsi.
-- ---------------------------------------------------------------------------

-- Daftar semua akun + email (email ada di auth.users, tidak terekspos ke
-- authenticated biasa; RPC ini gerbangnya).
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id uuid,
  email text,
  nama_lengkap text,
  role text,
  created_at timestamptz
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
  SELECT p.id,
         u.email::text,
         p.nama_lengkap::text,
         p.role,
         p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at NULLS LAST, u.email;
END;
$$;

-- Ubah role akun lain. Mencegah pemanggil mengubah role dirinya sendiri
-- (anti self-lockout) dan memvalidasi nilai role.
CREATE OR REPLACE FUNCTION public.admin_set_role(target_user uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Akses ditolak: hanya admin.' USING ERRCODE = '42501';
  END IF;

  IF new_role NOT IN ('admin', 'viewer') THEN
    RAISE EXCEPTION 'Role tidak valid: %', new_role USING ERRCODE = '22023';
  END IF;

  IF target_user = auth.uid() THEN
    RAISE EXCEPTION 'Tidak dapat mengubah role akun sendiri.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.profiles SET role = new_role WHERE id = target_user;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengguna tidak ditemukan.' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, text) TO authenticated;
