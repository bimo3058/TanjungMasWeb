-- Seed real destinasi wisata, produk UMKM, dan berita untuk Kelurahan Tanjung Mas /
-- Kampung Bahari Tambaklorok, disusun dari riset sumber publik (situs resmi
-- kelurahan, media lokal, jurnal pengabdian masyarakat). Tidak ada data yang
-- direkayasa: kolom yang tidak berhasil diverifikasi (nomor telepon UMKM, jam
-- operasional yang tidak tercantum di sumber, foto asli) sengaja dibiarkan NULL
-- alih-alih diisi nilai palsu.
--
-- Safe to re-run: setiap INSERT dijaga dengan WHERE NOT EXISTS pada nama/slug.

-- ---------------------------------------------------------------------------
-- 1. Kategori
-- ---------------------------------------------------------------------------
INSERT INTO public.kategori_wisata (nama)
SELECT v.nama FROM (VALUES ('Wisata Bahari'), ('Wisata Kuliner'), ('Wisata Alam')) AS v(nama)
WHERE NOT EXISTS (SELECT 1 FROM public.kategori_wisata k WHERE k.nama = v.nama);

INSERT INTO public.kategori_umkm (nama)
SELECT v.nama FROM (VALUES ('Makanan')) AS v(nama)
WHERE NOT EXISTS (SELECT 1 FROM public.kategori_umkm k WHERE k.nama = v.nama);

INSERT INTO public.kategori_berita (nama)
SELECT v.nama FROM (VALUES ('Pembangunan'), ('Budaya'), ('UMKM'), ('Acara')) AS v(nama)
WHERE NOT EXISTS (SELECT 1 FROM public.kategori_berita k WHERE k.nama = v.nama);

-- ---------------------------------------------------------------------------
-- 2. Wisata
-- Sumber: halosemarang.id (tanggul laut & sunset), Kompas.com "Pasar Tambak
-- Lorok Jadi Pusat Wisata Kuliner Ikan Laut" (2019), detik.com Jateng
-- "Mangrove Edupark Tambakrejo" (RW 16, Kelurahan Tanjung Mas).
-- ---------------------------------------------------------------------------
INSERT INTO public.wisata (nama, slug, deskripsi, kategori_id, alamat_lengkap, jam_operasional, harga_tiket, published)
SELECT
  'Tanggul Laut Kampung Bahari Tambaklorok',
  'tanggul-laut-kampung-bahari-tambaklorok',
  'Tanggul laut sepanjang sekitar 3,6 km yang dibangun untuk menahan banjir rob sekaligus menjadi ruang publik favorit warga. Sore hari, tanggul ini ramai dikunjungi untuk menikmati matahari terbenam, memancing, dan menyaksikan perahu-perahu nelayan bersandar menjelang melaut malam hari.',
  (SELECT id FROM public.kategori_wisata WHERE nama = 'Wisata Bahari'),
  'Tanggul Laut Tambaklorok, Kelurahan Tanjung Mas, Semarang Utara, Kota Semarang',
  '24 Jam',
  'Gratis',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.wisata WHERE slug = 'tanggul-laut-kampung-bahari-tambaklorok');

INSERT INTO public.wisata (nama, slug, deskripsi, kategori_id, alamat_lengkap, jam_operasional, harga_tiket, published)
SELECT
  'Pasar Ikan Tambak Lorok (TPI Tambak Mulyo)',
  'pasar-ikan-tambak-lorok-tpi-tambak-mulyo',
  'Pusat grosir ikan segar dan tempat pelelangan ikan (TPI) yang menjadi jantung ekonomi nelayan Tambak Lorok. Pengunjung bisa berburu ikan, udang, kerang, dan aneka ikan asin langsung dari nelayan, sekaligus menyaksikan aktivitas lelang ikan yang berlangsung dua kali sehari.',
  (SELECT id FROM public.kategori_wisata WHERE nama = 'Wisata Kuliner'),
  'Jl. Tambak Mulyo, Kelurahan Tanjung Mas, Semarang Utara, Kota Semarang',
  '05.00–15.00 (lelang TPI 07.30–09.00 & 13.30–15.00)',
  'Gratis',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.wisata WHERE slug = 'pasar-ikan-tambak-lorok-tpi-tambak-mulyo');

