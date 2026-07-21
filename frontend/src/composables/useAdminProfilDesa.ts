import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'
import type { ProfilDesaRow } from '@/types/profilDesa'
import { removePublicMedia } from '@/utils/storageMedia'

export interface ProfilDesaForm {
  nama_desa: string
  sejarah_asal_usul: string
  deskripsi_singkat: string
  alamat_kantor: string
  kontak_email: string
  kontak_telepon: string
  gambar_profil: string | null
  hero_eyebrow: string
  hero_title: string
  hero_lead: string
  hero_image: string | null
}

export function useAdminProfilDesa() {
  let savedGambarProfil: string | null = null
  let savedHeroImage: string | null = null
  const profil = ref<ProfilDesaForm>({
    nama_desa: '',
    sejarah_asal_usul: '',
    deskripsi_singkat: '',
    alamat_kantor: '',
    kontak_email: '',
    kontak_telepon: '',
    gambar_profil: null,
    hero_eyebrow: '',
    hero_title: '',
    hero_lead: '',
    hero_image: null,
  })
  const loading = ref(true)
  const saving = ref(false)
  const error = ref('')
  const updatedAt = ref<string | null>(null)

  onMounted(async () => {
    const { data } = await supabase.from('profil_desa').select('*').eq('id', 1).maybeSingle()
    if (data) {
      const row = data as ProfilDesaRow
      profil.value = {
        nama_desa: row.nama_desa ?? '',
        sejarah_asal_usul: row.sejarah_asal_usul ?? '',
        deskripsi_singkat: row.deskripsi_singkat ?? '',
        alamat_kantor: row.alamat_kantor ?? '',
        kontak_email: row.kontak_email ?? '',
        kontak_telepon: row.kontak_telepon ?? '',
        gambar_profil: row.gambar_profil,
        hero_eyebrow: row.hero_eyebrow ?? '',
        hero_title: row.hero_title ?? '',
        hero_lead: row.hero_lead ?? '',
        hero_image: row.hero_image,
      }
      updatedAt.value = row.updated_at
      savedGambarProfil = row.gambar_profil
      savedHeroImage = row.hero_image
    }
    loading.value = false
  })

  async function save(values: ProfilDesaForm) {
    saving.value = true
    error.value = ''
    try {
      const { data, error: saveError } = await supabase
        .from('profil_desa')
        .upsert({ id: 1, ...values })
        .select('updated_at')
        .single()
      if (saveError) throw saveError
      updatedAt.value = (data as { updated_at: string | null }).updated_at
      await removePublicMedia([
        savedGambarProfil !== values.gambar_profil ? savedGambarProfil : null,
        savedHeroImage !== values.hero_image ? savedHeroImage : null,
      ])
      savedGambarProfil = values.gambar_profil
      savedHeroImage = values.hero_image
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Gagal menyimpan profil desa.'
      throw err
    } finally {
      saving.value = false
    }
  }

  return { profil, loading, saving, error, updatedAt, save }
}
