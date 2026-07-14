export function formatTanggalIndonesia(value: string | null): string {
  if (!value) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

/**
 * Kotak tanggal kalender festival: { bulan: 'DES', hari: '15' }.
 *
 * Kolom `festival.tanggal` bertipe DATE, dan new Date('2026-12-15') dibaca
 * sebagai tengah malam UTC — di zona waktu negatif itu mundur sehari. Karena
 * itu tanggalnya dirakit manual sebagai tanggal lokal.
 */
export function formatKotakTanggal(value: string): { bulan: string; hari: string } {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return {
    bulan: new Intl.DateTimeFormat('id-ID', { month: 'short' })
      .format(date)
      .replace('.', '')
      .toUpperCase(),
    hari: String(day).padStart(2, '0'),
  }
}

export function formatRelativeIndonesia(value: string): string {
  const diffMs = Math.max(0, Date.now() - new Date(value).getTime())
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days === 1) return 'Kemarin'
  return `${days} hari lalu`
}
