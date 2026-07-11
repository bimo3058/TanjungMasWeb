export interface ProfilDesa {
  nama_desa: string | null
  sejarah_asal_usul: string | null
  deskripsi_singkat: string | null
  alamat_kantor: string | null
  kontak_email: string | null
  kontak_telepon: string | null
  gambar_profil: string | null
  hero_eyebrow: string | null
  hero_title: string | null
  hero_lead: string | null
  hero_image: string | null
}

export interface ProfilDesaRow extends ProfilDesa {
  id: number
  updated_at: string | null
}
