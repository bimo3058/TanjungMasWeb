import type { KategoriRef } from './kategori'

export interface Wisata {
  id: string
  nama: string
  slug: string
  deskripsi: string | null
  gambar_utama: string | null
  alamat_lengkap: string | null
  kategori_wisata: KategoriRef | null
}
