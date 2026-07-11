import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Wisata } from '@/types/wisata'
import type { Umkm } from '@/types/umkm'
import type { Berita } from '@/types/berita'

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

  async function fetchList(search = '', kategoriId = '') {
    loading.value = true
    let query = supabase
      .from(table)
      .select(select)
      .eq(publishedColumn, publishedValue)
      .order(orderColumn, { ascending: false, nullsFirst: false })

    if (search) query = query.ilike(searchColumn, `%${search}%`)
    if (kategoriId) query = query.eq('kategori_id', kategoriId)

    const { data } = await query
    items.value = (data ?? []) as unknown as T[]
    loading.value = false
  }

  return { items, loading, fetchList }
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
    select: 'id, judul, slug, konten, gambar_utama, tanggal_publikasi, kategori_berita(nama)',
    searchColumn: 'judul',
    publishedColumn: 'status',
    publishedValue: 'Terpublikasi',
    orderColumn: 'tanggal_publikasi',
  })
}