INSERT INTO public.wisata (nama, slug, deskripsi, kategori_id, alamat_lengkap, harga_tiket, published)
SELECT
  'Mangrove Edupark Tambaklorok',
  'mangrove-edupark-tambaklorok',
  'Kawasan hutan mangrove hasil rintisan kelompok nelayan sejak 2011, kini dilengkapi jembatan bambu, Saung Rhizophora, Saung Avicennia, Expression Corner, dan penangkaran burung (bird sanctuary). Lokasi diakses menggunakan perahu motor bersama pemandu yang juga memberi edukasi seputar ekosistem mangrove.',
  (SELECT id FROM public.kategori_wisata WHERE nama = 'Wisata Alam'),
  'RW 16, Kelurahan Tanjung Mas, Semarang Utara, Kota Semarang',
  'Rp 15.000 / orang (naik perahu motor, 5–10 orang)',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.wisata WHERE slug = 'mangrove-edupark-tambaklorok');

-- ---------------------------------------------------------------------------
-- 3. UMKM
-- Sumber: repository.usm.ac.id (Poklahsar Mina Karya, berdiri 2010, produk
-- kerupuk ikan/ikan asin/terasi/bandeng duri lunak/teri krispi/mangrove
-- krispi), radarbanyumas.disway.id & pwmjateng.com (Srikandi Cipta Bahari,
-- pendampingan kemasan UMP Mei 2026). Nomor telepon tidak ditemukan di
-- sumber manapun sehingga sengaja dikosongkan, bukan direkayasa.
-- ---------------------------------------------------------------------------
INSERT INTO public.umkm (nama_usaha, slug, nama_pemilik, alamat_lengkap, deskripsi, kategori_id, tahun_berdiri, published)
SELECT
  'Kerupuk Ikan & Terasi Mina Karya',
  'kerupuk-ikan-terasi-mina-karya',
  'Kelompok Poklahsar Mina Karya',
  'Kawasan Pesisir Tambaklorok, Kelurahan Tanjung Mas, Semarang Utara',
  'Produk olahan hasil laut buatan kelompok ibu-ibu nelayan dan non-nelayan Tambaklorok, berdiri sejak 2010. Kerupuk ikan dan terasi khas racikan warga pesisir menjadi andalan kelompok ini, di samping ikan asin dan ikan segar.',
  (SELECT id FROM public.kategori_umkm WHERE nama = 'Makanan'),
  '2010',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.umkm WHERE slug = 'kerupuk-ikan-terasi-mina-karya');

INSERT INTO public.umkm (nama_usaha, slug, nama_pemilik, alamat_lengkap, deskripsi, kategori_id, tahun_berdiri, published)
SELECT
  'Bandeng Duri Lunak Mina Karya',
  'bandeng-duri-lunak-mina-karya',
  'Kelompok Poklahsar Mina Karya',
  'Kawasan Pesisir Tambaklorok, Kelurahan Tanjung Mas, Semarang Utara',
  'Olahan bandeng presto duri lunak dari Poklahsar Mina Karya, kelompok usaha perempuan pesisir Tambaklorok yang berdiri sejak 2010 dan kini beranggotakan 25 orang.',
  (SELECT id FROM public.kategori_umkm WHERE nama = 'Makanan'),
  '2010',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.umkm WHERE slug = 'bandeng-duri-lunak-mina-karya');

INSERT INTO public.umkm (nama_usaha, slug, nama_pemilik, alamat_lengkap, deskripsi, kategori_id, tahun_berdiri, published)
SELECT
  'Teri Krispi & Mangrove Krispi Mina Karya',
  'teri-krispi-mangrove-krispi-mina-karya',
  'Kelompok Poklahsar Mina Karya',
  'Kawasan Pesisir Tambaklorok, Kelurahan Tanjung Mas, Semarang Utara',
  'Camilan kering hasil inovasi Poklahsar Mina Karya berupa teri krispi, teri balado, dan mangrove krispi — pemanfaatan hasil laut dan tanaman mangrove sekitar Tambaklorok menjadi kudapan bernilai jual.',
  (SELECT id FROM public.kategori_umkm WHERE nama = 'Makanan'),
  '2010',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.umkm WHERE slug = 'teri-krispi-mangrove-krispi-mina-karya');

