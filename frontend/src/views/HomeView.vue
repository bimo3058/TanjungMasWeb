<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import WisataCard from '@/components/ui/WisataCard.vue'
import UmkmCard from '@/components/ui/UmkmCard.vue'
import NewsCard from '@/components/ui/NewsCard.vue'
import heroVillage from '@/assets/design/hero-village.jpg'
import {
  useFeaturedWisata,
  useFeaturedUmkm,
  useFeaturedBerita,
} from '@/composables/useFeaturedListings'
import { usePublicStats } from '@/composables/usePublicStats'
import { useProfilDesa } from '@/composables/useProfilDesa'

const router = useRouter()

const { items: wisataItems, loading: wisataLoading } = useFeaturedWisata()
const { items: umkmItems, loading: umkmLoading } = useFeaturedUmkm()
const { items: beritaItems, loading: beritaLoading } = useFeaturedBerita()
const { totalWisata, totalUmkm, totalBerita, loading: statsLoading } = usePublicStats()
const { profil } = useProfilDesa()

const heroEyebrow = computed(() => profil.value?.hero_eyebrow || 'Semarang · Jawa Tengah')
const heroTitle = computed(
  () => profil.value?.hero_title || 'Desa Wisata Kampung Nelayan Bahari Tambaklorok',
)
const heroLead = computed(
  () =>
    profil.value?.hero_lead ||
    'Kehidupan pesisir yang autentik — wisata bahari, cita rasa laut, dan kehangatan masyarakat nelayan Semarang.',
)
const heroImage = computed(() => profil.value?.hero_image || heroVillage)
</script>

<template>
  <div>
    <section
      class="hero"
      :style="{
        backgroundImage: `linear-gradient(90deg, rgba(0,2,66,.88) 0%, rgba(0,2,66,.62) 45%, rgba(4,13,122,.25) 100%), url(${heroImage})`,
      }"
    >
      <div class="hero__inner">
        <span class="hero__eyebrow"><span class="hero__eyebrow-dash" />{{ heroEyebrow }}</span>
        <h1 class="hero__title">{{ heroTitle }}</h1>
        <p class="hero__lead">{{ heroLead }}</p>
        <div class="hero__actions">
          <BaseButton variant="cta" class="hero__btn" @click="router.push({ name: 'wisata' })">
            Jelajahi Wisata
          </BaseButton>
          <BaseButton variant="ghost" class="hero__btn hero__btn--ghost" @click="router.push({ name: 'umkm' })">
            Lihat UMKM
          </BaseButton>
        </div>
      </div>
    </section>

    <div class="stat-strip">
      <div class="stat-strip__card">
        <div class="stat-strip__item">
          <div class="stat-strip__value">{{ statsLoading ? '–' : totalWisata }}</div>
          <div class="stat-strip__label">Destinasi Wisata</div>
        </div>
        <div class="stat-strip__item">
          <div class="stat-strip__value">{{ statsLoading ? '–' : totalUmkm }}</div>
          <div class="stat-strip__label">Produk UMKM</div>
        </div>
        <div class="stat-strip__item">
          <div class="stat-strip__value">16</div>
          <div class="stat-strip__label">RW Binaan</div>
        </div>
        <div class="stat-strip__item">
          <div class="stat-strip__value">{{ statsLoading ? '–' : totalBerita }}</div>
          <div class="stat-strip__label">Artikel Berita</div>
        </div>
      </div>
    </div>

    <section class="section">
      <div class="section__inner">
        <SectionHeading
          eyebrow="Jelajahi"
          title="Destinasi Wisata"
          action="Lihat semua"
          @action="router.push({ name: 'wisata' })"
        />
        <div v-if="wisataLoading" class="card-grid card-grid--4">
          <div v-for="n in 4" :key="n" class="card-skeleton" />
        </div>
        <p v-else-if="wisataItems.length === 0" class="empty-message">
          Belum ada destinasi wisata yang ditampilkan.
        </p>
        <div v-else class="card-grid card-grid--4">
          <WisataCard
            v-for="item in wisataItems"
            :key="item.id"
            :image="item.gambar_utama"
            :category="item.kategori_wisata?.nama"
            :title="item.nama"
            :description="item.deskripsi"
            :address="item.alamat_lengkap"
            :harga="item.harga_tiket"
            :jam="item.jam_operasional"
          />
        </div>
      </div>
    </section>

    <section class="section section--tinted">
      <div class="section__inner">
        <SectionHeading
          eyebrow="Ekonomi Lokal"
          title="Produk UMKM Unggulan"
          action="Lihat semua"
          @action="router.push({ name: 'umkm' })"
        />
        <div v-if="umkmLoading" class="card-grid card-grid--2">
          <div v-for="n in 4" :key="n" class="card-skeleton card-skeleton--umkm" />
        </div>
        <p v-else-if="umkmItems.length === 0" class="empty-message">
          Belum ada produk UMKM yang ditampilkan.
        </p>
        <div v-else class="card-grid card-grid--2">
          <UmkmCard
            v-for="item in umkmItems"
            :key="item.id"
            :image="item.gambar_utama"
            :category="item.kategori_umkm?.nama"
            :title="item.nama_usaha"
            :description="item.deskripsi"
            :address="item.alamat_lengkap"
          />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section__inner">
        <SectionHeading
          eyebrow="Kabar Desa"
          title="Berita & Kegiatan"
          action="Semua berita"
          @action="router.push({ name: 'berita' })"
        />
        <div v-if="beritaLoading" class="berita-grid">
          <div class="card-skeleton card-skeleton--big" />
          <div class="berita-grid__side">
            <div v-for="n in 2" :key="n" class="card-skeleton card-skeleton--row" />
          </div>
        </div>
        <p v-else-if="beritaItems.length === 0" class="empty-message">
          Belum ada berita yang ditampilkan.
        </p>
        <div v-else class="berita-grid">
          <NewsCard
            :image="beritaItems[0].gambar_utama"
            :category="beritaItems[0].kategori_berita?.nama"
            :date="beritaItems[0].tanggal_publikasi"
            :title="beritaItems[0].judul"
            :excerpt="beritaItems[0].konten"
            big
          />
          <div class="berita-grid__side">
            <NewsCard
              v-for="item in beritaItems.slice(1)"
              :key="item.id"
              :image="item.gambar_utama"
              :category="item.kategori_berita?.nama"
              :date="item.tanggal_publikasi"
              :title="item.judul"
              :excerpt="item.konten"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  padding: 64px 36px 88px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  font-family: var(--font-sans);
}

