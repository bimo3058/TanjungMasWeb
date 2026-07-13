<script setup lang="ts">
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
  <article class="card">
    <div class="card__image-wrapper">
      <div class="card__image" :style="image ? { backgroundImage: `url(${image})` } : undefined" />
      <BaseBadge v-if="category" variant="category" class="card__badge">{{ category }}</BaseBadge>
    </div>
    
    <div class="card__body">
      <h3 class="card__title">{{ title }}</h3>
      <ClampedText v-if="description" :text="description" :lines="3" class="card__desc" />
      <hr class="card__divider" />
  
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--blue-100);
  overflow: hidden;
  box-shadow: var(--shadow-admin);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  height: 100%;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-pop);
}

.card__image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  flex-shrink: 0;
}

.card__image {
  width: 100%;
  height: 100%;
  background: var(--blue-200) center / cover no-repeat;
}

.card__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 11px;
  padding: 3px 9px;
}

.card__body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.card__title {
  margin: 0 0 10px 0;
  font-size: 15.5px;
  line-height: 1.3;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.card__desc {
  margin: 0 0 12px 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--ink-700);
}

.card__link {
  font-size: 12.5px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
  text-decoration: none;
  margin-top: auto;
  margin-bottom: 16px;
  display: inline-block;
}

.card__link:hover {
  text-decoration: underline;
}

.card__divider {
  border: none;
  border-top: 1px solid var(--blue-100);
  margin: 0 0 16px 0;
}

.card__meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card__meta-item {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  color: var(--ink-700);
  line-height: 1.5;
}

.card__icon {
  color: var(--blue-900);
  flex-shrink: 0;
  margin-top: 2px;
}
</style>