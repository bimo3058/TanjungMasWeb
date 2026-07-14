import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Festival, Pengumuman, TingkatPengumuman } from '@/types/infoDesa'

export interface PengumumanFormValues {
  judul: string
  isi: string
  tingkat: TingkatPengumuman
}

export interface FestivalFormValues {
  nama: string
  tanggal: string
  lokasi: string
}

/**
 * Pengumuman & festival dikelola dari layar Manajemen Berita, bukan menu
 * tersendiri. Keduanya entitas kecil (3 kolom) sehingga tidak punya halaman
 * form terpisah — form-nya inline di panelnya masing-masing.
 */
export function useAdminPengumuman() {
  const items = ref<Pengumuman[]>([])
  const loading = ref(true)
  const saving = ref(false)

  async function fetchList() {
    loading.value = true
    const { data } = await supabase
      .from('pengumuman')
      .select('id, judul, isi, tingkat, published, created_at')
      .order('created_at', { ascending: false })
    items.value = (data ?? []) as Pengumuman[]
    loading.value = false
  }

  async function save(values: PengumumanFormValues, existingId?: string | null) {
    saving.value = true
    const payload = {
      judul: values.judul.trim(),
      isi: values.isi.trim() || null,
      tingkat: values.tingkat,
      updated_at: new Date().toISOString(),
    }

    const { error } = existingId
      ? await supabase.from('pengumuman').update(payload).eq('id', existingId)
      : await supabase.from('pengumuman').insert(payload)

    saving.value = false
    if (error) return { error: error.message }

    await fetchList()
    return { error: null }
  }

  async function togglePublished(id: string, published: boolean) {
    const item = items.value.find((i) => i.id === id)
    if (item) item.published = published
    await supabase.from('pengumuman').update({ published }).eq('id', id)
  }

  async function remove(id: string) {
    await supabase.from('pengumuman').delete().eq('id', id)
    items.value = items.value.filter((i) => i.id !== id)
  }

  return { items, loading, saving, fetchList, save, togglePublished, remove }
}

export function useAdminFestival() {
  const items = ref<Festival[]>([])
  const loading = ref(true)
  const saving = ref(false)

  async function fetchList() {
    loading.value = true
    // Acara terdekat di atas; yang sudah lewat ikut tampil di admin (berbeda
    // dari sidebar publik) supaya masih bisa disunting atau dihapus.
    const { data } = await supabase
      .from('festival')
      .select('id, nama, tanggal, lokasi, published')
      .order('tanggal', { ascending: false })
    items.value = (data ?? []) as Festival[]
    loading.value = false
  }

  async function save(values: FestivalFormValues, existingId?: string | null) {
    saving.value = true
    const payload = {
      nama: values.nama.trim(),
      tanggal: values.tanggal,
      lokasi: values.lokasi.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = existingId
      ? await supabase.from('festival').update(payload).eq('id', existingId)
      : await supabase.from('festival').insert(payload)

    saving.value = false
    if (error) return { error: error.message }

    await fetchList()
    return { error: null }
  }

  async function togglePublished(id: string, published: boolean) {
    const item = items.value.find((i) => i.id === id)
    if (item) item.published = published
    await supabase.from('festival').update({ published }).eq('id', id)
  }

  async function remove(id: string) {
    await supabase.from('festival').delete().eq('id', id)
    items.value = items.value.filter((i) => i.id !== id)
  }

  return { items, loading, saving, fetchList, save, togglePublished, remove }
}
