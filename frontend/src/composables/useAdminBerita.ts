import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { ensureUniqueSlug } from '@/utils/uniqueSlug'
import { slugify } from '@/utils/slugify'
import type { BeritaRow } from '@/types/berita'
import { removePublicMedia } from '@/utils/storageMedia'

export interface BeritaListItem extends BeritaRow {
  kategori_berita: { nama: string } | null
}

export function useAdminBeritaList() {
  const items = ref<BeritaListItem[]>([])
  const loading = ref(true)
  const error = ref('')

  async function fetchList(search = '', kategoriId = '') {
    loading.value = true
    let query = supabase
      .from('berita')
      .select('*, kategori_berita(nama)')
      .order('updated_at', { ascending: false })

    if (search) query = query.ilike('judul', `%${search}%`)
    if (kategoriId) query = query.eq('kategori_id', kategoriId)

    const { data, error: fetchError } = await query
    if (fetchError) {
      error.value = fetchError.message
    } else {
      items.value = (data ?? []) as unknown as BeritaListItem[]
    }
    loading.value = false
  }

  async function toggleStatus(id: string, publish: boolean) {
    const item = items.value.find((i) => i.id === id)
    const status = publish ? 'Terpublikasi' : 'Draft'
    const updates: { status: string; tanggal_publikasi?: string } = { status }
    if (publish && item && !item.tanggal_publikasi) {
      updates.tanggal_publikasi = new Date().toISOString()
    }
    await supabase.from('berita').update(updates).eq('id', id)
    if (item) {
      item.status = status
      if (updates.tanggal_publikasi) item.tanggal_publikasi = updates.tanggal_publikasi
    }
  }

  async function remove(id: string) {
    const { data, error: fetchError } = await supabase
      .from('berita')
      .select('gambar_utama')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError

    const { error: deleteError } = await supabase.from('berita').delete().eq('id', id)
    if (deleteError) throw deleteError
    await removePublicMedia([data.gambar_utama])
    items.value = items.value.filter((i) => i.id !== id)
  }

  return { items, loading, error, fetchList, toggleStatus, remove }
}

export interface BeritaFormValues {
  judul: string
  konten: string
  gambar_utama: string | null
  kategori_id: string | null
  status: string
  penulis: string
  tanggal_publikasi: string | null
  sorotan: boolean
}

export async function getBeritaById(id: string): Promise<BeritaRow | null> {
  const { data } = await supabase.from('berita').select('*').eq('id', id).maybeSingle()
  return data as BeritaRow | null
}

export async function getDefaultPenulis(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'Admin Utama'

  const { data } = await supabase
    .from('profiles')
    .select('nama_lengkap')
    .eq('id', user.id)
    .maybeSingle()

  return (data as { nama_lengkap: string | null } | null)?.nama_lengkap || 'Admin Utama'
}

export async function saveBerita(values: BeritaFormValues, existingId?: string): Promise<string> {
  const baseSlug = slugify(values.judul)
  const slug = await ensureUniqueSlug('berita', baseSlug, existingId)

  const tanggal_publikasi =
    values.status === 'Terpublikasi' && !values.tanggal_publikasi
      ? new Date().toISOString()
      : values.tanggal_publikasi

  const payload = { ...values, tanggal_publikasi, slug }

  if (existingId) {
    const { data: oldRow, error: oldRowError } = await supabase
      .from('berita')
      .select('gambar_utama')
      .eq('id', existingId)
      .single()
    if (oldRowError) throw oldRowError
    const { error } = await supabase.from('berita').update(payload).eq('id', existingId)
    if (error) throw error
    if (oldRow.gambar_utama !== values.gambar_utama) {
      await removePublicMedia([oldRow.gambar_utama])
    }
    return existingId
  }

  const { data, error } = await supabase.from('berita').insert(payload).select('id').single()
  if (error) throw error
  return (data as { id: string }).id
}
