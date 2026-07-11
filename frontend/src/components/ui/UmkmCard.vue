<script setup lang="ts">
import { MapPin } from '@lucide/vue'
import BaseBadge from './BaseBadge.vue'
import ClampedText from './ClampedText.vue'

defineProps<{
  image?: string | null
  category?: string | null
  title: string
  description?: string | null
  address?: string | null
}>()
</script>

<template>
  <article class="umkm-card">
    <div class="umkm-card__image" :style="image ? { backgroundImage: `url(${image})` } : undefined" />
    <div class="umkm-card__body">
      <BaseBadge v-if="category" variant="category" class="umkm-card__badge">{{ category }}</BaseBadge>
      <h3 class="umkm-card__title">{{ title }}</h3>
      <ClampedText v-if="description" :text="description" :lines="2" class="umkm-card__desc" />
      <span v-if="address" class="umkm-card__address">
        <MapPin :size="12" class="umkm-card__icon" />{{ address }}
      </span>
    </div>
  </article>
</template>

<style scoped>
.umkm-card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-admin);
  display: flex;
  cursor: pointer;
  font-family: var(--font-sans);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.umkm-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-pop);
}

.umkm-card__image {
  width: 118px;
  min-height: 118px;
  flex-shrink: 0;
  background: var(--blue-200) center / cover no-repeat;
}

.umkm-card__body {
  padding: 11px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.umkm-card__badge {
  font-size: 10.5px;
  padding: 2px 8px;
  align-self: flex-start;
}

.umkm-card__title {
  margin: 0;
  font-size: 14.5px;
  line-height: 19px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.umkm-card__desc {
  margin: 0;
  font-size: 12px;
  line-height: 17px;
  color: var(--ink-700);
}

.umkm-card__address {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--ink-700);
  margin-top: auto;
}

.umkm-card__icon {
  color: var(--blue-900);
  flex-shrink: 0;
}
</style>
