-- Penanda "Sorotan" pada berita — kartu besar di puncak halaman Berita.
--
-- Sebelumnya sorotan dipilih otomatis (berita terbaru), sehingga berita penting
-- selalu tergeser begitu ada kabar baru masuk. Kolom ini memberi admin kendali,
-- dengan fallback: bila tidak ada yang ditandai, frontend kembali memakai berita
-- terbaru — halaman tidak pernah kehilangan sorotannya.
--
-- Aman dijalankan ulang.

ALTER TABLE public.berita
  ADD COLUMN IF NOT EXISTS sorotan boolean NOT NULL DEFAULT false;

-- Hanya boleh ada satu sorotan. Index partial ini menjaga aturan tersebut bahkan
-- terhadap perubahan langsung lewat SQL Editor, bukan hanya lewat aplikasi.
CREATE UNIQUE INDEX IF NOT EXISTS berita_sorotan_tunggal_idx
  ON public.berita (sorotan)
  WHERE sorotan = true;

-- Tanpa trigger ini, menandai sorotan baru akan ditolak index di atas selama
-- sorotan lama belum dilepas — admin harus mematikan yang lama dulu, dan lupa
-- satu langkah itu berujung error yang membingungkan. Trigger melepasnya sendiri.
CREATE OR REPLACE FUNCTION public.berita_sorotan_tunggal()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- UPDATE di bawah menulis sorotan = false, sehingga WHEN (NEW.sorotan) pada
  -- trigger tidak terpenuhi dan tidak terjadi rekursi.
  UPDATE public.berita
  SET sorotan = false
  WHERE sorotan = true
    AND id <> NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS berita_sorotan_tunggal ON public.berita;
CREATE TRIGGER berita_sorotan_tunggal
  BEFORE INSERT OR UPDATE OF sorotan ON public.berita
  FOR EACH ROW
  WHEN (NEW.sorotan)
  EXECUTE FUNCTION public.berita_sorotan_tunggal();
