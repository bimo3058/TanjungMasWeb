import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'
import type { ProfilDesa } from '@/types/profilDesa'

export function useProfilDesa() {
  const profil = ref<(ProfilDesa & { updated_at: string | null }) | null>(null)
  const loading = ref(true)

  onMounted(async () => {
    const { data } = await supabase
      .from('profil_desa')
      .select(
        'nama_desa, sejarah_asal_usul, deskripsi_singkat, alamat_kantor, kontak_email, kontak_telepon, gambar_profil, hero_eyebrow, hero_title, hero_lead, hero_image, updated_at',
      )
      .eq('id', 1)
      .maybeSingle()

    profil.value = data
    loading.value = false
  })

  return { profil, loading }
}
