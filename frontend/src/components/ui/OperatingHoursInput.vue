<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseInput from './BaseInput.vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    dense?: boolean
  }>(),
  {
    label: 'Jam Operasional',
    dense: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function parseAuto(value: string): { start: string; end: string } | null {
  const m = value.match(/^(\d{2})[.:](\d{2})\s*[–-]\s*(\d{2})[.:](\d{2})$/)
  if (!m) return null
  return { start: `${m[1]}:${m[2]}`, end: `${m[3]}:${m[4]}` }
}

const parsed = parseAuto(props.modelValue)
const mode = ref<'otomatis' | 'manual'>(parsed ? 'otomatis' : 'manual')
const start = ref(parsed?.start ?? '08:00')
const end = ref(parsed?.end ?? '17:00')

function applyAuto() {
  emit('update:modelValue', `${start.value.replace(':', '.')}–${end.value.replace(':', '.')}`)
}

watch([start, end], () => {
  if (mode.value === 'otomatis') applyAuto()
})

function setMode(next: 'otomatis' | 'manual') {
  mode.value = next
  if (next === 'otomatis') applyAuto()
}
</script>

<template>
  <div class="hours" :class="{ 'hours--dense': dense }">
    <div class="hours__head">
      <span class="hours__label">{{ label }}</span>
      <div class="hours__tabs">
        <button
          type="button"
          class="hours__tab"
          :class="{ 'hours__tab--active': mode === 'otomatis' }"
          @click="setMode('otomatis')"
        >
          Otomatis
        </button>
        <button
          type="button"
          class="hours__tab"
          :class="{ 'hours__tab--active': mode === 'manual' }"
          @click="setMode('manual')"
        >
          Manual
        </button>
      </div>
    </div>

    <div v-if="mode === 'otomatis'" class="hours__range">
      <input type="time" class="hours__time" :class="{ 'hours__time--dense': dense }" v-model="start" />
      <span class="hours__dash">–</span>
      <input type="time" class="hours__time" :class="{ 'hours__time--dense': dense }" v-model="end" />
    </div>
    <BaseInput
      v-else
      :model-value="modelValue"
      :dense="dense"
      placeholder="Contoh: 24 Jam, Tutup hari Jumat"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped>
.hours {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-family: var(--font-sans);
}

.hours__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.hours__label {
  font-size: var(--fs-sm);
  line-height: var(--lh-sm);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-label);
  color: var(--ink-900);
}

.hours--dense .hours__label {
  font-size: 12px;
  line-height: 16px;
}

.hours__tabs {
  display: inline-flex;
  padding: 2px;
  border-radius: var(--radius-sm);
  background: var(--blue-100);
  gap: 2px;
}

.hours__tab {
  border: none;
  background: transparent;
  padding: 3px 10px;
  border-radius: 6px;
  font-family: var(--font-sans);
  font-size: 11.5px;
  font-weight: var(--fw-semibold);
  color: var(--ink-700);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.hours__tab--active {
  background: var(--white);
  color: var(--blue-900);
  box-shadow: var(--shadow-btn);
}

.hours__range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hours__time {
  flex: 1;
  box-sizing: border-box;
  padding: 13px 12px;
  background: var(--blue-50);
  border: 1px solid var(--border-input);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--fs-md);
  color: var(--ink-900);
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.hours__time:focus {
  border-color: var(--blue-900);
  box-shadow: 0 0 0 3px rgba(4, 13, 122, 0.1);
}

.hours__time--dense {
  padding: 8px 10px;
  font-size: 13px;
}

.hours__dash {
  color: var(--ink-700);
  flex-shrink: 0;
}
</style>
