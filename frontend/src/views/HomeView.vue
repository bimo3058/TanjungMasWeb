<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
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

// ==========================================
// 1. CUSTOM DIRECTIVE UNTUK ANIMASI MUNCUL
// ==========================================
const vSlideIn = {
  mounted(el: HTMLElement) {
    el.classList.add('anim-hidden')
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('anim-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )
    observer.observe(el)
  }
}

// ==========================================
// 2. LOGIKA AUTO-SCROLL (CAROUSEL)
// ==========================================
const wisataScrollRef = ref<HTMLElement | null>(null)
const umkmScrollRef = ref<HTMLElement | null>(null)
const autoScrollIntervals: ReturnType<typeof setInterval>[] = []

const setupAutoScroll = (containerRef: HTMLElement | null, delay: number) => {
  if (!containerRef) return
  
  const interval = setInterval(() => {
    // Cek apakah scroll sudah mencapai ujung kanan (dengan toleransi 10px)
    const isAtEnd = containerRef.scrollLeft + containerRef.clientWidth >= containerRef.scrollWidth - 10
    
    if (isAtEnd) {
      // Jika mentok kanan, kembali ke awal
      containerRef.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      // Geser ke kanan sejauh ukuran 1 kartu (sekitar 320px)
      containerRef.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }, delay)
  
  autoScrollIntervals.push(interval)
}

onMounted(() => {
  // Di ponsel kartu ditumpuk vertikal (lihat media query 600px), jadi tidak ada
  // carousel yang perlu digeser.
  if (window.matchMedia('(max-width: 600px)').matches) return

  // Berikan sedikit jeda agar data & DOM selesai dirender sebelum auto-scroll berjalan
  setTimeout(() => {
    setupAutoScroll(wisataScrollRef.value, 3500) // Geser wisata tiap 3.5 detik
    setupAutoScroll(umkmScrollRef.value, 4000)   // Geser UMKM tiap 4 detik
  }, 1500)
})

onBeforeUnmount(() => {
  autoScrollIntervals.forEach(clearInterval)
})
</script>

<template>
  <div>
    <!-- HERO SECTION -->
    <section
      class="hero"
      :style="{
        backgroundImage: `linear-gradient(90deg, rgba(0,2,66,.88) 0%, rgba(0,2,66,.62) 45%, rgba(4,13,122,.25) 100%), url(${heroImage})`,
      }"
    >
      <div class="hero__inner">
        <span class="hero__eyebrow" v-slide-in style="animation-delay: 100ms;">
          <span class="hero__eyebrow-dash" />{{ heroEyebrow }}
        </span>
        <h1 class="hero__title" v-slide-in style="animation-delay: 200ms;">{{ heroTitle }}</h1>
        <p class="hero__lead" v-slide-in style="animation-delay: 300ms;">{{ heroLead }}</p>
        <div class="hero__actions" v-slide-in style="animation-delay: 400ms;">
          <BaseButton variant="cta" class="hero__btn" @click="router.push({ name: 'wisata' })">
            Jelajahi Wisata
          </BaseButton>
          <BaseButton variant="ghost" class="hero__btn hero__btn--ghost" @click="router.push({ name: 'umkm' })">
            Lihat UMKM
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- STAT STRIP SECTION -->
    <div class="stat-strip" v-slide-in style="animation-delay: 500ms;">
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

    <!-- WISATA SECTION -->
    <section class="section">
      <div class="section__inner">
        <div v-slide-in>
          <SectionHeading
            title="Destinasi Wisata"
            action="Lihat semua"
            @action="router.push({ name: 'wisata' })"
          />
        </div>
        <div v-if="wisataLoading" class="card-slider">
          <div v-for="n in 4" :key="n" class="card-skeleton" />
        </div>
        <p v-else-if="wisataItems.length === 0" class="empty-message">
          Belum ada destinasi wisata yang ditampilkan.
        </p>
        
        <!-- WRAPPER AUTO-SCROLL -->
        <div v-else class="card-slider" ref="wisataScrollRef" v-slide-in>
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

    <!-- UMKM SECTION -->
    <section class="section section--tinted">
      <div class="section__inner">
        <div v-slide-in>
          <SectionHeading
            title="Pusat UMKM & Ekonomi Lokal"
            action="Lihat semua"
            @action="router.push({ name: 'umkm' })"
          />
        </div>
        <div v-if="umkmLoading" class="card-slider">
          <div v-for="n in 2" :key="n" class="card-skeleton card-skeleton--umkm" />
        </div>
        <p v-else-if="umkmItems.length === 0" class="empty-message">
          Belum ada produk UMKM yang ditampilkan.
        </p>

        <!-- WRAPPER AUTO-SCROLL -->
        <div v-else class="card-slider" ref="umkmScrollRef" v-slide-in>
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
        <div v-slide-in>
          <SectionHeading
            title="Berita & Kegiatan"
            action="Semua berita"
            @action="router.push({ name: 'berita' })"
          />
        </div>
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
            v-slide-in
            style="animation-delay: 0ms;"
            :image="beritaItems[0].gambar_utama"
            :category="beritaItems[0].kategori_berita?.nama"
            :date="beritaItems[0].tanggal_publikasi"
            :title="beritaItems[0].judul"
            :excerpt="beritaItems[0].konten"
            big
          />
          <div class="berita-grid__side">
            <NewsCard
              v-for="(item, index) in beritaItems.slice(1)"
              :key="item.id"
              v-slide-in
              :style="{ animationDelay: `${(index + 1) * 150}ms` }"
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
.anim-hidden {
  opacity: 0;
  animation-fill-mode: forwards; 
}

.anim-visible {
  animation-name: fadeUpScale;
  animation-duration: 0.8s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: forwards;
}

@keyframes fadeUpScale {
  0% {
    opacity: 0;
    transform: translateY(35px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ==========================================
   SLIDER OTOMATIS (CAROUSEL)
========================================== */
.card-slider {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding-bottom: 16px; /* Memberi ruang agar shadow tidak terpotong */
  
  /* Sembunyikan scrollbar bawaan browser agar rapi */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.card-slider::-webkit-scrollbar {
  display: none;
}

.card-slider > * {
  scroll-snap-align: start;
  flex: 0 0 calc(25% - 12px); /* Tampilkan 4 kartu berjajar di desktop */
}

/* ==========================================
   LAYOUT STYLES
========================================== */
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
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.empty-message {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--fs-md);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  /* Ubah ukuran kartu di tablet menjadi 2 per baris */
  .card-slider > * {
    flex: 0 0 calc(50% - 8px);
  }
  .berita-grid {
    grid-template-columns: 1fr;
  }
  .hero {
    padding: 52px 24px 80px;
  }
  .hero__title {
    font-size: 34px;
  }
  .section {
    padding: 36px 24px 40px;
  }
  .stat-strip {
    padding: 0 24px;
  }
}

@media (max-width: 600px) {
  /* Di ponsel kartu ditumpuk vertikal, bukan carousel — semua isi terlihat
     tanpa perlu menggeser ke samping. */
  .card-slider {
    flex-direction: column;
    gap: 14px;
    overflow-x: visible;
    scroll-snap-type: none;
    padding-bottom: 0;
  }
  .card-slider > * {
    flex: none;
    scroll-snap-align: none;
  }

  .hero {
    padding: 30px var(--mobile-gutter) 56px;
  }
  .hero__title {
    font-size: 29px;
    line-height: 1.12;
    text-wrap: balance;
  }
  .hero__lead {
    margin: 12px 0 20px;
    font-size: 14px;
  }
  .hero__actions {
    flex-direction: column;
    gap: 10px;
  }
  .hero__btn {
    width: 100%;
    justify-content: center;
    padding: 13px 24px !important;
  }

  .stat-strip {
    margin-top: -40px;
    padding: 0 var(--mobile-gutter);
  }
  .stat-strip__card {
    grid-template-columns: 1fr 1fr;
    border-radius: var(--radius-lg);
  }
  .stat-strip__item {
    padding: 16px 12px;
  }
  .stat-strip__item:nth-child(odd) {
    border-left: none;
  }
  .stat-strip__item:nth-child(even) {
    border-left: 1px solid var(--blue-100);
  }
  .stat-strip__item:nth-child(n + 3) {
    border-top: 1px solid var(--blue-100);
  }
  .stat-strip__value {
    font-size: 24px;
    line-height: 28px;
  }
  .stat-strip__label {
    font-size: 12px;
  }

  .section {
    padding: 28px var(--mobile-gutter) 8px;
  }
  .section--tinted {
    padding: 24px var(--mobile-gutter);
  }
  .berita-grid,
  .berita-grid__side {
    gap: 14px;
  }
}
</style>