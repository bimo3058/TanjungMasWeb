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
            v-for="item in items"
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
  </div>
</template>

<style scoped>
.catalog-body {
  padding: 22px 36px 48px;
  background: var(--blue-50);
  font-family: var(--font-sans);
}

.catalog-body__inner {
  max-width: 1160px;
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

@media (max-width: 900px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
