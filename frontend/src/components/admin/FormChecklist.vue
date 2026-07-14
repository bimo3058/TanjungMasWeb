<script setup lang="ts">
import { computed } from 'vue'
import { Check, Circle, ListChecks } from '@lucide/vue'

export interface ChecklistItem {
  label: string
  done: boolean
}

export interface ChecklistMeta {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    items: ChecklistItem[]
    /** Baris fakta di bawah checklist (slug, jumlah kata, dsb). */
    meta?: ChecklistMeta[]
  }>(),
  { meta: () => [] },
)

const doneCount = computed(() => props.items.filter((item) => item.done).length)
const percent = computed(() =>
  props.items.length === 0 ? 0 : Math.round((doneCount.value / props.items.length) * 100),
)
</script>

<template>
  <section class="checklist">
    <div class="checklist__header">
      <h2 class="checklist__title">
        <ListChecks :size="16" />
        Kelengkapan Konten
      </h2>
      <span class="checklist__count">{{ doneCount }}/{{ items.length }}</span>
    </div>

    <div class="checklist__body">
      <div
        class="checklist__bar"
        role="progressbar"
        :aria-valuenow="percent"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span class="checklist__bar-fill" :style="{ width: `${percent}%` }" />
      </div>

      <ul class="checklist__list">
        <li
          v-for="item in items"
          :key="item.label"
          class="checklist__item"
          :class="{ 'checklist__item--done': item.done }"
        >
          <span class="checklist__mark">
            <Check v-if="item.done" :size="11" />
            <Circle v-else :size="9" />
          </span>
          {{ item.label }}
        </li>
      </ul>

      <dl v-if="meta.length > 0" class="checklist__meta">
        <div v-for="row in meta" :key="row.label" class="checklist__meta-row">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.value }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
/* Kartu ini yang memuai mengisi sisa tinggi kolom kanan, supaya dasarnya rata
   dengan kartu form di kiri. Isinya tetap menempel di atas; baris fakta yang
   turun ke dasar (lihat .checklist__meta). */
.checklist {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  overflow: hidden;
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
}

.checklist__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--blue-200);
}

.checklist__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.checklist__count {
  font-size: 12.5px;
  font-weight: var(--fw-semibold);
  color: var(--gray-500);
}

.checklist__body {
  padding: 14px 16px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  /* Jarak antar-bagian lewat gap, bukan margin, supaya margin-top: auto pada
     baris fakta tetap punya jarak minimum saat kartu tidak sedang memuai. */
  gap: 14px;
  min-height: 0;
}

.checklist__bar {
  height: 5px;
  border-radius: 9999px;
  background: var(--blue-100);
  overflow: hidden;
}

.checklist__bar-fill {
  display: block;
  height: 100%;
  border-radius: 9999px;
  background: var(--gold-500);
  transition: width 0.25s ease;
}

.checklist__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.checklist__item {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12.5px;
  color: var(--text-muted);
}

.checklist__item--done {
  color: var(--ink-900);
}

.checklist__mark {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--blue-100);
  color: var(--gray-500);
}

.checklist__item--done .checklist__mark {
  background: var(--blue-950, #000242);
  color: var(--white, #fff);
}

/* margin-top: auto — sisa ruang saat kartu memuai jatuh di sini, sehingga baris
   fakta duduk rapi di dasar kartu alih-alih menggantung di tengah. */
.checklist__meta {
  margin: auto 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--blue-200);
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.checklist__meta-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.checklist__meta-row dt {
  font-size: 11.5px;
  color: var(--gray-500);
  flex-shrink: 0;
}

.checklist__meta-row dd {
  margin: 0;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  color: var(--ink-900);
  text-align: right;
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
