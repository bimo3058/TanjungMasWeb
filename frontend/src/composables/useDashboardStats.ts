import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'

export interface ActivityItem {
  id: string
  title: string
  source: 'Wisata' | 'UMKM' | 'Berita'
  status: string
  statusVariant: 'accent' | 'category'
  updatedAt: string
}

export function useDashboardStats() {
  const totalWisata = ref(0)
  const totalBerita = ref(0)
  const totalUmkm = ref(0)
  const totalDraft = ref(0)
  const activity = ref<ActivityItem[]>([])
  const loading = ref(true)

  onMounted(async () => {
    const [
      wisataCount,
      beritaCount,
      umkmCount,
      wisataDraftCount,
      umkmDraftCount,
      beritaDraftCount,
      wisataRecent,
      umkmRecent,
      beritaRecent,
    ] = await Promise.all([
      supabase.from('wisata').select('*', { count: 'exact', head: true }),
      supabase.from('berita').select('*', { count: 'exact', head: true }),
      supabase.from('umkm').select('*', { count: 'exact', head: true }),
      supabase.from('wisata').select('*', { count: 'exact', head: true }).eq('published', false),
      supabase.from('umkm').select('*', { count: 'exact', head: true }).eq('published', false),
      supabase.from('berita').select('*', { count: 'exact', head: true }).neq('status', 'Terpublikasi'),
      supabase
        .from('wisata')
        .select('id, nama, published, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5),
      supabase
        .from('umkm')
        .select('id, nama_usaha, published, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5),
      supabase
        .from('berita')
        .select('id, judul, status, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5),
    ])

    totalWisata.value = wisataCount.count ?? 0
    totalBerita.value = beritaCount.count ?? 0
    totalUmkm.value = umkmCount.count ?? 0
    totalDraft.value =
      (wisataDraftCount.count ?? 0) + (umkmDraftCount.count ?? 0) + (beritaDraftCount.count ?? 0)

    const items: ActivityItem[] = []

    for (const row of wisataRecent.data ?? []) {
      const r = row as { id: string; nama: string; published: boolean; updated_at: string }
      items.push({
        id: r.id,
        title: r.nama,
        source: 'Wisata',
        status: r.published ? 'Dipublikasikan' : 'Draft',
        statusVariant: r.published ? 'accent' : 'category',
        updatedAt: r.updated_at,
      })
    }

    for (const row of umkmRecent.data ?? []) {
      const r = row as { id: string; nama_usaha: string; published: boolean; updated_at: string }
      items.push({
        id: r.id,
        title: r.nama_usaha,
        source: 'UMKM',
        status: r.published ? 'Dipublikasikan' : 'Draft',
        statusVariant: r.published ? 'accent' : 'category',
        updatedAt: r.updated_at,
      })
    }

    for (const row of beritaRecent.data ?? []) {
      const r = row as { id: string; judul: string; status: string; updated_at: string }
      items.push({
        id: r.id,
        title: r.judul,
        source: 'Berita',
        status: r.status,
        statusVariant: r.status === 'Terpublikasi' ? 'accent' : 'category',
        updatedAt: r.updated_at,
      })
    }

    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    activity.value = items.slice(0, 5)
    loading.value = false
  })

  return { totalWisata, totalBerita, totalUmkm, totalDraft, activity, loading }
}
