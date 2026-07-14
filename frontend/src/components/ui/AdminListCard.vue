<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'
import BaseBadge from './BaseBadge.vue'
import BaseToggle from './BaseToggle.vue'
import IconButton from './IconButton.vue'

// Versi kartu dari satu baris tabel manajemen — dipakai pada layar ponsel,
// di mana tabel desktop terlalu lebar untuk dibaca.
withDefaults(
  defineProps<{
    image?: string | null
    title: string
    sub?: string | null
    category?: string | null
    /** Teks meta tambahan (mis. harga, jam) — nilai kosong diabaikan. */
    metas?: (string | null | undefined)[]
    published: boolean
    publishedLabel?: string
    draftLabel?: string
  }>(),
  {
    metas: () => [],
    publishedLabel: 'Tayang',
    draftLabel: 'Draft',
  },
)

defineEmits<{
  'update:published': [value: boolean]
  edit: []
  delete: []
}>()
</script>

<template>
  <article class="manage-card">
    <div
      class="manage-card__thumb"
      :style="image ? { backgroundImage: `url(${image})` } : undefined"
    />
    <div class="manage-card__main">
      <h3 class="manage-card__title">{{ title }}</h3>
      <div v-if="sub" class="manage-card__sub">{{ sub }}</div>

      <div class="manage-card__metas">
        <BaseBadge v-if="category" variant="blue" dense>{{ category }}</BaseBadge>
        <span
          v-for="(meta, i) in metas.filter(Boolean)"
          :key="i"
          class="manage-card__meta"
        >
          {{ meta }}
        </span>
      </div>

      <div class="manage-card__footer">
        <span class="manage-card__status">
          <BaseToggle
            :model-value="published"
            @update:model-value="$emit('update:published', $event)"
          />
          {{ published ? publishedLabel : draftLabel }}
        </span>
        <div class="manage-card__actions">
          <IconButton title="Edit" @click="$emit('edit')">
            <Pencil :size="14" />
          </IconButton>
          <IconButton title="Hapus" danger @click="$emit('delete')">
            <Trash2 :size="14" />
          </IconButton>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.manage-card {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 11px 13px;
  background: var(--surface-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-admin);
  font-family: var(--font-sans);
}

.manage-card__thumb {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--blue-200) center / cover no-repeat;
}

.manage-card__main {
  flex: 1;
  min-width: 0;
}

.manage-card__title {
  margin: 0;
  font-size: 13.5px;
  line-height: 18px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.manage-card__sub {
  margin-top: 1px;
  font-size: 11px;
  color: var(--gray-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manage-card__metas {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px 8px;
  margin-top: 7px;
}

.manage-card__meta {
  font-size: 11.5px;
  color: var(--ink-700);
}

.manage-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  padding-top: 9px;
  border-top: 1px solid var(--blue-100);
}

.manage-card__status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11.5px;
  color: var(--ink-700);
}

.manage-card__actions {
  display: inline-flex;
  gap: 7px;
}
</style>
