import { computed, ref, watch, type Ref } from 'vue'

export function usePagination<T>(items: Ref<T[]>, pageSize = 8) {
  const page = ref(1)

  watch(items, () => {
    page.value = 1
  })

  const pageCount = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize)))
  const pageItems = computed(() => {
    const start = (page.value - 1) * pageSize
    return items.value.slice(start, start + pageSize)
  })
  const rangeStart = computed(() => (items.value.length === 0 ? 0 : (page.value - 1) * pageSize + 1))
  const rangeEnd = computed(() => Math.min(page.value * pageSize, items.value.length))

  function next() {
    if (page.value < pageCount.value) page.value += 1
  }

  function prev() {
    if (page.value > 1) page.value -= 1
  }

  return { page, pageCount, pageItems, rangeStart, rangeEnd, next, prev }
}
