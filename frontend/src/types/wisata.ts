import type { GaleriFoto } from './galeri'
import type { KategoriRef } from './kategori'

export interface Wisata {
  id: string
  nama: string
  slug: string
  deskripsi: string | null
  gambar_utama: string | null
  alamat_lengkap: string | null
  harga_tiket: string | null
  jam_operasional: string | null
  kategori_wisata: KategoriRef | null
}

/** Wisata di halaman detail — kartu, plus kolom yang tak muat di kartu. */
export interface WisataDetail extends Wisata {
  lokasi_maps_url: string | null
  galeri_wisata: GaleriFoto[]
}

export interface WisataRow {
  id: string
  nama: string
  slug: string
  deskripsi: string | null
  gambar_utama: string | null
  kategori_id: string | null
  lokasi_maps_url: string | null
  alamat_lengkap: string | null
  jam_operasional: string | null
  harga_tiket: string | null
  published: boolean
  created_at: string
  updated_at: string
}
