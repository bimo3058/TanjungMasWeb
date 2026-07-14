<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plus, Waves, Newspaper, Store, Pencil, ArrowRight, Map } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { useDashboardStats } from '@/composables/useDashboardStats'
import { formatRelativeIndonesia } from '@/utils/formatDate'
import logokknt from '@/assets/design/logokknt.png'

const router = useRouter()
const { totalWisata, totalBerita, totalUmkm, activity, loading } = useDashboardStats()

const getActivityIcon = (source: string) => {
  const type = source.toLowerCase()
  if (type === 'berita') return Newspaper
  if (type === 'umkm') return Store
  return Waves
}


const handleEdit = (item: any) => {
  const type = item.source.toLowerCase()
  let routePrefix = ''
  
  if (type === 'berita') {
    routePrefix = 'berita'
  } else if (type === 'umkm') {
    routePrefix = 'umkm'
  } else {
    routePrefix = 'wisata'
  }
  
  router.push(`/admin/${routePrefix}/${item.id}`)
}
</script>

<template>
  <div class="dashboard">
    
    <!-- HERO SECTION -->
    <div class="hero">
      <div class="hero__content">
        <h1 class="hero__title">Selamat Datang, Admin!</h1>
        <p class="hero__lead">
          Kelola informasi desa wisata, perbarui berita, dan pantau perkembangan UMKM Tanjung Mas melalui portal terpadu ini.
        </p>
        <div class="hero__actions">
          <button class="btn btn-yellow" @click="router.push({ name: 'admin-berita-baru' })">
            <Plus :size="18" /> Buat Berita Baru
          </button>
          <button class="btn btn-outline" @click="router.push({ name: 'admin-wisata-baru' })">
            <Map :size="18" /> Tambah Wisata
          </button>
        </div>
      </div>
      <div class="hero__image-wrapper">
        <img :src="logokknt" alt="Ilustrasi Tanjung Mas" class="hero__image" />
      </div>
    </div>

    <!-- STATS SECTION -->
    <div class="stats">
      <StatCard label="TOTAL DESTINASI" :value="totalWisata">
        <template #icon><Waves :size="20" /></template>
      </StatCard>
      <StatCard label="ARTIKEL BERITA" :value="totalBerita">
        <template #icon><Newspaper :size="20" /></template>
      </StatCard>
      <StatCard label="PRODUK UMKM" :value="totalUmkm">
        <template #icon><Store :size="20" /></template>
      </StatCard>
    </div>

    <!-- RECENT ACTIVITY SECTION -->
    <div class="activity">
      <div class="activity__header">
        <h2 class="activity__title"> Aktivitas Terbaru</h2>
        <button class="activity__view-all" @click="router.push('/admin/aktivitas')">
          View All <ArrowRight :size="16" />
        </button>
      </div>

      <div v-if="loading" class="activity__skeleton">
        <div v-for="n in 4" :key="n" class="activity__skeleton-row" />
      </div>
      <p v-else-if="activity.length === 0" class="activity__empty">Belum ada aktivitas.</p>

      <template v-else>
        <!-- Versi ponsel: tabel aktivitas diringkas jadi daftar baris. -->
        <div class="activity__cards">
          <div
            v-for="item in activity"
            :key="`card-${item.source}-${item.id}`"
            class="activity-row"
          >
            <div class="activity-row__main">
              <div class="activity-row__title">{{ item.title }}</div>
              <div class="activity-row__meta">
                <BaseBadge variant="blue" dense>{{ item.source }}</BaseBadge>
                <span class="activity-row__time">{{ formatRelativeIndonesia(item.updatedAt) }}</span>
              </div>
            </div>
            <BaseBadge :variant="item.statusVariant" dense>{{ item.status }}</BaseBadge>
            <button class="action-btn" title="Edit" @click="handleEdit(item)">
              <Pencil :size="15" />
            </button>
          </div>
        </div>

        <div class="activity__scroll">
        <table class="activity__table">
          <thead>
            <tr>
              <th>Tipe</th>
              <th>Judul / Item</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in activity" :key="`${item.source}-${item.id}`">
              
              <!-- Kolom Tipe -->
              <td>
                <div class="activity__cell-type">
                  <div class="type-icon-wrapper">
                    <component :is="getActivityIcon(item.source)" :size="14" class="type-icon" />
                  </div>
                  {{ item.source }}
                </div>
              </td>
              
              <!-- Kolom Judul -->
              <td class="activity__cell-title">{{ item.title }}</td>
              
              <!-- Kolom Status -->
              <td>
                <BaseBadge :variant="item.statusVariant" class="custom-badge">
                  {{ item.status }}
                </BaseBadge>
              </td>
              
              <!-- Kolom Tanggal -->
              <td class="activity__cell-time">{{ formatRelativeIndonesia(item.updatedAt) }}</td>
              
              <!-- Kolom Aksi -->
              <td>
                <button class="action-btn" title="Edit" @click="handleEdit(item)">
                  <Pencil :size="16" />
                </button>
              </td>
              
            </tr>
          </tbody>
        </table>
        </div>
      </template>
    </div>

  </div>
</template>

<style scoped>
/* GENERAL LAYOUT */
.dashboard {
  /* Tumbuh mengisi area gulir, tapi tak pernah dimampatkan saat konten panjang —
     inilah yang sebelumnya bikin isi kartu terpotong dan scroll tidak jalan. */
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Disamakan dengan halaman admin lain (.page) supaya dashboard tidak jadi
     satu-satunya yang menjorok lebih dalam dari tepi. */
  padding: 16px 20px 20px;
  font-family: 'Poppins', sans-serif;
  background-color: #F8F9FF;
}

