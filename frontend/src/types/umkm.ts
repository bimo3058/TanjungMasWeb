import type { GaleriFoto } from './galeri'
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

/** UMKM di halaman detail — kartu, plus kolom yang tak muat di kartu. */
export interface UmkmDetail extends Umkm {
  nama_pemilik: string
  nomor_telepon: string | null
  jam_operasional: string | null
  tahun_berdiri: string | null
  status_izin: string | null
  galeri_umkm: GaleriFoto[]
}

export interface UmkmRow {
  id: string
  nama_usaha: string
  slug: string
  nama_pemilik: string
  nomor_telepon: string | null
  alamat_lengkap: string | null
  deskripsi: string | null
  gambar_utama: string | null
  kategori_id: string | null
  jam_operasional: string | null
  tahun_berdiri: string | null
  status_izin: string | null
  published: boolean
  created_at: string
  updated_at: string
}
