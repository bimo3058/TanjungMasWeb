import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { ensureUniqueSlug } from '@/utils/uniqueSlug'
import { slugify } from '@/utils/slugify'
import type { WisataRow } from '@/types/wisata'
import type { GaleriFoto } from '@/types/galeri'

export interface WisataListItem extends WisataRow {
  kategori_wisata: { nama: string } | null
}

export function useAdminWisataList() {
  const items = ref<WisataListItem[]>([])
  const loading = ref(true)
  const error = ref('')

  async function fetchList(search = '', kategoriId = '') {
    loading.value = true
    let query = supabase
      .from('wisata')
      .select('*, kategori_wisata(nama)')
      .order('updated_at', { ascending: false })

    if (search) query = query.ilike('nama', `%${search}%`)
    if (kategoriId) query = query.eq('kategori_id', kategoriId)

    const { data, error: fetchError } = await query
    if (fetchError) {
      error.value = fetchError.message
    } else {
      items.value = (data ?? []) as unknown as WisataListItem[]
    }
    loading.value = false
  }

  async function togglePublished(id: string, published: boolean) {
    await supabase.from('wisata').update({ published }).eq('id', id)
    const item = items.value.find((i) => i.id === id)
    if (item) item.published = published
  }

  async function remove(id: string) {
    await supabase.from('galeri_wisata').delete().eq('wisata_id', id)
    await supabase.from('wisata').delete().eq('id', id)
    items.value = items.value.filter((i) => i.id !== id)
  }

  return { items, loading, error, fetchList, togglePublished, remove }
}

export interface WisataFormValues {
  nama: string
  deskripsi: string
  gambar_utama: string | null
  kategori_id: string | null
  lokasi_maps_url: string
  alamat_lengkap: string
  jam_operasional: string
  harga_tiket: string
  published: boolean
}

export async function getWisataById(
  id: string,
): Promise<{ row: WisataRow; gallery: GaleriFoto[] } | null> {
  const [{ data: row }, { data: gallery }] = await Promise.all([
    supabase.from('wisata').select('*').eq('id', id).maybeSingle(),
    supabase.from('galeri_wisata').select('id, url_gambar').eq('wisata_id', id),
  ])
  if (!row) return null
  return { row: row as WisataRow, gallery: (gallery ?? []) as GaleriFoto[] }
}

export async function saveWisata(
  values: WisataFormValues,
  gallery: GaleriFoto[],
  existing?: { id: string; originalGallery: GaleriFoto[] },
): Promise<string> {
  const baseSlug = slugify(values.nama)
  const slug = await ensureUniqueSlug('wisata', baseSlug, existing?.id)

  let id: string
  if (existing) {
    id = existing.id
    const { error } = await supabase
      .from('wisata')
      .update({ ...values, slug })
      .eq('id', id)
    if (error) throw error
  } else {
    const { data, error } = await supabase
      .from('wisata')
      .insert({ ...values, slug })
      .select('id')
      .single()
    if (error) throw error
    id = (data as { id: string }).id
  }

  const originalIds = new Set((existing?.originalGallery ?? []).map((g) => g.id))
  const currentIds = new Set(gallery.filter((g) => g.id).map((g) => g.id))
  const toDelete = [...originalIds].filter((gid) => !currentIds.has(gid))
  const toInsert = gallery.filter((g) => !g.id)

  if (toDelete.length > 0) {
    await supabase.from('galeri_wisata').delete().in('id', toDelete)
  }
  if (toInsert.length > 0) {
    await supabase
      .from('galeri_wisata')
      .insert(toInsert.map((g) => ({ wisata_id: id, url_gambar: g.url_gambar })))
  }

  return id
}
