<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Clock, ExternalLink, MapPin, Mountain, Ticket } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import PhotoGallery from '@/components/ui/PhotoGallery.vue'
import WisataCard from '@/components/ui/WisataCard.vue'
import { fetchWisataBySlug, fetchWisataLainnya } from '@/composables/usePublicCatalog'
import type { Wisata, WisataDetail } from '@/types/wisata'

const route = useRoute()

const wisata = ref<WisataDetail | null>(null)
const lainnya = ref<Wisata[]>([])
const loading = ref(true)

const paragraphs = computed(() =>
  (wisata.value?.deskripsi ?? '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean),
)

// Hanya fakta yang terisi yang ditampilkan — baris kosong bertuliskan "—"
// membuat halaman terasa belum jadi.
const facts = computed(() => {
  const item = wisata.value
  if (!item) return []

  return [
    { icon: Ticket, label: 'Harga Tiket', value: item.harga_tiket },
    { icon: Clock, label: 'Jam Operasional', value: item.jam_operasional },
    { icon: MapPin, label: 'Alamat', value: item.alamat_lengkap },
  ].filter((fact) => !!fact.value)
})

async function load(slug: string) {
  loading.value = true
  wisata.value = await fetchWisataBySlug(slug)
  loading.value = false
  window.scrollTo({ top: 0 })

  // Menyusul setelah isi utamanya tampil — pembaca tidak perlu menunggu bagian
  // yang belum tentu ia gulir sampai ke sana.
  lainnya.value = wisata.value ? await fetchWisataLainnya(wisata.value.id) : []
}

watch(() => route.params.slug, (slug) => load(String(slug)), { immediate: true })
</script>

<template>
  <div class="detail">
    <div class="detail__inner">
      <RouterLink :to="{ name: 'wisata' }" class="detail__back">
        <ArrowLeft :size="16" />
        Kembali ke Wisata
      </RouterLink>

      <div v-if="loading" class="detail__skeleton">
        <div class="detail__skeleton-hero" />
        <div class="detail__skeleton-line" />
        <div class="detail__skeleton-line detail__skeleton-line--short" />
      </div>

      <p v-else-if="!wisata" class="detail__empty">
        Destinasi wisata tidak ditemukan atau sudah tidak ditampilkan.
      </p>

      <template v-else>
        <article v-slide-in class="card">
          <div
            class="card__hero"
            :style="wisata.gambar_utama ? { backgroundImage: `url(${wisata.gambar_utama})` } : undefined"
          >
            <Mountain v-if="!wisata.gambar_utama" :size="48" color="var(--blue-300)" />
            <BaseBadge v-if="wisata.kategori_wisata?.nama" variant="accent" class="card__badge">
              {{ wisata.kategori_wisata.nama }}
            </BaseBadge>
          </div>

          <div class="card__body">
            <h1 class="card__title">{{ wisata.nama }}</h1>

            <ul v-if="facts.length > 0" class="facts">
              <li v-for="fact in facts" :key="fact.label" class="fact">
                <span class="fact__icon"><component :is="fact.icon" :size="15" /></span>
                <span class="fact__text">
                  <span class="fact__label">{{ fact.label }}</span>
                  <span class="fact__value">{{ fact.value }}</span>
                </span>
              </li>
            </ul>

            <div v-if="paragraphs.length > 0" class="content">
              <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
            </div>

            <a
              v-if="wisata.lokasi_maps_url"
              class="maps"
              :href="wisata.lokasi_maps_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin :size="15" />
              Buka di Google Maps
              <ExternalLink :size="14" />
            </a>
          </div>
        </article>

        <section v-if="wisata.galeri_wisata.length > 0" v-slide-in class="gallery">
          <h2 class="gallery__title">Galeri Foto</h2>
          <PhotoGallery :photos="wisata.galeri_wisata" />
        </section>

        <section v-if="lainnya.length > 0" class="related">
          <h2 class="related__title">Destinasi Lainnya</h2>
          <div class="related__grid">
            <WisataCard
              v-for="(item, index) in lainnya"
              :key="item.id"
              v-slide-in
              :style="{ animationDelay: `${index * 90}ms` }"
              :image="item.gambar_utama"
              :category="item.kategori_wisata?.nama"
              :title="item.nama"
              :description="item.deskripsi"
              :address="item.alamat_lengkap"
              :harga="item.harga_tiket"
              :jam="item.jam_operasional"
              :to="{ name: 'wisata-detail', params: { slug: item.slug } }"
            />
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.detail {
  padding: 28px 36px 56px;
  background: var(--blue-50);
  font-family: var(--font-sans);
  min-height: 60vh;
}

.detail__inner {
  max-width: var(--content-max);
  margin: 0 auto;
}

.detail__back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 18px;
  font-size: 13px;
  font-weight: var(--fw-semibold);
  color: var(--blue-900);
  text-decoration: none;
}

