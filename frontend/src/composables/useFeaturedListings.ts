import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Wisata } from '@/types/wisata'
import type { Umkm } from '@/types/umkm'
import type { Berita } from '@/types/berita'

interface FeaturedConfig {
  filterColumn?: string
  filterValue?: string | boolean
  orderColumn?: string
  limit?: number
}

function useFeatured<T>(table: string, select: string, config: FeaturedConfig = {}) {
  const {
    filterColumn = 'published',
    filterValue = true,
    orderColumn = 'created_at',
    limit = 3,
  } = config

  const items = ref<T[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    const { data, error: fetchError } = await supabase
      .from(table)
      .select(select)
      .eq(filterColumn, filterValue)
      .order(orderColumn, { ascending: false, nullsFirst: false })
      .limit(limit)

    if (fetchError) {
      error.value = fetchError.message
    } else {
      items.value = (data ?? []) as T[]
    }
    loading.value = false
  })

  return { items, loading, error }
}

export function useFeaturedWisata() {
  return useFeatured<Wisata>(
    'wisata',
    'id, nama, slug, deskripsi, gambar_utama, alamat_lengkap, harga_tiket, jam_operasional, kategori_wisata(nama)',
    { limit: 4 },
  )
}

export function useFeaturedUmkm() {
  return useFeatured<Umkm>(
    'umkm',
    'id, nama_usaha, slug, deskripsi, gambar_utama, alamat_lengkap, kategori_umkm(nama)',
    { limit: 4 },
  )
}

export function useFeaturedBerita() {
  return useFeatured<Berita>(
    'berita',
    'id, judul, slug, konten, gambar_utama, tanggal_publikasi, kategori_berita(nama)',
    { filterColumn: 'status', filterValue: 'Terpublikasi', orderColumn: 'tanggal_publikasi' },
  )
}
