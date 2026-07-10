<script setup lang="ts">
import { MapPin } from '@lucide/vue'
import BaseBadge from './BaseBadge.vue'

defineProps<{
  image?: string | null
  category?: string | null
  title: string
  description?: string | null
  address?: string | null
}>()
</script>

<template>
  <div class="card">
    <div class="card__image" :style="image ? { backgroundImage: `url(${image})` } : undefined" />
    <div class="card__body">
      <BaseBadge v-if="category" variant="category" class="card__badge">{{ category }}</BaseBadge>
      <h3 class="card__title">{{ title }}</h3>
      <p v-if="description" class="card__description">{{ description }}</p>
      <template v-if="address">
        <div class="card__divider" />
        <div class="card__address">
          <MapPin :size="18" color="var(--blue-900)" />
          <span>{{ address }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  font-family: var(--font-sans);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px 0 rgba(0, 0, 0, 0.14);
}

.card__image {
  height: 200px;
  background: var(--blue-200) center / cover no-repeat;
}

.card__body {
  padding: 18px 17px 20px;
}

.card__badge {
  margin-bottom: 14px;
}

.card__title {
  margin: 0 0 10px;
  font-size: var(--fs-h2);
  line-height: 1.1;
  font-weight: var(--fw-semibold);
  color: var(--blue-900);
}

.card__description {
  margin: 0;
  font-size: var(--fs-md);
  line-height: 1.5;
  text-align: justify;
  color: var(--ink-000);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 16px 0 12px;
}

.card__address {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ink-000);
  font-size: var(--fs-md);
}
</style>
