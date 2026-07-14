<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Calendar, Newspaper, User } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import NewsCard from '@/components/ui/NewsCard.vue'
import { fetchBeritaBySlug, fetchBeritaLainnya } from '@/composables/usePublicCatalog'
import { formatTanggalIndonesia } from '@/utils/formatDate'
import type { Berita, BeritaDetail } from '@/types/berita'

const route = useRoute()

const berita = ref<BeritaDetail | null>(null)
const lainnya = ref<Berita[]>([])
const loading = ref(true)

// Konten disimpan sebagai teks biasa; baris kosong menjadi pemisah paragraf.
const paragraphs = computed(() =>
  (berita.value?.konten ?? '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean),
)

async function load(slug: string) {
  loading.value = true
  berita.value = await fetchBeritaBySlug(slug)
  loading.value = false
  window.scrollTo({ top: 0 })

  // Daftar "lainnya" menyusul setelah artikelnya tampil — pembaca tidak perlu
  // menunggu bagian yang belum tentu ia gulir sampai ke sana.
  lainnya.value = berita.value ? await fetchBeritaLainnya(berita.value.id) : []
}

watch(() => route.params.slug, (slug) => load(String(slug)), { immediate: true })
</script>

<template>
  <div class="detail">
    <div class="detail__inner">
      <RouterLink :to="{ name: 'berita' }" class="detail__back">
        <ArrowLeft :size="16" />
        Kembali ke Berita
      </RouterLink>

      <div v-if="loading" class="detail__skeleton">
        <div class="detail__skeleton-hero" />
        <div class="detail__skeleton-line" />
        <div class="detail__skeleton-line detail__skeleton-line--short" />
      </div>

      <p v-else-if="!berita" class="detail__empty">
        Berita tidak ditemukan atau sudah tidak dipublikasikan.
      </p>

      <article v-else v-slide-in class="article">
        <div
          class="article__hero"
          :style="berita.gambar_utama ? { backgroundImage: `url(${berita.gambar_utama})` } : undefined"
        >
          <Newspaper v-if="!berita.gambar_utama" :size="48" color="var(--blue-300)" />
        </div>

        <div class="article__body">
          <div class="article__meta">
            <BaseBadge v-if="berita.kategori_berita?.nama" variant="blue" dense>
              {{ berita.kategori_berita.nama }}
            </BaseBadge>
            <span v-if="berita.tanggal_publikasi" class="article__fact">
              <Calendar :size="13" />
              {{ formatTanggalIndonesia(berita.tanggal_publikasi) }}
            </span>
            <span v-if="berita.penulis" class="article__fact">
              <User :size="13" />
              {{ berita.penulis }}
            </span>
          </div>

          <h1 class="article__title">{{ berita.judul }}</h1>

          <div class="article__content">
            <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
          </div>
        </div>
      </article>

      <section v-if="!loading && lainnya.length > 0" class="related">
        <h2 class="related__title">Berita Lainnya</h2>
        <div class="related__grid">
          <NewsCard
            v-for="(item, index) in lainnya"
            :key="item.id"
            v-slide-in
            :style="{ animationDelay: `${index * 90}ms` }"
            :image="item.gambar_utama"
            :category="item.kategori_berita?.nama"
            :date="item.tanggal_publikasi"
            :title="item.judul"
            :excerpt="item.konten"
            :to="{ name: 'berita-detail', params: { slug: item.slug } }"
            big
          />
        </div>
      </section>
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

.article {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  overflow: hidden;
  max-width: 1040px;
  margin: 0 auto;
}

.article__hero {
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--blue-100);
  background-size: cover;
  background-position: center;
}

.article__body {
  padding: 26px 30px 34px;
}

.article__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 12px;
}

.article__fact {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: var(--gray-500);
}

.article__title {
  margin: 0 0 18px;
  font-size: 28px;
  line-height: 36px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
}

/* Baris teks dibatasi ~70 karakter. Melebihi itu, mata kehilangan jejak baris
   saat kembali ke kiri — jadi lebar kartu dipakai gambar & meta, bukan teks. */
.article__content {
  max-width: 70ch;
}

.article__content p {
  margin: 0 0 14px;
  font-size: 15px;
  line-height: 25px;
  color: var(--ink-900);
  /* Baris tunggal di dalam satu paragraf tetap dihormati. */
  white-space: pre-line;
}

.article__content p:last-child {
  margin-bottom: 0;
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

@media (max-width: 900px) {
  .related__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .detail {
    padding: 18px var(--mobile-gutter) 32px;
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

  .article {
    border-radius: var(--radius-lg);
  }

  .article__hero {
    height: 200px;
  }

  .article__body {
    padding: 18px 16px 24px;
  }

  .article__title {
    font-size: 22px;
    line-height: 29px;
  }

  .article__content p {
    font-size: 14.5px;
    line-height: 24px;
  }
}
</style>
