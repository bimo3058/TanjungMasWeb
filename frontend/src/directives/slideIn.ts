import type { Directive } from 'vue'

/**
 * v-slide-in — elemen muncul dengan fade + geser naik saat pertama kali masuk
 * viewport, lalu berhenti diamati (animasi tidak diulang saat digulir balik).
 *
 * Semula dideklarasikan lokal di HomeView; diangkat ke sini agar semua halaman
 * memakai perilaku dan timing yang sama persis.
 */

const observers = new WeakMap<HTMLElement, IntersectionObserver>()

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const slideIn: Directive<HTMLElement> = {
  mounted(el) {
    // Tanpa penjagaan ini, elemen yang di-set opacity: 0 tidak akan pernah
    // dikembalikan — konten jadi hilang permanen, bukan sekadar tanpa animasi.
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return

    el.classList.add('anim-hidden')

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('anim-visible')
          obs.unobserve(entry.target)
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' },
    )

    observer.observe(el)
    observers.set(el, observer)
  },

  unmounted(el) {
    // Elemen yang dilepas sebelum sempat terlihat (mis. pindah halaman saat
    // masih di atas) meninggalkan observer menggantung tanpa ini.
    observers.get(el)?.disconnect()
    observers.delete(el)
  },
}
