export type TingkatPengumuman = 'info' | 'penting'

export interface Pengumuman {
  id: string
  judul: string
  isi: string | null
  tingkat: TingkatPengumuman
  published: boolean
  created_at: string
}

export interface Festival {
  id: string
  nama: string
  /** Tanggal acara (date, bukan timestamp) — format YYYY-MM-DD. */
  tanggal: string
  lokasi: string | null
  published: boolean
}
