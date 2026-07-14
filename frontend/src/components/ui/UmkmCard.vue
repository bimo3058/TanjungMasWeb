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
  <article class="card">
    <div class="card__image-wrapper">
      <div class="card__image" :style="image ? { backgroundImage: `url(${image})` } : undefined" />
      <!-- Di ponsel gambar hanya selebar 104px, terlalu sempit untuk badge
           bertumpuk — di sana badge pindah ke dalam body (card__badge-inline). -->
      <BaseBadge v-if="category" variant="category" class="card__badge">{{ category }}</BaseBadge>
    </div>

    <div class="card__body">
      <BaseBadge v-if="category" variant="category" class="card__badge-inline">
        {{ category }}
      </BaseBadge>
      <h3 class="card__title">{{ title }}</h3>
      <ClampedText v-if="description" :text="description" :lines="3" class="card__desc" />
      <hr class="card__divider" />
      <div v-if="address" class="card__meta">
        <span class="card__meta-item">
          <MapPin :size="13" class="card__icon" />{{ address }}
        </span>
      </div>
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

.card__badge-inline {
  display: none;
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

.card__divider {
  border: none;
  border-top: 1px solid var(--blue-100);
  margin: auto 0 12px;
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
  overflow-wrap: anywhere;
}

.card__icon {
  color: var(--blue-900);
  flex-shrink: 0;
  margin-top: 2px;
}

/* Ponsel: kartu jadi horizontal — gambar sempit di kiri, teks di kanan. */
@media (max-width: 600px) {
  .card {
    flex-direction: row;
    height: auto;
    border-radius: var(--radius-lg);
  }

  .card__image-wrapper {
    width: 104px;
    height: auto;
    align-self: stretch;
  }

  .card__badge {
    display: none;
  }

  .card__badge-inline {
    display: inline-flex;
    align-self: flex-start;
    margin-bottom: 5px;
    font-size: 10.5px;
    padding: 2px 8px;
  }

  .card__body {
    padding: 11px 13px;
  }

  .card__title {
    margin-bottom: 5px;
    font-size: 14.5px;
    line-height: 19px;
  }

  .card__desc {
    margin-bottom: 0;
    font-size: 12px;
    line-height: 1.45;
  }

  /* Alamat menempel ke dasar kartu; pemisah tidak diperlukan di layout sempit. */
  .card__divider {
    display: none;
  }

  .card__meta {
    margin-top: auto;
    padding-top: 6px;
  }

  .card__meta-item {
    gap: 5px;
    font-size: 11.5px;
  }

  .card__icon {
    margin-top: 1px;
  }
}
</style>
