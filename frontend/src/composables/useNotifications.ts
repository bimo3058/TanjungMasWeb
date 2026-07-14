import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase'

export type NotifikasiTipe =
  | 'konten_baru'
  | 'konten_diubah'
  | 'konten_dihapus'
  | 'draf'
  | 'pengguna_baru'
  | 'sistem'

export type NotifikasiSeverity = 'info' | 'peringatan' | 'kritis'

export interface NotifikasiItem {
  id: string
  tipe: NotifikasiTipe
  severity: NotifikasiSeverity
  judul: string
  pesan: string | null
  sumber: string | null
  entitas_id: string | null
  created_at: string
  dibaca: boolean
}

/** Rute tujuan saat notifikasi diklik. `null` = tidak ada tujuan (mis. alert sistem). */
export function notifikasiTarget(item: NotifikasiItem): RouteLocationRaw | null {
  if (item.sumber === 'profiles') return { name: 'admin-pengguna' }

  const routes: Record<string, { list: string; edit: string }> = {
    wisata: { list: 'admin-wisata', edit: 'admin-wisata-edit' },
    umkm: { list: 'admin-umkm', edit: 'admin-umkm-edit' },
    berita: { list: 'admin-berita', edit: 'admin-berita-edit' },
  }
  const route = item.sumber ? routes[item.sumber] : undefined
  if (!route) return null

  // Baris yang sudah dihapus tidak punya entitas_id — arahkan ke daftarnya saja.
  return item.entitas_id
    ? { name: route.edit, params: { id: item.entitas_id } }
    : { name: route.list }
}

export function useNotifications() {
  const items = ref<NotifikasiItem[]>([])
  const unread = ref(0)
  const loading = ref(false)
  const error = ref('')

  async function fetchAll() {
    loading.value = true
    error.value = ''
    const [list, count] = await Promise.all([
      supabase.rpc('notifikasi_list', { batas: 20 }),
      supabase.rpc('notifikasi_belum_dibaca'),
    ])
    if (list.error) error.value = list.error.message
    else items.value = (list.data ?? []) as NotifikasiItem[]
    if (!count.error) unread.value = (count.data as number) ?? 0
    loading.value = false
  }

  async function markAllRead() {
    if (unread.value === 0) return
    const snapshot = items.value.map((i) => ({ ...i }))
    const prevUnread = unread.value

    // Optimistis: badge langsung padam, dikembalikan bila server menolak.
    items.value = items.value.map((i) => ({ ...i, dibaca: true }))
    unread.value = 0

    const { error: rpcError } = await supabase.rpc('notifikasi_tandai_dibaca', { ids: null })
    if (rpcError) {
      items.value = snapshot
      unread.value = prevUnread
      error.value = rpcError.message
    }
  }

  async function markRead(id: string) {
    const item = items.value.find((i) => i.id === id)
    if (!item || item.dibaca) return

    item.dibaca = true
    unread.value = Math.max(0, unread.value - 1)

    const { error: rpcError } = await supabase.rpc('notifikasi_tandai_dibaca', { ids: [id] })
    if (rpcError) {
      error.value = rpcError.message
      await fetchAll()
    }
  }

  // Realtime bersifat opsional: kalau publication belum aktif, channel tidak
  // pernah memicu apa-apa dan panel tetap benar karena fetchAll() dipanggil
  // tiap kali laci notifikasi dibuka.
  let channel: RealtimeChannel | null = null

  onMounted(() => {
    fetchAll()
    channel = supabase
      .channel('notifikasi-admin')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifikasi' },
        () => fetchAll(),
      )
      .subscribe()
  })

  onBeforeUnmount(() => {
    if (channel) supabase.removeChannel(channel)
  })

  return { items, unread, loading, error, fetchAll, markAllRead, markRead }
}
