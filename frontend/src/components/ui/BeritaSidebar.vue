<script setup lang="ts">
import { CalendarCheck, Info, MapPin, Megaphone, TriangleAlert } from '@lucide/vue'
import { formatKotakTanggal } from '@/utils/formatDate'
import type { Festival, Pengumuman } from '@/types/infoDesa'

defineProps<{
  pengumuman: Pengumuman[]
  festival: Festival[]
  loading?: boolean
  /** Batasi ke satu panel saja — dipakai pratinjau di panel admin. */
  only?: 'pengumuman' | 'festival'
}>()

const TUJUH_HARI = 7 * 86_400_000

// Label "Terkini" diturunkan dari waktu terbit, bukan kolom tersendiri — supaya
// admin tidak perlu ingat mematikan penanda itu setelah pengumumannya basi.
function isTerkini(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < TUJUH_HARI
}
</script>

<template>
  <aside class="sidebar">
    <section v-if="only !== 'festival'" class="panel">
      <h2 class="panel__title">
        <Megaphone :size="20" />
        Pengumuman Desa
      </h2>

      <div v-if="loading" class="panel__skeleton">
        <div v-for="n in 2" :key="n" class="panel__skeleton-row" />
      </div>
      <p v-else-if="pengumuman.length === 0" class="panel__empty">Belum ada pengumuman.</p>
      <ul v-else class="panel__list">
        <li v-for="item in pengumuman" :key="item.id" class="announce">
          <span class="announce__icon" :class="{ 'announce__icon--warn': item.tingkat === 'penting' }">
            <TriangleAlert v-if="item.tingkat === 'penting'" :size="13" />
            <Info v-else :size="13" />
          </span>
          <div class="announce__body">
            <span v-if="isTerkini(item.created_at)" class="announce__flag">Terkini</span>
            <h3 class="announce__title">{{ item.judul }}</h3>
            <p v-if="item.isi" class="announce__text">{{ item.isi }}</p>
          </div>
        </li>
      </ul>
    </section>

    <section v-if="only !== 'pengumuman'" class="panel">
      <h2 class="panel__title">
        <CalendarCheck :size="20" />
        Kalender Festival
      </h2>

      <div v-if="loading" class="panel__skeleton">
        <div v-for="n in 3" :key="n" class="panel__skeleton-row" />
      </div>
      <p v-else-if="festival.length === 0" class="panel__empty">Belum ada agenda mendatang.</p>
      <ul v-else class="panel__list">
        <li v-for="item in festival" :key="item.id" class="event">
          <div class="event__date">
            <span class="event__month">{{ formatKotakTanggal(item.tanggal).bulan }}</span>
            <span class="event__day">{{ formatKotakTanggal(item.tanggal).hari }}</span>
          </div>
          <div class="event__body">
            <h3 class="event__name">{{ item.nama }}</h3>
            <span v-if="item.lokasi" class="event__place">
              <MapPin :size="12" />
              {{ item.lokasi }}
            </span>
          </div>
        </li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: var(--font-sans);
}

.panel {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  padding: 20px;
}

.panel__title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  font-size: 19px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
}

.panel__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel__empty {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.panel__skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel__skeleton-row {
  height: 44px;
  border-radius: var(--radius-sm, 8px);
  background: linear-gradient(90deg, var(--blue-100) 25%, var(--blue-150) 37%, var(--blue-100) 63%);
  background-size: 400% 100%;
  animation: panel-shimmer 1.4s ease infinite;
}

@keyframes panel-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

/* ---- Pengumuman ---- */
.announce {
  display: flex;
  gap: 10px;
}

.announce__icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--blue-100);
  color: var(--blue-900);
}

.announce__icon--warn {
  background: var(--blue-950, #000242);
  color: var(--white, #fff);
}

.announce__body {
  min-width: 0;
}

.announce__flag {
  display: block;
  font-size: 11.5px;
  color: var(--gray-500);
  margin-bottom: 2px;
}

.announce__title {
  margin: 0;
  font-size: 14px;
  line-height: 19px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
}

.announce__text {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 17px;
  color: var(--ink-700);
}

/* ---- Festival ---- */
.event {
  display: flex;
  align-items: center;
  gap: 12px;
}

.event__date {
  flex-shrink: 0;
  width: 48px;
  padding: 5px 0;
  border: 1px solid var(--blue-200);
  border-radius: var(--radius-sm, 8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.15;
}

.event__month {
  font-size: 10.5px;
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-caps, 0.5px);
  color: var(--blue-900);
}

.event__day {
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
}

.event__body {
  min-width: 0;
}

.event__name {
  margin: 0;
  font-size: 14px;
  line-height: 19px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
}

.event__place {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  font-size: 12px;
  color: var(--ink-700);
}

@media (max-width: 600px) {
  .panel {
    border-radius: var(--radius-lg);
    padding: 18px 16px;
  }

  .panel__title {
    font-size: 17px;
    margin-bottom: 14px;
  }
}
</style>
