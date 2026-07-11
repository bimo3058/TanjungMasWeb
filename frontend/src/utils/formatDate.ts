export function formatTanggalIndonesia(value: string | null): string {
  if (!value) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
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
