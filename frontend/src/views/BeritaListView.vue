<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PublicCatalogHeader from '@/components/layout/PublicCatalogHeader.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BeritaSidebar from '@/components/ui/BeritaSidebar.vue'
import FeaturedNewsCard from '@/components/ui/FeaturedNewsCard.vue'
import NewsCard from '@/components/ui/NewsCard.vue'
import { usePublicBerita } from '@/composables/usePublicCatalog'
import { usePublicInfoDesa } from '@/composables/usePublicInfoDesa'
import { useCategories } from '@/composables/useCategories'
import { usePagination } from '@/composables/usePagination'

const BERITA_PER_HALAMAN = 6

const { items, loading, error, fetchList } = usePublicBerita()
const { pengumuman, festival, loading: infoLoading, fetchAll } = usePublicInfoDesa()
const { categories } = useCategories('kategori_berita')

const search = ref('')
const kategoriFilter = ref('')
const listAnchor = ref<HTMLElement | null>(null)

// Sorotan hanya masuk akal saat daftar utuh. Begitu pengguna mencari atau
// menyaring kategori, berita teratas hasil filter bukan "sorotan desa" lagi —
// jadi ia dikembalikan ke daftar biasa.
const tanpaFilter = computed(() => !search.value && !kategoriFilter.value)

// Sorotan ditandai admin. Bila belum ada yang ditandai (atau yang ditandai
// sedang berstatus draft sehingga tidak ikut terambil), pakai berita terbaru
// agar puncak halaman tidak pernah kosong.
const featured = computed(() => {
  if (!tanpaFilter.value) return null
  return items.value.find((item) => item.sorotan) ?? items.value[0] ?? null
})

const listItems = computed(() =>
  featured.value ? items.value.filter((item) => item.id !== featured.value?.id) : items.value,
)

const { page, pageCount, pageItems } = usePagination(listItems, BERITA_PER_HALAMAN)

// Pindah halaman tanpa ini akan menaruh pembaca di tengah daftar yang sudah
// berganti isi.
watch(page, () => listAnchor.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))

onMounted(() => {
  fetchList()
  fetchAll()
})

watch([search, kategoriFilter], () => fetchList(search.value, kategoriFilter.value))
</script>

<template>
  <div>
    <PublicCatalogHeader
      v-model="search"
      eyebrow="Kabar Terkini"
      title="Portal Berita & Informasi"
      lead="Dapatkan kabar terbaru, pengumuman resmi, dan jadwal acara budaya seputar Kampung Nelayan Bahari Tambaklorok."
      search-placeholder="Cari berita..."
    />

    <section class="catalog-body">
      <div class="catalog-body__inner">
        <div class="filters">
          <BaseBadge
            :variant="kategoriFilter === '' ? 'accent' : 'category'"
            clickable
            class="filters__chip"
            @click="kategoriFilter = ''"
          >
            Semua
          </BaseBadge>
          <BaseBadge
            v-for="kat in categories"
            :key="kat.id"
            :variant="kategoriFilter === kat.id ? 'accent' : 'category'"
            clickable
            class="filters__chip"
            @click="kategoriFilter = kat.id"
          >
            {{ kat.nama }}
          </BaseBadge>
        </div>

        <p v-if="error" class="error-message">
          Gagal memuat berita: {{ error }}
        </p>

        <div v-if="loading" class="featured-skeleton" />
        <FeaturedNewsCard
          v-else-if="featured"
          v-slide-in
          :image="featured.gambar_utama"
          :category="featured.kategori_berita?.nama"
          :date="featured.tanggal_publikasi"
          :title="featured.judul"
          :excerpt="featured.konten"
          :to="{ name: 'berita-detail', params: { slug: featured.slug } }"
          class="featured-card"
        />

        <div class="layout">
          <div class="layout__main">
            <h2 ref="listAnchor" class="section-title">Berita Terkini</h2>

            <div v-if="loading" class="card-list">
              <div v-for="n in 3" :key="n" class="card-skeleton" />
            </div>
            <p v-else-if="items.length === 0" class="empty-message">Belum ada berita.</p>
            <p v-else-if="listItems.length === 0" class="empty-message">
              Belum ada berita lain selain sorotan di atas.
            </p>
            <template v-else>
              <div class="card-list">
                <NewsCard
                  v-for="(item, index) in pageItems"
                  :key="item.id"
                  v-slide-in
                  :style="{ animationDelay: `${index * 70}ms` }"
                  :image="item.gambar_utama"
                  :category="item.kategori_berita?.nama"
                  :date="item.tanggal_publikasi"
                  :title="item.judul"
                  :excerpt="item.konten"
                  :to="{ name: 'berita-detail', params: { slug: item.slug } }"
                />
              </div>

              <BasePagination v-model:page="page" :page-count="pageCount" class="pagination" />
            </template>
          </div>

          <BeritaSidebar
            v-slide-in
            :pengumuman="pengumuman"
            :festival="festival"
            :loading="infoLoading"
            class="layout__side"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.catalog-body {
  padding: 22px 36px 48px;
  background: var(--blue-50);
  font-family: var(--font-sans);
}

.catalog-body__inner {
  max-width: var(--content-max);
  margin: 0 auto;
}

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.filters__chip {
  font-size: 12px;
  padding: 4px 12px;
}

.featured-card,
.featured-skeleton {
  margin-bottom: 34px;
}

.featured-skeleton {
  height: 280px;
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--blue-100) 25%, var(--blue-150) 37%, var(--blue-100) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 328px;
  gap: 26px;
  align-items: start;
}

.section-title {
  margin: 0 0 16px;
  /* Sasaran scrollIntoView saat ganti halaman — beri jarak dari header lengket. */
  scroll-margin-top: 84px;
  font-size: 24px;
  font-weight: var(--fw-bold);
  color: var(--blue-900);
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-skeleton {
  height: 128px;
  border-radius: var(--radius-md);
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

.pagination {
  margin-top: 26px;
}

.empty-message {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--fs-md);
}

.error-message {
  margin: 0 0 18px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--surface-card);
  border: 1px solid var(--danger);
  color: var(--danger);
  font-size: var(--fs-sm);
}

/* Sidebar turun ke bawah daftar sebelum kolomnya terlalu sempit untuk dibaca. */
@media (max-width: 980px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 820px) {
  .catalog-body {
    padding: 20px 20px 40px;
  }
}

@media (max-width: 600px) {
  .catalog-body {
    padding: 18px var(--mobile-gutter) 32px;
  }

  /* Chip kategori digeser menyamping; sengaja dibocorkan sampai tepi layar
     agar chip terakhir tidak tampak terpotong begitu saja. */
  .filters {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin: 0 calc(-1 * var(--mobile-gutter)) 16px;
    padding: 0 var(--mobile-gutter) 4px;
    scrollbar-width: none;
  }

  .filters::-webkit-scrollbar {
    display: none;
  }

  .filters__chip {
    flex-shrink: 0;
    font-size: 12.5px;
    padding: 6px 14px;
  }

  .featured-card,
  .featured-skeleton {
    margin-bottom: 26px;
  }

  .featured-skeleton {
    height: 220px;
  }

  .section-title {
    font-size: 20px;
    margin-bottom: 14px;
  }

  .card-list {
    gap: 14px;
  }

  .pagination {
    margin-top: 20px;
  }
}
</style>
