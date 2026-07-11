import type { KategoriRef } from './kategori'

export interface Berita {
  id: string
  judul: string
  slug: string
  konten: string
  gambar_utama: string | null
  tanggal_publikasi: string | null
  kategori_berita: KategoriRef | null
}

export interface BeritaRow {
  id: string
  judul: string
  slug: string
  konten: string
  gambar_utama: string | null
  kategori_id: string | null
  status: string
  penulis: string
  tanggal_publikasi: string | null
  created_at: string
  updated_at: string
}
