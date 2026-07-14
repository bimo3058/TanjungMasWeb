import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Wisata, WisataDetail } from '@/types/wisata'
import type { Umkm, UmkmDetail } from '@/types/umkm'
import type { Berita, BeritaDetail } from '@/types/berita'

interface CatalogConfig {
  table: string
  select: string
  searchColumn: string
  publishedColumn: string
  publishedValue: string | boolean
  orderColumn?: string
}

function usePublicCatalog<T>(config: CatalogConfig) {
  const { table, select, searchColumn, publishedColumn, publishedValue, orderColumn = 'created_at' } = config

  const items = ref<T[]>([])
  const loading = ref(true)
  const error = ref('')

  async function fetchList(search = '', kategoriId = '') {
    loading.value = true
    let query = supabase
      .from(table)
      .select(select)
      .eq(publishedColumn, publishedValue)
      .order(orderColumn, { ascending: false, nullsFirst: false })

    if (search) query = query.ilike(searchColumn, `%${search}%`)
    if (kategoriId) query = query.eq('kategori_id', kategoriId)

    const { data, error: fetchError } = await query

    // Query yang gagal (mis. kolom baru belum ter-migrate) sebelumnya ditelan
    // diam-diam dan tampil sebagai daftar kosong — seolah datanya yang tidak ada.
    // Bedakan keduanya supaya kegagalan nyata tidak menyamar jadi "belum ada isi".
    error.value = fetchError ? fetchError.message : ''
    items.value = (data ?? []) as unknown as T[]
    loading.value = false
  }

  return { items, loading, error, fetchList }
}

export function usePublicWisata() {
  return usePublicCatalog<Wisata>({
    table: 'wisata',
    select: 'id, nama, slug, deskripsi, gambar_utama, alamat_lengkap, harga_tiket, jam_operasional, kategori_wisata(nama)',
    searchColumn: 'nama',
    publishedColumn: 'published',
    publishedValue: true,
  })
}

export function usePublicUmkm() {
  return usePublicCatalog<Umkm>({
    table: 'umkm',
    select: 'id, nama_usaha, slug, deskripsi, gambar_utama, alamat_lengkap, kategori_umkm(nama)',
    searchColumn: 'nama_usaha',
    publishedColumn: 'published',
    publishedValue: true,
  })
}

export function usePublicBerita() {
  return usePublicCatalog<Berita>({
    table: 'berita',
    select: 'id, judul, slug, konten, gambar_utama, tanggal_publikasi, sorotan, kategori_berita(nama)',
    searchColumn: 'judul',
    publishedColumn: 'status',
    publishedValue: 'Terpublikasi',
    orderColumn: 'tanggal_publikasi',
  })
}

/**
 * Query detail selalu menyertakan filter published/status secara eksplisit.
 * RLS anon sudah menutup baris yang belum terbit, tetapi admin yang sedang login
 * melewati policy itu — tanpa filter ini ia akan melihat draft dari sisi publik
 * dan mengira konten yang belum siap sudah tayang.
 */
export async function fetchWisataBySlug(slug: string): Promise<WisataDetail | null> {
  const { data } = await supabase
    .from('wisata')
    .select(
      'id, nama, slug, deskripsi, gambar_utama, alamat_lengkap, harga_tiket, jam_operasional, lokasi_maps_url, kategori_wisata(nama), galeri_wisata(id, url_gambar)',
    )
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  return (data as unknown as WisataDetail | null) ?? null
}

/**
 * Konten lain untuk bagian "Lainnya" di dasar halaman detail — supaya pembaca
 * yang selesai membaca punya tujuan berikutnya, bukan buntu.
 */
export async function fetchBeritaLainnya(excludeId: string, limit = 3): Promise<Berita[]> {
  const { data } = await supabase
    .from('berita')
    .select('id, judul, slug, konten, gambar_utama, tanggal_publikasi, sorotan, kategori_berita(nama)')
    .eq('status', 'Terpublikasi')
    .neq('id', excludeId)
    .order('tanggal_publikasi', { ascending: false, nullsFirst: false })
    .limit(limit)

  return (data ?? []) as unknown as Berita[]
}

export async function fetchWisataLainnya(excludeId: string, limit = 4): Promise<Wisata[]> {
  const { data } = await supabase
    .from('wisata')
    .select(
      'id, nama, slug, deskripsi, gambar_utama, alamat_lengkap, harga_tiket, jam_operasional, kategori_wisata(nama)',
    )
    .eq('published', true)
    .neq('id', excludeId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as unknown as Wisata[]
}

export async function fetchUmkmLainnya(excludeId: string, limit = 3): Promise<Umkm[]> {
  const { data } = await supabase
    .from('umkm')
    .select('id, nama_usaha, slug, deskripsi, gambar_utama, alamat_lengkap, kategori_umkm(nama)')
    .eq('published', true)
    .neq('id', excludeId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as unknown as Umkm[]
}

export async function fetchUmkmBySlug(slug: string): Promise<UmkmDetail | null> {
  const { data } = await supabase
    .from('umkm')
    .select(
      'id, nama_usaha, slug, deskripsi, gambar_utama, alamat_lengkap, nama_pemilik, nomor_telepon, jam_operasional, tahun_berdiri, status_izin, kategori_umkm(nama), galeri_umkm(id, url_gambar)',
    )
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  return (data as unknown as UmkmDetail | null) ?? null
}

export async function fetchBeritaBySlug(slug: string): Promise<BeritaDetail | null> {
  const { data } = await supabase
    .from('berita')
    .select(
      'id, judul, slug, konten, gambar_utama, penulis, tanggal_publikasi, sorotan, kategori_berita(nama)',
    )
    .eq('slug', slug)
    .eq('status', 'Terpublikasi')
    .maybeSingle()

  return (data as unknown as BeritaDetail | null) ?? null
}
