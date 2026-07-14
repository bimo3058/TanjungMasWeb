<script setup lang="ts">
import { ArrowRight, Newspaper } from '@lucide/vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import BaseBadge from './BaseBadge.vue'
import ClampedText from './ClampedText.vue'
import { formatTanggalIndonesia } from '@/utils/formatDate'

defineProps<{
  image?: string | null
  category?: string | null
  date?: string | null
  title: string
  excerpt?: string | null
  to: RouteLocationRaw
}>()
</script>

<template>
  <RouterLink :to="to" class="featured">
    <div class="featured__image" :style="image ? { backgroundImage: `url(${image})` } : undefined">
      <Newspaper v-if="!image" :size="44" color="var(--blue-300)" />
      <span class="featured__flag">Sorotan</span>
    </div>

    <div class="featured__body">
      <div class="featured__meta">
        <BaseBadge v-if="category" variant="blue" dense>{{ category }}</BaseBadge>
        <span v-if="date" class="featured__date">{{ formatTanggalIndonesia(date) }}</span>
      </div>

      <h2 class="featured__title">{{ title }}</h2>
      <ClampedText v-if="excerpt" :text="excerpt" :lines="4" class="featured__excerpt" />

      <span class="featured__more">
        Baca Selengkapnya
        <ArrowRight :size="15" />
      </span>
    </div>
  </RouterLink>
</template>

<style scoped>
.featured {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  overflow: hidden;
  font-family: var(--font-sans);
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.featured:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-pop);
}

.featured__image {
  position: relative;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--blue-100);
  background-size: cover;
  background-position: center;
}

.featured__flag {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 4px 12px;
  border-radius: 9999px;
  background: var(--gold-500);
  color: var(--gold-ink);
  font-size: 12px;
  font-weight: var(--fw-semibold);
}

.featured__body {
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.featured__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.featured__date {
  font-size: 12px;
  color: var(--gray-500);
}

.featured__title {
  margin: 0;
  font-size: 22px;
  line-height: 30px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
}

.featured__excerpt {
  font-size: 13.5px;
  line-height: 21px;
  color: var(--ink-700);
}

.featured__more {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: auto;
  padding-top: 10px;
  font-size: 13px;
  font-weight: var(--fw-semibold);
  color: var(--blue-900);
}

@media (max-width: 820px) {
  .featured {
    grid-template-columns: 1fr;
  }

  .featured__image {
    min-height: 200px;
  }
}

@media (max-width: 600px) {
  .featured {
    border-radius: var(--radius-lg);
  }

  .featured__image {
    min-height: 170px;
  }

  .featured__body {
    padding: 16px 16px 18px;
  }

  .featured__title {
    font-size: 19px;
    line-height: 25px;
  }
}
</style>