/* HERO SECTION */
.hero {
  background-color: #1a1b5c; 
  border-radius: 12px;
  padding: 32px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
}

.hero__content {
  max-width: 60%;
  z-index: 2;
}

.hero__title {
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.hero__lead {
  color: #a4a8cc;
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 24px 0;
  max-width: 90%;
}

.hero__actions {
  display: flex;
  gap: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-yellow {
  background-color: #f7ca3e;
  color: #1a1b5c;
}

.btn-yellow:hover {
  background-color: #e5b935;
}

.btn-outline {
  background-color: #262973;
  color: #ffffff;
  border: 1px solid #3d4196;
}

.btn-outline:hover {
  background-color: #31358a;
}

.hero__image-wrapper {
  z-index: 1;
}

.hero__image {
  height: 160px;
  width: auto;
  object-fit: contain;
}

/* STATS SECTION */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* ACTIVITY SECTION */
.activity {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  border: 1px solid #eef0f6;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.activity__header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eef0f6;
}

.activity__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0b1134;
}

.activity__view-all {
  background: transparent;
  border: none;
  color: #1a1b5c;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.activity__view-all:hover {
  text-decoration: underline;
}

.activity__scroll {
  width: 100%;
  overflow-x: auto;
}

.activity__table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.activity__table th {
  background-color: #f6f8fb;
  color: #5e6678;
  font-size: 12px;
  font-weight: 700;
  padding: 14px 24px;
}

.activity__table td {
  padding: 16px 24px;
  border-bottom: 1px solid #eef0f6;
  font-size: 14px;
  color: #3b4256;
}

.activity__table tbody tr:last-child td {
  border-bottom: none;
}

.activity__cell-type {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #5e6678;
  font-weight: 500;
}

.type-icon-wrapper {
  background-color: #e8ecf8;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b508f;
}

.activity__cell-title {
  font-weight: 500;
  color: #0b1134;
}

.activity__cell-time {
  color: #7b8293;
}


.custom-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* ACTION BUTTON */
.action-btn {
  background: transparent;
  border: none;
  color: #7b8293;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: color 0.2s ease;
}

.action-btn:hover {
  color: #1a1b5c;
}

/* LOADING SKELETON */
.activity__skeleton {
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 12px;
}

.activity__skeleton-row {
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e1e4e8 37%, #f0f2f5 63%);
  background-size: 400% 100%;
  animation: dashboard-shimmer 1.4s ease infinite;
}

@keyframes dashboard-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.activity__empty {
  padding: 32px;
  text-align: center;
  color: #7b8293;
}

/* DAFTAR AKTIVITAS VERSI PONSEL */
.activity__cards {
  display: none;
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-top: 1px solid #eef0f6;
}

.activity-row:first-child {
  border-top: none;
}

.activity-row__main {
  flex: 1;
  min-width: 0;
}

.activity-row__title {
  font-size: 13px;
  line-height: 17px;
  font-weight: 600;
  color: #0b1134;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-row__meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 3px;
}

.activity-row__time {
  font-size: 11px;
  color: var(--gray-500);
}

/* RESPONSIVE DESIGN */
@media (max-width: 1024px) {
  .hero {
    flex-direction: column;
    text-align: center;
    gap: 32px;
  }
  .hero__content {
    max-width: 100%;
  }
  .hero__lead {
    margin: 0 auto 24px auto;
  }
  .hero__actions {
    justify-content: center;
  }
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard {
    gap: 14px;
    padding: 14px var(--mobile-gutter) 22px;
  }

  /* Banner sambutan: ilustrasi dilepas agar teks + aksi muat di satu layar. */
  .hero {
    flex-direction: column;
    align-items: stretch;
    text-align: left;
    gap: 0;
    padding: 16px 18px;
    border-radius: var(--radius-lg);
  }
  .hero__image-wrapper {
    display: none;
  }
  .hero__title {
    font-size: 19px;
    line-height: 24px;
    margin-bottom: 4px;
  }
  .hero__lead {
    margin: 0 0 14px;
    max-width: 100%;
    font-size: 12.5px;
    line-height: 18px;
  }
  .hero__actions {
    justify-content: flex-start;
    gap: 9px;
  }
  .btn {
    flex: 1;
    justify-content: center;
    padding: 10px 12px;
    font-size: 12.5px;
  }

  /* Petak statistik 2 kolom — angka tetap terbaca di lebar ponsel. */
  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 11px;
  }

  /* Di petak sempit angka didahulukan, label menyusul di bawahnya; urutan
     StatCard desktop (label dulu) membuat angka jatuh tidak sejajar. */
  .stats :deep(.stat-card) {
    padding: 13px 14px;
    gap: 11px;
  }

  .stats :deep(.stat-card__text) {
    display: flex;
    flex-direction: column-reverse;
  }

  .stats :deep(.stat-card__value) {
    font-size: 22px;
    line-height: 26px;
  }

  .stats :deep(.stat-card__label) {
    font-size: 10px;
    line-height: 13px;
  }

  .activity__header {
    padding: 12px 16px;
  }
  .activity__title {
    font-size: 15px;
  }

  .activity__scroll {
    display: none;
  }
  .activity__cards {
    display: block;
  }
}
</style>