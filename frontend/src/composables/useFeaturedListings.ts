import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Wisata } from '@/types/wisata'
import type { Umkm } from '@/types/umkm'

function useFeatured<T>(table: string, select: string) {
  const items = ref<T[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    const { data, error: fetchError } = await supabase
      .from(table)
      .select(select)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)

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
    'id, nama, slug, deskripsi, gambar_utama, alamat_lengkap, kategori_wisata(nama)',
  )
}

export function useFeaturedUmkm() {
  return useFeatured<Umkm>(
    'umkm',
    'id, nama_usaha, slug, deskripsi, gambar_utama, alamat_lengkap, kategori_umkm(nama)',
  )
}
