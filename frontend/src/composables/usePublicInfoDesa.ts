import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Festival, Pengumuman } from '@/types/infoDesa'

/** Isi sidebar halaman Berita: pengumuman terbaru + festival yang akan datang. */
export function usePublicInfoDesa() {
  const pengumuman = ref<Pengumuman[]>([])
  const festival = ref<Festival[]>([])
  const loading = ref(true)

  async function fetchAll() {
    loading.value = true

    // Kalender hanya menampilkan acara yang belum lewat; acara kemarin tidak
    // berguna bagi pengunjung dan hanya mendorong acara berikutnya keluar daftar.
    const hariIni = new Date().toISOString().slice(0, 10)

    const [pengumumanRes, festivalRes] = await Promise.all([
      supabase
        .from('pengumuman')
        .select('id, judul, isi, tingkat, published, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('festival')
        .select('id, nama, tanggal, lokasi, published')
        .eq('published', true)
        .gte('tanggal', hariIni)
        .order('tanggal', { ascending: true })
        .limit(5),
    ])

    pengumuman.value = (pengumumanRes.data ?? []) as Pengumuman[]
    festival.value = (festivalRes.data ?? []) as Festival[]
    loading.value = false
  }

  return { pengumuman, festival, loading, fetchAll }
}
