<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import PublicCatalogHeader from '@/components/layout/PublicCatalogHeader.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import WisataCard from '@/components/ui/WisataCard.vue'
import { usePublicWisata } from '@/composables/usePublicCatalog'
import { useCategories } from '@/composables/useCategories'

const { items, loading, fetchList } = usePublicWisata()
const { categories } = useCategories('kategori_wisata')

const search = ref('')
const kategoriFilter = ref('')

onMounted(() => fetchList())
watch([search, kategoriFilter], () => fetchList(search.value, kategoriFilter.value))
</script>

<template>
  <div>
    <PublicCatalogHeader
      v-model="search"
      eyebrow="Jelajahi Tambaklorok"
      title="Katalog Destinasi Wisata"
      lead="Jelajahi keindahan alam dan warisan budaya pesisir Tambaklorok, Semarang."
      search-placeholder="Cari destinasi wisata..."
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

        <div v-if="loading" class="card-grid">
          <div v-for="n in 4" :key="n" class="card-skeleton" />
        </div>
        <p v-else-if="items.length === 0" class="empty-message">Belum ada destinasi wisata.</p>
        <div v-else class="card-grid">
          <WisataCard
            v-for="(item, index) in items"
            :key="item.id"
            v-slide-in
            :style="{ animationDelay: `${(index % 4) * 90}ms` }"
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

.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1080px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card-skeleton {
  height: 260px;
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

.empty-message {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--fs-md);
}

@media (max-width: 820px) {
  .catalog-body {
    padding: 20px 20px 40px;
  }
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
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

  .card-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
