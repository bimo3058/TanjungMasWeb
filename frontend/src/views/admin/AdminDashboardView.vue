<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plus, Waves, Newspaper, Store, Pencil, MapPin, Mail, Phone } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { useDashboardStats } from '@/composables/useDashboardStats'
import { useProfilDesa } from '@/composables/useProfilDesa'
import { formatRelativeIndonesia } from '@/utils/formatDate'
import heroFallback from '@/assets/design/hero-village.jpg'

const router = useRouter()
const { totalWisata, totalBerita, totalUmkm, totalDraft, activity, loading } = useDashboardStats()
const { profil, loading: profilLoading } = useProfilDesa()
</script>

<template>
  <div class="dashboard">
    <div class="hero">
      <h1 class="hero__title">Selamat Datang, Admin!</h1>
      <p class="hero__lead">
        Kelola wisata, UMKM, dan berita Desa Wisata Tanjung Mas dari satu portal.
      </p>
      <div class="hero__actions">
        <BaseButton variant="accent" size="sm" @click="router.push({ name: 'admin-berita-baru' })">
          <template #icon><Plus :size="15" /></template>
          Buat Berita
        </BaseButton>
        <BaseButton variant="ghost" size="sm" @click="router.push({ name: 'admin-wisata-baru' })">
          <template #icon><Plus :size="15" /></template>
          Tambah Wisata
        </BaseButton>
      </div>
    </div>

    <div class="stats">
      <StatCard label="TOTAL DESTINASI" :value="totalWisata">
        <template #icon><Waves :size="18" /></template>
      </StatCard>
      <StatCard label="PRODUK UMKM" :value="totalUmkm">
        <template #icon><Store :size="16" /></template>
      </StatCard>
      <StatCard label="ARTIKEL BERITA" :value="totalBerita">
        <template #icon><Newspaper :size="16" /></template>
      </StatCard>
      <StatCard label="DRAF BELUM TAYANG" :value="totalDraft">
        <template #icon><Pencil :size="16" /></template>
      </StatCard>
    </div>

    <div class="lower">
      <div class="activity">
        <div class="activity__header">
          <h2 class="activity__title">Aktivitas Terbaru</h2>
        </div>

        <div v-if="loading" class="activity__skeleton">
          <div v-for="n in 4" :key="n" class="activity__skeleton-row" />
        </div>
        <p v-else-if="activity.length === 0" class="activity__empty">Belum ada aktivitas.</p>
        <div v-else class="activity__scroll">
          <table class="activity__table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Jenis</th>
                <th>Status</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in activity" :key="`${item.source}-${item.id}`">
                <td class="activity__cell-title">{{ item.title }}</td>
                <td><BaseBadge variant="blue" dense>{{ item.source }}</BaseBadge></td>
                <td><BaseBadge :variant="item.statusVariant" dense>{{ item.status }}</BaseBadge></td>
                <td class="activity__cell-time">{{ formatRelativeIndonesia(item.updatedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="profil-card">
        <div class="profil-card__header">
          <h2 class="profil-card__title">Profil Desa</h2>
          <RouterLink :to="{ name: 'admin-profil' }" class="profil-card__link">Perbarui</RouterLink>
        </div>
        <div v-if="profilLoading" class="profil-card__loading">Memuat...</div>
        <div v-else class="profil-card__body">
          <img :src="profil?.gambar_profil || heroFallback" class="profil-card__image" alt="" />
          <div class="profil-card__name">{{ profil?.nama_desa || 'Desa Wisata Tanjung Mas' }}</div>
          <div v-if="profil?.alamat_kantor" class="profil-card__row">
            <MapPin :size="14" class="profil-card__icon" />
            <span>{{ profil.alamat_kantor }}</span>
          </div>
          <div v-if="profil?.kontak_email" class="profil-card__row">
            <Mail :size="14" class="profil-card__icon" />
            <span>{{ profil.kontak_email }}</span>
          </div>
          <div v-if="profil?.kontak_telepon" class="profil-card__row">
            <Phone :size="14" class="profil-card__icon" />
            <span>{{ profil.kontak_telepon }}</span>
          </div>
          <div v-if="profil?.updated_at" class="profil-card__footer">
            Diperbarui {{ formatRelativeIndonesia(profil.updated_at) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px 20px;
  font-family: var(--font-sans);
  min-height: 0;
  box-sizing: border-box;
}

.hero {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--blue-900);
  box-shadow: var(--shadow-btn);
  padding: 18px 22px;
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.hero__title {
  margin: 0;
  font-size: 20px;
  line-height: 26px;
  font-weight: var(--fw-bold);
}

.hero__lead {
  margin: 3px 0 0;
  font-size: 13px;
  line-height: 19px;
  color: rgba(190, 194, 255, 0.9);
}

.hero__actions {
  display: flex;
  gap: 10px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.lower {
  flex: 1;
  display: flex;
  gap: 14px;
  align-items: stretch;
  min-height: 0;
}

.activity {
  flex: 1.7;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
}

.activity__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--blue-200);
}

.activity__title {
  margin: 0;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.activity__scroll {
  overflow-x: auto;
  flex: 1;
}

.activity__table {
  width: 100%;
  border-collapse: collapse;
}

.activity__table th {
  text-align: left;
  padding: 9px 14px;
  font-size: 11px;
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
  color: var(--ink-700);
  white-space: nowrap;
}

.activity__table td {
  padding: 8px 14px;
  border-top: 1px solid var(--blue-200);
  font-size: 13px;
}

.activity__cell-title {
  font-weight: var(--fw-semibold);
  color: var(--ink-900);
}

.activity__cell-time {
  color: var(--ink-700);
  font-size: 12.5px;
  white-space: nowrap;
}

.activity__skeleton {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
}

.activity__skeleton-row {
  height: 18px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--blue-100) 25%, var(--blue-150) 37%, var(--blue-100) 63%);
  background-size: 400% 100%;
  animation: dashboard-shimmer 1.4s ease infinite;
}

@keyframes dashboard-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.activity__empty {
  padding: 24px 16px;
  margin: 0;
  text-align: center;
  color: var(--text-muted);
}

.profil-card {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
}

.profil-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--blue-200);
}

.profil-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.profil-card__link {
  font-size: 12.5px;
  font-weight: var(--fw-semibold);
  color: var(--blue-900);
  cursor: pointer;
  text-decoration: none;
}

.profil-card__loading {
  padding: 16px;
  color: var(--text-muted);
}

.profil-card__body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profil-card__image {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.profil-card__name {
  font-size: 13.5px;
  font-weight: var(--fw-semibold);
  color: var(--ink-900);
}

.profil-card__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  line-height: 17px;
  color: var(--ink-700);
}

.profil-card__icon {
  color: var(--blue-900);
  flex-shrink: 0;
  margin-top: 1px;
}

.profil-card__footer {
  border-top: 1px solid var(--blue-200);
  padding-top: 8px;
  margin-top: auto;
  font-size: 11.5px;
  color: var(--gray-500);
}
</style>