INSERT INTO public.umkm (nama_usaha, slug, nama_pemilik, alamat_lengkap, deskripsi, kategori_id, published)
SELECT
  'Olahan Ikan Srikandi Cipta Bahari',
  'olahan-ikan-srikandi-cipta-bahari',
  'Kelompok Srikandi Cipta Bahari',
  'Kawasan Pesisir Tambaklorok, Kelurahan Tanjung Mas, Semarang Utara',
  'Kelompok usaha masyarakat pesisir Tambaklorok yang mengembangkan beragam produk olahan berbahan dasar ikan. Sejak Mei 2026, kelompok ini mendapat pendampingan kemasan dan pemasaran digital dari tim pengabdian Universitas Muhammadiyah Purwokerto untuk menembus pasar oleh-oleh modern.',
  (SELECT id FROM public.kategori_umkm WHERE nama = 'Makanan'),
  true
WHERE NOT EXISTS (SELECT 1 FROM public.umkm WHERE slug = 'olahan-ikan-srikandi-cipta-bahari');

-- ---------------------------------------------------------------------------
-- 4. Berita
-- Sumber: halosemarang.id & sindonews.com (kunjungan Wali Kota Agustina ke
-- Tambak Lorok, Juli 2026), rmol.id & beritajateng.id (Sedekah Laut,
-- Mei 2026), radarbanyumas.disway.id (pendampingan UMKM UMP, Mei 2026),
-- tanjungmas.semarangkota.go.id (peresmian Pasar Tambak Mulyo, Maret 2019).
-- ---------------------------------------------------------------------------
INSERT INTO public.berita (judul, slug, konten, kategori_id, status, penulis, tanggal_publikasi)
SELECT
  'Pemkot Siapkan Penanganan Darurat Rob di Tambak Lorok',
  'pemkot-siapkan-penanganan-darurat-rob-di-tambak-lorok',
  'Wali Kota Semarang, Agustina Wilujeng, meninjau langsung kawasan Tambak Lorok, Kelurahan Tanjung Mas, menyusul retaknya struktur sheet pile yang memicu genangan rob di permukiman warga. Pemerintah Kota Semarang menyiapkan penanganan darurat berupa pemasangan tanggul karung pasir sementara serta normalisasi saluran air di sekitar permukiman. Warga dan RT/RW diminta turut membantu proses pembukaan kembali saluran yang sempat tertutup agar aliran air ke laut lebih lancar. Penanganan ini merupakan bagian dari upaya berkelanjutan Pemkot Semarang menekan dampak rob di kawasan pesisir, setelah sebelumnya membangun sistem pengendalian banjir tahap II berupa dua kolam retensi seluas 20,59 hektare, enam pompa berkapasitas 500 liter/detik, saluran kolektor sepanjang 1.062 meter, dan tanggul laut sepanjang 2.120 meter yang melindungi sekitar 55 hektare permukiman dan 2.250 rumah warga.',
  (SELECT id FROM public.kategori_berita WHERE nama = 'Pembangunan'),
  'Terpublikasi',
  'Admin Utama',
  '2026-07-09'
WHERE NOT EXISTS (SELECT 1 FROM public.berita WHERE slug = 'pemkot-siapkan-penanganan-darurat-rob-di-tambak-lorok');

