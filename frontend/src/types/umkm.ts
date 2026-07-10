import type { KategoriRef } from './kategori'

export interface Umkm {
  id: string
  nama_usaha: string
  slug: string
  deskripsi: string | null
  gambar_utama: string | null
  alamat_lengkap: string | null
  kategori_umkm: KategoriRef | null
}