.hero__inner {
  max-width: 1160px;
  margin: 0 auto;
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--gold-400);
}

.hero__eyebrow-dash {
  width: 22px;
  height: 2px;
  background: var(--gold-400);
  display: inline-block;
}

.hero__title {
  margin: 14px 0 0;
  max-width: 640px;
  font-size: 42px;
  line-height: 1.08;
  font-weight: var(--fw-bold);
  color: var(--white);
}

.hero__lead {
  margin: 16px 0 26px;
  max-width: 520px;
  font-size: 16px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
}

.hero__actions {
  display: flex;
  gap: 12px;
}

.hero__btn {
  padding: 11px 24px !important;
  font-size: 15px !important;
}

.hero__btn--ghost {
  border-radius: var(--radius-pill) !important;
}

.stat-strip {
  max-width: 1160px;
  margin: -44px auto 0;
  position: relative;
  z-index: 2;
  padding: 0 36px;
  font-family: var(--font-sans);
}

.stat-strip__card {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #fff;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-pop);
  overflow: hidden;
}

.stat-strip__item {
  text-align: center;
  padding: 18px 12px;
  border-left: 1px solid var(--blue-100);
}

.stat-strip__item:first-child {
  border-left: none;
}

.stat-strip__value {
  font-size: 26px;
  line-height: 30px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
}

.stat-strip__label {
  font-size: 12.5px;
  font-weight: var(--fw-medium);
  color: var(--ink-700);
  margin-top: 2px;
}

.section {
  padding: 40px 36px 44px;
  font-family: var(--font-sans);
}

.section--tinted {
  background: var(--blue-50);
}

.section__inner {
  max-width: 1160px;
  margin: 0 auto;
}

.section__inner > :first-child {
  margin-bottom: 20px;
}

.card-grid {
  display: grid;
  gap: 16px;
}

.card-grid--4 {
  grid-template-columns: repeat(4, 1fr);
}

.card-grid--2 {
  grid-template-columns: 1fr 1fr;
}

.berita-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 16px;
}

.berita-grid__side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-skeleton {
  height: 260px;
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--blue-100) 25%, var(--blue-150) 37%, var(--blue-100) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

.card-skeleton--umkm {
  height: 118px;
}

.card-skeleton--big {
  height: 100%;
}

.card-skeleton--row {
  height: 128px;
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

@media (max-width: 900px) {
  .card-grid--4,
  .card-grid--2,
  .berita-grid {
    grid-template-columns: 1fr;
  }
}
</style>
