<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import ContentCard from '@/components/ui/ContentCard.vue'
import heroVillage from '@/assets/design/hero-village.jpg'
import { useFeaturedWisata, useFeaturedUmkm } from '@/composables/useFeaturedListings'

const router = useRouter()

const { items: wisataItems, loading: wisataLoading } = useFeaturedWisata()
const { items: umkmItems, loading: umkmLoading } = useFeaturedUmkm()

const STATS: Array<[string, string]> = [
  ['3', 'Destinasi Wisata'],
  ['45+', 'Produk UMKM'],
  ['16', 'RW Binaan'],
  ['2026', 'Sejak'],
]
</script>

<template>
  <div>
    <section
      class="hero"
      :style="{
        backgroundImage: `linear-gradient(rgba(4,13,122,.55),rgba(0,2,66,.65)), url(${heroVillage})`,
      }"
    >
      <span class="hero__eyebrow">Semarang · Jawa Tengah</span>
      <h1 class="hero__title">DESA WISATA KAMPUNG NELAYAN BAHARI TAMBAKLOROK</h1>
      <p class="hero__lead">
        Menyapa kehidupan pesisir yang autentik — jelajahi wisata bahari, cita rasa laut, dan
        kehangatan masyarakat nelayan Semarang.
      </p>
      <div class="hero__actions">
        <BaseButton variant="cta" @click="router.push({ name: 'wisata' })">
          Pelajari lebih lanjut
        </BaseButton>
        <BaseButton variant="ghost" class="hero__ghost-btn" @click="router.push({ name: 'umkm' })">
          Lihat UMKM
        </BaseButton>
      </div>
    </section>

    <div class="stat-strip">
      <div v-for="[value, label] in STATS" :key="label" class="stat-strip__item">
        <div class="stat-strip__value">{{ value }}</div>
        <div class="stat-strip__label">{{ label }}</div>
      </div>
    </div>

    <section class="section section--tinted">
      <SectionHeading
        eyebrow="Jelajahi"
        title="Destinasi Wisata"
        lead="Pengalaman bahari otentik di pesisir Tambaklorok."
        class="section__heading"
      />
      <div v-if="wisataLoading" class="card-grid">
        <div v-for="n in 3" :key="n" class="card-skeleton" />
      </div>
      <p v-else-if="wisataItems.length === 0" class="empty-message">
        Belum ada destinasi wisata yang ditampilkan.
      </p>
      <div v-else class="card-grid">
        <ContentCard
          v-for="item in wisataItems"
          :key="item.id"
          :image="item.gambar_utama"
          :category="item.kategori_wisata?.nama"
          :title="item.nama"
          :description="item.deskripsi"
          :address="item.alamat_lengkap"
          class="card-grid__item"
        />
      </div>
    </section>

    <section class="section">
      <SectionHeading
        eyebrow="Ekonomi Lokal"
        title="Produk UMKM Unggulan"
        lead="Dukung perekonomian warga dengan produk khas Kampung Nelayan Bahari."
        class="section__heading"
      />
      <div v-if="umkmLoading" class="card-grid">
        <div v-for="n in 3" :key="n" class="card-skeleton" />
      </div>
      <p v-else-if="umkmItems.length === 0" class="empty-message">
        Belum ada produk UMKM yang ditampilkan.
      </p>
      <div v-else class="card-grid">
        <ContentCard
          v-for="item in umkmItems"
          :key="item.id"
          :image="item.gambar_utama"
          :category="item.kategori_umkm?.nama"
          :title="item.nama_usaha"
          :description="item.deskripsi"
          :address="item.alamat_lengkap"
          class="card-grid__item"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 40px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.hero__eyebrow {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold-400);
  margin-bottom: 20px;
}

.hero__title {
  margin: 0;
  max-width: 1100px;
  font-family: var(--font-sans);
  font-size: var(--fs-hero);
  line-height: 1.05;
  font-weight: var(--fw-bold);
  color: var(--white);
}

.hero__lead {
  margin: 24px 0 36px;
  max-width: 720px;
  font-family: var(--font-sans);
  font-size: var(--fs-lg);
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
}

.hero__actions {
  display: flex;
  gap: 16px;
}

.hero__ghost-btn {
  padding: 15px 28px !important;
  font-size: 18px !important;
  border-radius: var(--radius-pill) !important;
}

.stat-strip {
  display: flex;
  justify-content: center;
  gap: 64px;
  flex-wrap: wrap;
  padding: 40px 40px;
  background: var(--blue-900);
}

.stat-strip__item {
  text-align: center;
  font-family: var(--font-sans);
}

.stat-strip__value {
  font-size: var(--fs-display);
  font-weight: var(--fw-bold);
  color: var(--gold-400);
}

.stat-strip__label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.section {
  padding: 72px 40px;
}

.section--tinted {
  background: var(--blue-50);
}

.section__heading {
  margin-bottom: 44px;
}

.card-grid {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.card-grid__item {
  width: 400px;
  max-width: 100%;
}

.card-skeleton {
  width: 400px;
  max-width: 100%;
  height: 340px;
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, var(--blue-100) 25%, var(--blue-150) 37%, var(--blue-100) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.empty-message {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--fs-md);
}
</style>
