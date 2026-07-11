import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Kategori } from '@/types/kategori'

export type KategoriTable = 'kategori_wisata' | 'kategori_umkm' | 'kategori_berita'

export function useCategories(table: KategoriTable) {
  const categories = ref<Kategori[]>([])
  const loading = ref(true)

  onMounted(async () => {
    const { data } = await supabase.from(table).select('id, nama').order('nama')
    categories.value = (data ?? []) as Kategori[]
    loading.value = false
  })

  async function addCategory(nama: string): Promise<Kategori> {
    const { data, error } = await supabase.from(table).insert({ nama }).select('id, nama').single()
    if (error) throw error
    const kategori = data as Kategori
    categories.value.push(kategori)
    categories.value.sort((a, b) => a.nama.localeCompare(b.nama))
    return kategori
  }

  return { categories, loading, addCategory }
}