INSERT INTO public.berita (judul, slug, konten, kategori_id, status, penulis, tanggal_publikasi)
SELECT
  'Sedekah Laut Tambaklorok: Wujud Syukur Nelayan dan Jaga Kelestarian Laut',
  'sedekah-laut-tambaklorok-wujud-syukur-nelayan-dan-jaga-kelestarian-laut',
  'Ratusan nelayan Tambaklorok menggelar prosesi Sedekah Laut, tradisi tahunan yang telah berlangsung sejak 1985 sebagai ungkapan syukur atas hasil tangkapan ikan sepanjang tahun sekaligus doa keselamatan bagi para nelayan. Prosesi diawali dengan tahlil, pembacaan Al-Qur''an, dan istighosah, sebelum sesaji berupa kepala kerbau dan hasil bumi diarak dari masjid menuju Tempat Pelelangan Ikan (TPI) Tambaklorok untuk kemudian dilarung ke laut. Ratusan kapal nelayan turut memeriahkan prosesi ini, diikuti pergelaran wayang kulit dan pengajian akbar. Tradisi ini dipercaya menjaga keseimbangan antara manusia dan alam, sekaligus melestarikan biota laut dan mempererat kebersamaan warga pesisir.',
  (SELECT id FROM public.kategori_berita WHERE nama = 'Budaya'),
  'Terpublikasi',
  'Admin Utama',
  '2026-05-12'
WHERE NOT EXISTS (SELECT 1 FROM public.berita WHERE slug = 'sedekah-laut-tambaklorok-wujud-syukur-nelayan-dan-jaga-kelestarian-laut');

INSERT INTO public.berita (judul, slug, konten, kategori_id, status, penulis, tanggal_publikasi)
SELECT
  'UMKM Olahan Ikan Tambaklorok Dapat Pendampingan Kemasan dari Tim UMP',
  'umkm-olahan-ikan-tambaklorok-dapat-pendampingan-kemasan-dari-tim-ump',
  'Tim pengabdian dari Universitas Muhammadiyah Purwokerto (UMP) mendampingi pelaku UMKM olahan ikan di kawasan pesisir Tambaklorok, termasuk kelompok usaha Srikandi Cipta Bahari, untuk meningkatkan daya saing produk. Pendampingan difokuskan pada perbaikan kemasan, standarisasi teknologi pangan agar produk lebih tahan lama, serta pengembangan pemasaran digital melalui media sosial dan marketplace. Selama ini banyak produk olahan ikan Tambaklorok memiliki rasa juara namun terkendala kemasan yang kurang menarik sehingga sulit menembus pusat oleh-oleh modern. Melalui program ini, pelaku UMKM diharapkan mampu memperluas pasar hingga ke luar Semarang.',
  (SELECT id FROM public.kategori_berita WHERE nama = 'UMKM'),
  'Terpublikasi',
  'Admin Utama',
  '2026-05-25'
WHERE NOT EXISTS (SELECT 1 FROM public.berita WHERE slug = 'umkm-olahan-ikan-tambaklorok-dapat-pendampingan-kemasan-dari-tim-ump');

INSERT INTO public.berita (judul, slug, konten, kategori_id, status, penulis, tanggal_publikasi)
SELECT
  'Pasar Tambak Mulyo Resmi Beroperasi, Dorong Ekonomi Nelayan Tanjung Mas',
  'pasar-tambak-mulyo-resmi-beroperasi-dorong-ekonomi-nelayan-tanjung-mas',
  'Wali Kota Semarang meresmikan Pasar Tambak Mulyo yang berlokasi di RW 14, Kelurahan Tanjung Mas, sebagai pusat jual beli ikan segar dan kebutuhan sehari-hari bagi warga pesisir Tambaklorok. Kehadiran pasar ini diharapkan mendorong perputaran ekonomi nelayan setempat sekaligus merapikan aktivitas jual beli ikan yang sebelumnya berlangsung di pinggir jalan. Hingga kini, pasar tersebut terus berkembang menjadi salah satu pusat grosir ikan segar terkenal di Kota Semarang, didukung kedekatannya dengan tempat pelelangan ikan dan dermaga nelayan.',
  (SELECT id FROM public.kategori_berita WHERE nama = 'Acara'),
  'Terpublikasi',
  'Admin Utama',
  '2019-03-25'
WHERE NOT EXISTS (SELECT 1 FROM public.berita WHERE slug = 'pasar-tambak-mulyo-resmi-beroperasi-dorong-ekonomi-nelayan-tanjung-mas');
