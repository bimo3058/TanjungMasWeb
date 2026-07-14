<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { Check, ChevronDown } from '@lucide/vue'

// Listbox buatan sendiri, bukan <select> bawaan: daftar opsi <select> digambar
// oleh OS sehingga font/warna/radius-nya tidak bisa disentuh CSS sama sekali.
// API-nya sengaja dibuat sama persis dengan versi <select> sebelumnya.
const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    options: Array<{ value: string; label: string }>
    dense?: boolean
    disabled?: boolean
  }>(),
  {
    placeholder: 'Pilih...',
    dense: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uid = useId()
const rootRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

const open = ref(false)
const activeIndex = ref(0)
const dropUp = ref(false)

// Panel di-teleport ke <body> dan diposisikan `fixed`. Kalau dibiarkan di dalam
// komponen, ia akan terpotong oleh induk ber-overflow — dan filter manajemen
// memang duduk di dalam .table-card yang `overflow: hidden`.
const panelStyle = ref<Record<string, string>>({})

const GUTTER = 8

function updatePosition() {
  const trigger = rootRef.value?.querySelector('.field__trigger')
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const panelH = listRef.value?.offsetHeight ?? 0
  const panelW = listRef.value?.offsetWidth ?? rect.width

  const spaceBelow = window.innerHeight - rect.bottom
  dropUp.value = spaceBelow < panelH + GUTTER && rect.top > spaceBelow

  // Panel boleh lebih lebar dari trigger (biar label panjang tidak terpotong),
  // tapi digeser masuk kalau sampai melewati tepi kanan layar.
  let left = rect.left
  const maxRight = window.innerWidth - GUTTER
  if (left + panelW > maxRight) left = Math.max(GUTTER, maxRight - panelW)

  panelStyle.value = {
    left: `${left}px`,
    minWidth: `${rect.width}px`,
    maxWidth: `calc(100vw - ${GUTTER * 2}px)`,
    ...(dropUp.value
      ? { top: `${rect.top - panelH - 6}px` }
      : { top: `${rect.bottom + 6}px` }),
  }
}

// Opsi pertama = placeholder (nilai kosong), meniru <option value=""> pada versi
// lama supaya filter tetap bisa dikosongkan lagi.
const allOptions = computed(() => [
  { value: '', label: props.placeholder },
  ...props.options,
])

const selectedIndex = computed(() =>
  Math.max(
    allOptions.value.findIndex((o) => o.value === props.modelValue),
    0,
  ),
)
const selectedLabel = computed(() => allOptions.value[selectedIndex.value]?.label ?? props.placeholder)
const isEmpty = computed(() => props.modelValue === '')

function optionId(i: number) {
  return `${uid}-opt-${i}`
}

async function openList() {
  if (props.disabled) return
  open.value = true
  activeIndex.value = selectedIndex.value

  await nextTick()
  updatePosition() // sekali untuk mengukur tinggi panel…
  await nextTick()
  updatePosition() // …lalu sekali lagi setelah dropUp diketahui.
  scrollActiveIntoView()

  // Panel `fixed` tidak ikut bergerak sendiri: posisinya harus dihitung ulang
  // saat halaman/kontainer digulir. `capture` agar scroller dalam ikut terpantau.
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
}

function closeList() {
  if (!open.value) return
  open.value = false
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
}

function toggle() {
  open.value ? closeList() : openList()
}

function choose(i: number) {
  emit('update:modelValue', allOptions.value[i].value)
  closeList()
}

function scrollActiveIntoView() {
  listRef.value
    ?.querySelector<HTMLElement>(`#${CSS.escape(optionId(activeIndex.value))}`)
    ?.scrollIntoView({ block: 'nearest' })
}

function move(delta: number) {
  const last = allOptions.value.length - 1
  activeIndex.value = Math.min(Math.max(activeIndex.value + delta, 0), last)
  scrollActiveIntoView()
}

// Type-ahead: <select> bawaan punya ini, jadi jangan sampai hilang.
let typed = ''
let typedTimer: ReturnType<typeof setTimeout>
function typeAhead(char: string) {
  clearTimeout(typedTimer)
  typed += char.toLowerCase()
  typedTimer = setTimeout(() => (typed = ''), 600)

  const found = allOptions.value.findIndex((o) => o.label.toLowerCase().startsWith(typed))
  if (found >= 0) {
    activeIndex.value = found
    if (open.value) scrollActiveIntoView()
    else choose(found)
  }
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  if (!open.value) {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault()
      openList()
    } else if (event.key.length === 1 && /\S/.test(event.key)) {
      event.preventDefault()
      typeAhead(event.key)
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      move(-1)
      break
    case 'Home':
      event.preventDefault()
      activeIndex.value = 0
      scrollActiveIntoView()
      break
    case 'End':
      event.preventDefault()
      activeIndex.value = allOptions.value.length - 1
      scrollActiveIntoView()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      choose(activeIndex.value)
      break
    case 'Escape':
      event.preventDefault()
      closeList()
      break
    case 'Tab':
      closeList()
      break
    default:
      if (event.key.length === 1 && /\S/.test(event.key)) {
        event.preventDefault()
        typeAhead(event.key)
      }
  }
}

function onOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  // Panel ada di <body> (teleport), jadi ia bukan turunan rootRef — harus dicek terpisah.
  const inside =
    rootRef.value?.contains(target) || listRef.value?.contains(target)
  if (!inside) closeList()
}

