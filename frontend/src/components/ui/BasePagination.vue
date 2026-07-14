<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps<{
  page: number
  pageCount: number
  /** Jumlah tombol angka sebelum daftar diringkas dengan elipsis. */
  maxButtons?: number
}>()

const emit = defineEmits<{ 'update:page': [page: number] }>()

const WINDOW = 5

// Halaman ditampilkan penuh selama masih sedikit; begitu banyak, hanya jendela
// di sekitar halaman aktif yang muncul agar barisnya tidak melebar tak terkendali.
const pages = computed<(number | 'gap')[]>(() => {
  const limit = props.maxButtons ?? WINDOW
  if (props.pageCount <= limit) {
    return Array.from({ length: props.pageCount }, (_, i) => i + 1)
  }

  const span = Math.floor((limit - 1) / 2)
  let start = Math.max(1, props.page - span)
  const end = Math.min(props.pageCount, start + limit - 1)
  start = Math.max(1, end - limit + 1)

  const result: (number | 'gap')[] = []
  if (start > 1) result.push(1, 'gap')
  for (let i = start; i <= end; i += 1) result.push(i)
  if (end < props.pageCount) result.push('gap', props.pageCount)

  return result
})

function go(target: number) {
  const clamped = Math.min(Math.max(target, 1), props.pageCount)
  if (clamped !== props.page) emit('update:page', clamped)
}
</script>

<template>
  <nav v-if="pageCount > 1" class="pager" aria-label="Navigasi halaman">
    <button
      type="button"
      class="pager__btn"
      :disabled="page <= 1"
      aria-label="Halaman sebelumnya"
      @click="go(page - 1)"
    >
      <ChevronLeft :size="15" />
    </button>

    <template v-for="(item, index) in pages" :key="`${item}-${index}`">
      <span v-if="item === 'gap'" class="pager__gap">…</span>
      <button
        v-else
        type="button"
        class="pager__btn"
        :class="{ 'pager__btn--active': item === page }"
        :aria-current="item === page ? 'page' : undefined"
        @click="go(item)"
      >
        {{ item }}
      </button>
    </template>

    <button
      type="button"
      class="pager__btn"
      :disabled="page >= pageCount"
      aria-label="Halaman berikutnya"
      @click="go(page + 1)"
    >
      <ChevronRight :size="15" />
    </button>
  </nav>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-sans);
}

.pager__btn {
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  border: 1px solid var(--blue-200);
  background: var(--surface-card);
  color: var(--ink-900);
  font-family: inherit;
  font-size: 13px;
  font-weight: var(--fw-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.pager__btn:hover:not(:disabled):not(.pager__btn--active) {
  background: var(--blue-50);
}

.pager__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pager__btn--active {
  background: var(--gold-500);
  border-color: var(--gold-500);
  color: var(--gold-ink);
  cursor: default;
}

.pager__gap {
  color: var(--gray-500);
  font-size: 13px;
}
</style>
