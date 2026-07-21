import { supabase } from '@/utils/supabase'

export const PUBLIC_MEDIA_BUCKET = 'public-media'

/**
 * Mengambil object path dari public URL Supabase Storage.
 * URL eksternal/data URL sengaja diabaikan agar tidak pernah ikut dihapus.
 */
export function getPublicMediaPath(url: string | null | undefined): string | null {
  if (!url) return null

  try {
    const parsed = new URL(url)
    const marker = `/storage/v1/object/public/${PUBLIC_MEDIA_BUCKET}/`
    const markerIndex = parsed.pathname.indexOf(marker)
    if (markerIndex === -1) return null

    const encodedPath = parsed.pathname.slice(markerIndex + marker.length)
    return encodedPath ? decodeURIComponent(encodedPath) : null
  } catch {
    return null
  }
}

/** Menghapus object public-media yang direferensikan URL, tanpa duplikat. */
export async function removePublicMedia(urls: Array<string | null | undefined>): Promise<void> {
  const paths = [...new Set(urls.map(getPublicMediaPath).filter((path): path is string => !!path))]
  if (paths.length === 0) return

  const { error } = await supabase.storage.from(PUBLIC_MEDIA_BUCKET).remove(paths)
  if (error) throw error
}