onMounted(() => document.addEventListener('click', onOutsideClick))
onBeforeUnmount(() => {
  document.removeEventListener('click', onOutsideClick)
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
  clearTimeout(typedTimer)
})

// Daftar opsi bisa datang belakangan (mis. kategori dimuat dari Supabase).
watch(
  () => props.options,
  () => {
    if (open.value) activeIndex.value = selectedIndex.value
  },
)
</script>

<template>
  <div ref="rootRef" class="field" :class="{ 'field--dense': dense }">
    <span v-if="label" :id="`${uid}-label`" class="field__label">{{ label }}</span>

    <button
      type="button"
      class="field__trigger"
      :class="{ 'field__trigger--open': open, 'field__trigger--empty': isEmpty }"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="`${uid}-list`"
      :aria-labelledby="label ? `${uid}-label` : undefined"
      :aria-activedescendant="open ? optionId(activeIndex) : undefined"
      :disabled="disabled"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span class="field__value">{{ selectedLabel }}</span>
      <ChevronDown :size="dense ? 15 : 18" class="field__chevron" />
    </button>

    <Teleport to="body">
      <ul
        v-if="open"
        :id="`${uid}-list`"
        ref="listRef"
        class="field__list"
        :style="panelStyle"
        role="listbox"
        :aria-labelledby="label ? `${uid}-label` : undefined"
      >
        <li
          v-for="(option, i) in allOptions"
          :id="optionId(i)"
          :key="option.value || '__placeholder'"
          class="field__option"
          :class="{
            'field__option--active': i === activeIndex,
            'field__option--selected': i === selectedIndex,
            'field__option--placeholder': option.value === '',
          }"
          role="option"
          :aria-selected="i === selectedIndex"
          @click="choose(i)"
          @mousemove="activeIndex = i"
        >
          <span class="field__option-label">{{ option.label }}</span>
          <Check v-if="i === selectedIndex" :size="14" class="field__option-check" />
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<style scoped>
.field {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-family: var(--font-sans);
}

.field__label {
  font-size: var(--fs-sm);
  line-height: var(--lh-sm);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-label);
  color: var(--ink-900);
}

.field__trigger {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 13px 12px;
  background: var(--blue-50);
  border: 1px solid var(--border-input);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--fs-md);
  color: var(--ink-900);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.field__trigger:hover:not(:disabled) {
  background: var(--blue-100);
}

.field__trigger:focus-visible,
.field__trigger--open {
  outline: none;
  border-color: var(--blue-900);
  box-shadow: 0 0 0 3px rgba(4, 13, 122, 0.1);
}

.field__trigger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Belum ada pilihan → tampil seperti placeholder, bukan seperti nilai terpilih. */
.field__trigger--empty .field__value {
  color: var(--gray-500);
}

.field__value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field__chevron {
  flex-shrink: 0;
  color: var(--ink-700);
  transition: transform 0.15s ease;
}

.field__trigger--open .field__chevron {
  transform: rotate(180deg);
}

/* ---- Panel opsi (di-teleport ke <body>, koordinat dari updatePosition) ---- */
.field__list {
  position: fixed;
  z-index: 60; /* di atas tab bar melayang (30) & laci notifikasi (30) */
  margin: 0;
  padding: 5px;
  list-style: none;
  max-height: 240px;
  overflow-y: auto;
  box-sizing: border-box;
  font-family: var(--font-sans);
  background: var(--surface-card);
  border: 1px solid var(--blue-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-pop);
  animation: field-pop 0.12s ease-out;
}

@keyframes field-pop {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.field__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  line-height: 18px;
  color: var(--ink-900);
  cursor: pointer;
}

.field__option-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field__option--placeholder {
  color: var(--gray-500);
}

/* Baris di bawah kursor / panah keyboard. */
.field__option--active {
  background: var(--blue-50);
}

.field__option--selected {
  font-weight: var(--fw-semibold);
  color: var(--blue-900);
}

.field__option--selected.field__option--active {
  background: var(--blue-100);
}

.field__option-check {
  flex-shrink: 0;
  color: var(--blue-900);
}

/* ---- Varian dense (filter di halaman manajemen) ---- */
.field--dense .field__label {
  font-size: 12px;
  line-height: 16px;
}

.field--dense .field__trigger {
  height: 34px;
  padding: 0 10px;
  font-size: 13px;
}

@media (max-width: 768px) {
  /* Sasaran sentuh: baris opsi dibuat lebih tinggi di layar sentuh. */
  .field__option {
    padding: 11px 10px;
  }

  .field--dense .field__trigger {
    height: 38px;
    border-radius: var(--radius-sm);
  }
}
</style>
