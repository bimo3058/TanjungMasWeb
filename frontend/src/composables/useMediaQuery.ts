import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Melacak sebuah media query secara reaktif.
 *
 * Dipakai bila breakpoint mengubah *struktur* komponen (mis. kartu berita
 * pertama tampil besar di ponsel), bukan sekadar gaya — kasus seperti itu
 * tidak bisa diselesaikan dengan CSS saja.
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mql: MediaQueryList | undefined

  const update = (event: MediaQueryListEvent | MediaQueryList) => {
    matches.value = event.matches
  }

  onMounted(() => {
    mql = window.matchMedia(query)
    update(mql)
    mql.addEventListener('change', update)
  })

  onBeforeUnmount(() => mql?.removeEventListener('change', update))

  return matches
}
