<script setup lang="ts">
import { Ticket, Clock, MapPin } from '@lucide/vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import BaseBadge from './BaseBadge.vue'
import ClampedText from './ClampedText.vue'

defineProps<{
  image?: string | null
  category?: string | null
  title: string
  description?: string | null
  address?: string | null
  harga?: string | null
  jam?: string | null
  /** Bila diisi, kartu jadi tautan ke halaman detail. Pratinjau di form admin
   *  sengaja tidak mengisinya agar kartu tetap sekadar tampilan. */
  to?: RouteLocationRaw
}>()
</script>

<template>
  <component :is="to ? RouterLink : 'article'" :to="to" class="wisata-card">
    <div class="wisata-card__image-wrap">
      <div class="wisata-card__image" :style="image ? { backgroundImage: `url(${image})` } : undefined" />
      <BaseBadge v-if="category" variant="accent" class="wisata-card__badge">{{ category }}</BaseBadge>
    </div>
    <div class="wisata-card__body">
      <h3 class="wisata-card__title">{{ title }}</h3>
      <ClampedText v-if="description" :text="description" :lines="3" class="wisata-card__desc" />
      <div class="wisata-card__stats">
        <span v-if="harga" class="wisata-card__stat"><Ticket :size="12" class="wisata-card__icon" />{{ harga }}</span>
        <span v-if="jam" class="wisata-card__stat"><Clock :size="12" class="wisata-card__icon" />{{ jam }}</span>
        <span v-if="address" class="wisata-card__stat"><MapPin :size="12" class="wisata-card__icon" />{{ address }}</span>
      </div>
    </div>
  </component>
</template>

<style scoped>
.wisata-card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-admin);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  font-family: var(--font-sans);
  /* Kartu bisa berupa <a> (RouterLink) — netralkan gaya tautan bawaan. */
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.wisata-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-pop);
}

.wisata-card__image-wrap {
  position: relative;
}

.wisata-card__image {
  width: 100%;
  height: 148px;
  background: var(--blue-200) center / cover no-repeat;
}

.wisata-card__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 11px;
  padding: 3px 9px;
}

.wisata-card__body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;
}

.wisata-card__title {
  margin: 0;
  font-size: 15.5px;
  line-height: 20px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.wisata-card__desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 18px;
  color: var(--ink-700);
  flex: 1;
}

.wisata-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  padding-top: 8px;
  border-top: 1px solid var(--blue-100);
}

.wisata-card__stat {
  display: inline-flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 11.5px;
  /* Tinggi baris dipatok supaya tinggi kotak ikon di bawah punya acuan pasti. */
  line-height: 16px;
  font-weight: var(--fw-medium);
  color: var(--ink-700);
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
}

/* align-items: flex-start menempelkan ikon ke puncak kotak baris, sementara
   hurufnya mulai beberapa piksel di bawah — ikon tampak naik. Kotak ikon
   ditinggikan menyamai satu baris teks; SVG-nya menjaga rasio dan otomatis
   terpusat di dalamnya, sehingga sejajar dengan baris pertama (penting untuk
   alamat yang memanjang beberapa baris — center akan menaruhnya di tengah). */
.wisata-card__icon {
  color: var(--blue-900);
  flex-shrink: 0;
  height: 16px;
}

@media (max-width: 600px) {
  .wisata-card {
    border-radius: var(--radius-lg);
  }

  .wisata-card__image {
    height: 150px;
  }

  .wisata-card__title {
    font-size: 16px;
    line-height: 21px;
  }

  .wisata-card__desc {
    font-size: 13px;
    line-height: 19px;
  }
}
</style>