.detail__back:hover {
  text-decoration: underline;
}

.detail__empty {
  padding: 48px 0;
  text-align: center;
  color: var(--text-muted);
}

/* Kartu isi tidak ikut selebar kanvas: baris teks sepanjang 1280px hampir
   mustahil diikuti mata. Lebar kanvas dipakai galeri & "Destinasi Lainnya". */
.card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  overflow: hidden;
  max-width: 1040px;
  margin: 0 auto;
}

.card__hero {
  position: relative;
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--blue-100);
  background-size: cover;
  background-position: center;
}

.card__badge {
  position: absolute;
  top: 14px;
  left: 14px;
}

.card__body {
  padding: 26px 30px 30px;
}

.card__title {
  margin: 0 0 18px;
  font-size: 28px;
  line-height: 36px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
}

.facts {
  list-style: none;
  margin: 0 0 20px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--blue-50);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.fact {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.fact__icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--blue-100);
  color: var(--blue-900);
}

.fact__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fact__label {
  font-size: 11px;
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-caps, 0.5px);
  text-transform: uppercase;
  color: var(--gray-500);
}

.fact__value {
  font-size: 13.5px;
  line-height: 19px;
  color: var(--ink-900);
  overflow-wrap: anywhere;
}

/* Baris teks dibatasi ~70 karakter agar mata tidak kehilangan jejak baris. */
.content {
  max-width: 70ch;
}

.content p {
  margin: 0 0 14px;
  font-size: 15px;
  line-height: 25px;
  color: var(--ink-900);
  white-space: pre-line;
}

.maps {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-sm, 8px);
  background: var(--blue-950, #000242);
  color: var(--white, #fff);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  text-decoration: none;
}

.maps:hover {
  opacity: 0.9;
}

.gallery {
  margin-top: 26px;
}

.gallery__title {
  margin: 0 0 14px;
  font-size: 20px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
}

/* Bagian melintang penuh — inilah yang memakai lebar kanvas dan membuat sisi
   kanan-kiri halaman tidak terasa kosong. */
.related {
  margin-top: 40px;
}

.related__title {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
}

.related__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1080px) {
  .related__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 820px) {
  .related__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.detail__skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail__skeleton-hero,
.detail__skeleton-line {
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--blue-100) 25%, var(--blue-150) 37%, var(--blue-100) 63%);
  background-size: 400% 100%;
  animation: detail-shimmer 1.4s ease infinite;
}

.detail__skeleton-hero {
  height: 280px;
}

.detail__skeleton-line {
  height: 20px;
}

.detail__skeleton-line--short {
  width: 55%;
}

@keyframes detail-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (max-width: 600px) {
  .detail {
    padding: 18px var(--mobile-gutter) 32px;
  }

  .card {
    border-radius: var(--radius-lg);
  }

  .card__hero {
    height: 200px;
  }

  .card__body {
    padding: 18px 16px 22px;
  }

  .card__title {
    font-size: 22px;
    line-height: 29px;
  }

  .facts {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .content p {
    font-size: 14.5px;
    line-height: 24px;
  }

  .maps {
    width: 100%;
    justify-content: center;
    box-sizing: border-box;
  }

  .gallery__title {
    font-size: 18px;
  }

  .related {
    margin-top: 28px;
  }

  .related__title {
    font-size: 19px;
  }

  .related__grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
