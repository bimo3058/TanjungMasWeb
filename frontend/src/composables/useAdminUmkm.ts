import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { ensureUniqueSlug } from '@/utils/uniqueSlug'
import { slugify } from '@/utils/slugify'
import { useImageUpload } from '@/composables/useImageUpload' // 1. Import composable uploader
import type { UmkmRow } from '@/types/umkm'
import type { GaleriFoto } from '@/types/galeri'

export interface UmkmListItem extends UmkmRow {
  kategori_umkm: { nama: string } | null
}

export function useAdminUmkmList() {
  const items = ref<UmkmListItem[]>([])
  const loading = ref(true)
  const error = ref('')
  
  // 2. Inisialisasi fungsi deleteImage
  const { deleteImage } = useImageUpload() 

  async function fetchList(search = '', kategoriId = '') {
    loading.value = true
    let query = supabase
      .from('umkm')
      .select('*, kategori_umkm(nama)')
      .order('updated_at', { ascending: false })

    if (search) query = query.ilike('nama_usaha', `%${search}%`)
    if (kategoriId) query = query.eq('kategori_id', kategoriId)

    const { data, error: fetchError } = await query
    if (fetchError) {
      error.value = fetchError.message
    } else {
      items.value = (data ?? []) as unknown as UmkmListItem[]
    }
    loading.value = false
  }

  async function togglePublished(id: string, published: boolean) {
    await supabase.from('umkm').update({ published }).eq('id', id)
    const item = items.value.find((i) => i.id === id)
    if (item) item.published = published
  }

  async function remove(id: string) {
    // 3. AMBIL URL GAMBAR SEBELUM DIHAPUS DARI DB
    const { data: umkm } = await supabase.from('umkm').select('gambar_utama').eq('id', id).single()
    const { data: galeri } = await supabase.from('galeri_umkm').select('url_gambar').eq('umkm_id', id)

    // 4. HAPUS GAMBAR FISIK DARI STORAGE
    if (umkm?.gambar_utama) {
      await deleteImage(umkm.gambar_utama)
    }
    
    if (galeri && galeri.length > 0) {
      for (const item of galeri) {
        if (item.url_gambar) {
          await deleteImage(item.url_gambar)
        }
      }
    }

    // 5. BARU HAPUS DARI DATABASE
    await supabase.from('galeri_umkm').delete().eq('umkm_id', id)
    await supabase.from('umkm').delete().eq('id', id)
    items.value = items.value.filter((i) => i.id !== id)
  }

  return { items, loading, error, fetchList, togglePublished, remove }
}

export interface UmkmFormValues {
  nama_usaha: string
  nama_pemilik: string
  nomor_telepon: string
  alamat_lengkap: string
  deskripsi: string
  gambar_utama: string | null
  kategori_id: string | null
  jam_operasional: string
  tahun_berdiri: string
  status_izin: string
  published: boolean
}

export async function getUmkmById(
  id: string,
): Promise<{ row: UmkmRow; gallery: GaleriFoto[] } | null> {
  const [{ data: row }, { data: gallery }] = await Promise.all([
    supabase.from('umkm').select('*').eq('id', id).maybeSingle(),
    supabase.from('galeri_umkm').select('id, url_gambar').eq('umkm_id', id),
  ])
  if (!row) return null
  return { row: row as UmkmRow, gallery: (gallery ?? []) as GaleriFoto[] }
}

export async function saveUmkm(
  values: UmkmFormValues,
  gallery: GaleriFoto[],
  existing?: { id: string; originalGallery: GaleriFoto[] },
): Promise<string> {
  const { deleteImage } = useImageUpload() // Panggil composable
  const baseSlug = slugify(values.nama_usaha)
  const slug = await ensureUniqueSlug('umkm', baseSlug, existing?.id)

  let id: string
  if (existing) {
    id = existing.id
    
    // 6. CEK JIKA GAMBAR UTAMA DIGANTI, HAPUS GAMBAR LAMA
    const { data: oldUmkm } = await supabase.from('umkm').select('gambar_utama').eq('id', id).single()
    if (oldUmkm?.gambar_utama && oldUmkm.gambar_utama !== values.gambar_utama) {
      await deleteImage(oldUmkm.gambar_utama)
    }

    const { error } = await supabase
      .from('umkm')
      .update({ ...values, slug })
      .eq('id', id)
    if (error) throw error
  } else {
    const { data, error } = await supabase
      .from('umkm')
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
    // 7. HAPUS GAMBAR GALERI DARI STORAGE SEBELUM HAPUS DARI DB
    const deletedGalleryItems = (existing?.originalGallery ?? []).filter(g => toDelete.includes(g.id))
    for (const item of deletedGalleryItems) {
      if (item.url_gambar) {
        await deleteImage(item.url_gambar)
      }
    }
    
    await supabase.from('galeri_umkm').delete().in('id', toDelete)
  }
  if (toInsert.length > 0) {
    await supabase
      .from('galeri_umkm')
      .insert(toInsert.map((g) => ({ umkm_id: id, url_gambar: g.url_gambar })))
  }

  return id
}