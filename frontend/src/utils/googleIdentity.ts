/**
 * Google Identity Services (GIS) — login Google tanpa redirect ke Supabase.
 *
 * Dengan flow ini Google hanya melihat origin situs kita (Authorized JavaScript
 * origins), bukan callback Supabase, sehingga layar "Lanjutkan ke ..." memakai
 * domain kita. ID token yang dikembalikan Google ditukar ke Supabase lewat
 * supabase.auth.signInWithIdToken().
 */

const GSI_SRC = 'https://accounts.google.com/gsi/client'

let loader: Promise<void> | null = null

/** Muat skrip GIS sekali saja; pemanggilan berikutnya memakai promise yang sama. */
export function loadGoogleIdentity(): Promise<void> {
  if (loader) return loader

  loader = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      // Reset agar percobaan berikutnya tidak tersangkut promise yang gagal
      // (skrip GIS kerap diblokir ad-blocker atau jaringan sekolah/kantor).
      loader = null
      reject(new Error('Skrip Google Identity Services gagal dimuat.'))
    }
    document.head.appendChild(script)
  })

  return loader
}

/**
 * Nonce mengikat id_token ke satu percobaan login agar token tidak bisa dipakai
 * ulang. Google menerima versi hash-nya, Supabase menerima versi mentahnya, lalu
 * Supabase yang mencocokkan keduanya.
 */
export async function createNoncePair(): Promise<{ raw: string; hashed: string }> {
  const raw = `${crypto.randomUUID()}${crypto.randomUUID()}`
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  const hashed = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  return { raw, hashed }
}
