import type { KategoriRef } from './kategori'

export interface Berita {
  id: string
  judul: string
  slug: string
  konten: string
  gambar_utama: string | null
  tanggal_publikasi: string | null
  /** Ditandai admin sebagai kartu Sorotan; paling banyak satu baris bernilai true. */
  sorotan: boolean
  kategori_berita: KategoriRef | null
}

/** Berita di halaman detail — sama seperti kartu, plus penulis. */
export interface BeritaDetail extends Berita {
  penulis: string | null
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
  sorotan: boolean
  created_at: string
  updated_at: string
}
