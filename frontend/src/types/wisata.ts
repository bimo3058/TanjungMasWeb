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
