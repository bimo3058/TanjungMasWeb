<script setup lang="ts">
import { Newspaper, Calendar } from '@lucide/vue'
import BaseBadge from './BaseBadge.vue'
import ClampedText from './ClampedText.vue'
import { formatTanggalIndonesia } from '@/utils/formatDate'

withDefaults(
  defineProps<{
    image?: string | null
    category?: string | null
    date?: string | null
    title: string
    excerpt?: string | null
    big?: boolean
  }>(),
  {
    big: false,
  },
)
</script>

<template>
  <article class="news-card" :class="{ 'news-card--big': big }">
    <div
      class="news-card__image"
      :style="image ? { backgroundImage: `url(${image})` } : undefined"
    >
      <Newspaper v-if="!image" :size="big ? 40 : 28" color="var(--blue-300)" />
    </div>
    <div class="news-card__body">
      <div class="news-card__meta">
        <BaseBadge v-if="category" variant="blue" dense>{{ category }}</BaseBadge>
        <span v-if="date" class="news-card__date"><Calendar :size="11" />{{ formatTanggalIndonesia(date) }}</span>
      </div>
      <h3 class="news-card__title">{{ title }}</h3>
      <ClampedText
        v-if="excerpt"
        :text="excerpt"
        :lines="big ? 4 : 3"
        class="news-card__excerpt"
      />
    </div>
  </article>
</template>

<style scoped>
.news-card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  overflow: hidden;
  font-family: var(--font-sans);
  display: flex;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.news-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-pop);
}

.news-card--big {
  flex-direction: column;
}

.news-card__image {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--blue-100);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  width: 128px;
}

.news-card--big .news-card__image {
  width: 100%;
  height: 210px;
}

.news-card__body {
  padding: 11px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.news-card--big .news-card__body {
  padding: 14px 16px 16px;
}

.news-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.news-card__date {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--gray-500);
}

.news-card__title {
  margin: 0;
  font-size: 14.5px;
  line-height: 19px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.news-card--big .news-card__title {
  font-size: 18px;
  line-height: 24px;
}

.news-card__excerpt {
  font-size: 12.5px;
  line-height: 18px;
  color: var(--ink-700);
}

@media (max-width: 600px) {
  .news-card {
    border-radius: var(--radius-lg);
  }

  .news-card__image {
    width: 108px;
  }

  .news-card--big .news-card__image {
    width: 100%;
    height: 168px;
  }

  .news-card__body {
    padding: 11px 13px;
  }

  .news-card--big .news-card__body {
    padding: 12px 14px 14px;
  }

  .news-card__title {
    font-size: 14px;
    line-height: 18px;
  }

  .news-card--big .news-card__title {
    font-size: 17px;
    line-height: 22px;
  }

  .news-card__date {
    font-size: 11px;
  }
}
</style>
