<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import PublicCatalogHeader from '@/components/layout/PublicCatalogHeader.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import UmkmCard from '@/components/ui/UmkmCard.vue'
import { usePublicUmkm } from '@/composables/usePublicCatalog'
import { useCategories } from '@/composables/useCategories'

const { items, loading, fetchList } = usePublicUmkm()
const { categories } = useCategories('kategori_umkm')

const search = ref('')
const kategoriFilter = ref('')

onMounted(() => fetchList())
watch([search, kategoriFilter], () => fetchList(search.value, kategoriFilter.value))
</script>

<template>
  <div>
    <PublicCatalogHeader
      v-model="search"
      title="Katalog UMKM & Produk Lokal"
      lead="Dukung perekonomian lokal dengan produk unggulan masyarakat Tambaklorok."
      search-placeholder="Cari produk UMKM..."
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
        <p v-else-if="items.length === 0" class="empty-message">Belum ada data UMKM.</p>
        <div v-else class="card-grid">
          <UmkmCard
            v-for="item in items"
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
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.card-skeleton {
  height: 118px;
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
