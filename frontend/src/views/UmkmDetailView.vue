<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, BadgeCheck, CalendarDays, Clock, MapPin, Phone, Store, User } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import PhotoGallery from '@/components/ui/PhotoGallery.vue'
import UmkmCard from '@/components/ui/UmkmCard.vue'
import { fetchUmkmBySlug, fetchUmkmLainnya } from '@/composables/usePublicCatalog'
import type { Umkm, UmkmDetail } from '@/types/umkm'

const route = useRoute()

const umkm = ref<UmkmDetail | null>(null)
const lainnya = ref<Umkm[]>([])
const loading = ref(true)

const paragraphs = computed(() =>
  (umkm.value?.deskripsi ?? '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean),
)

// Hanya fakta yang terisi yang ditampilkan — baris kosong bertuliskan "—"
// membuat halaman terasa belum jadi.
const facts = computed(() => {
  const item = umkm.value
  if (!item) return []

  return [
    { icon: User, label: 'Pemilik', value: item.nama_pemilik },
    { icon: Clock, label: 'Jam Operasional', value: item.jam_operasional },
    { icon: CalendarDays, label: 'Tahun Berdiri', value: item.tahun_berdiri },
    { icon: BadgeCheck, label: 'Status Izin', value: item.status_izin },
    { icon: MapPin, label: 'Alamat', value: item.alamat_lengkap },
  ].filter((fact) => !!fact.value)
})

// Spasi/tanda hubung dibuang agar tel: tetap valid untuk nomor seperti
// "0812-3456-7890"; teks yang tampil tetap apa adanya.
const telHref = computed(() => {
  const nomor = umkm.value?.nomor_telepon
  return nomor ? `tel:${nomor.replace(/[^\d+]/g, '')}` : null
})

async function load(slug: string) {
  loading.value = true
  umkm.value = await fetchUmkmBySlug(slug)
  loading.value = false
  window.scrollTo({ top: 0 })

  // Menyusul setelah isi utamanya tampil — pembaca tidak perlu menunggu bagian
  // yang belum tentu ia gulir sampai ke sana.
  lainnya.value = umkm.value ? await fetchUmkmLainnya(umkm.value.id) : []
}

watch(() => route.params.slug, (slug) => load(String(slug)), { immediate: true })
</script>

<template>
  <div class="detail">
    <div class="detail__inner">
      <RouterLink :to="{ name: 'umkm' }" class="detail__back">
        <ArrowLeft :size="16" />
        Kembali ke UMKM
      </RouterLink>

      <div v-if="loading" class="detail__skeleton">
        <div class="detail__skeleton-hero" />
        <div class="detail__skeleton-line" />
        <div class="detail__skeleton-line detail__skeleton-line--short" />
      </div>

      <p v-else-if="!umkm" class="detail__empty">
        Data UMKM tidak ditemukan atau sudah tidak ditampilkan.
      </p>

      <template v-else>
        <article v-slide-in class="card">
          <div
            class="card__hero"
            :style="umkm.gambar_utama ? { backgroundImage: `url(${umkm.gambar_utama})` } : undefined"
          >
            <Store v-if="!umkm.gambar_utama" :size="48" color="var(--blue-300)" />
            <BaseBadge v-if="umkm.kategori_umkm?.nama" variant="accent" class="card__badge">
              {{ umkm.kategori_umkm.nama }}
            </BaseBadge>
          </div>

          <div class="card__body">
            <h1 class="card__title">{{ umkm.nama_usaha }}</h1>

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

            <a v-if="telHref" class="contact" :href="telHref">
              <Phone :size="15" />
              Hubungi {{ umkm.nomor_telepon }}
            </a>
          </div>
        </article>

        <section v-if="umkm.galeri_umkm.length > 0" v-slide-in class="gallery">
          <h2 class="gallery__title">Galeri Produk</h2>
          <PhotoGallery :photos="umkm.galeri_umkm" />
        </section>

        <section v-if="lainnya.length > 0" class="related">
          <h2 class="related__title">UMKM Lainnya</h2>
          <div class="related__grid">
            <UmkmCard
              v-for="(item, index) in lainnya"
              :key="item.id"
              v-slide-in
              :style="{ animationDelay: `${index * 90}ms` }"
              :image="item.gambar_utama"
              :category="item.kategori_umkm?.nama"
              :title="item.nama_usaha"
              :description="item.deskripsi"
              :address="item.alamat_lengkap"
              :to="{ name: 'umkm-detail', params: { slug: item.slug } }"
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
   mustahil diikuti mata. Lebar kanvas dipakai galeri & "UMKM Lainnya". */
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

.contact {
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

.contact:hover {
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
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 1080px) {
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

  .contact {
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
