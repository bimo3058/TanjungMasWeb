import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'

export function usePublicStats() {
  const totalWisata = ref(0)
  const totalUmkm = ref(0)
  const totalBerita = ref(0)
  const loading = ref(true)

  onMounted(async () => {
    const [wisataCount, umkmCount, beritaCount] = await Promise.all([
      supabase.from('wisata').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('umkm').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('berita').select('*', { count: 'exact', head: true }).eq('status', 'Terpublikasi'),
    ])

    totalWisata.value = wisataCount.count ?? 0
    totalUmkm.value = umkmCount.count ?? 0
    totalBerita.value = beritaCount.count ?? 0
    loading.value = false
  })

  return { totalWisata, totalUmkm, totalBerita, loading }
}
