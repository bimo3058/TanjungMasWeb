<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseSearchBar from '@/components/ui/BaseSearchBar.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseToggle from '@/components/ui/BaseToggle.vue'
import IconButton from '@/components/ui/IconButton.vue'
import NameCell from '@/components/ui/NameCell.vue'
import AdminListCard from '@/components/ui/AdminListCard.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useAdminBeritaList } from '@/composables/useAdminBerita'
import { useCategories } from '@/composables/useCategories'
import { usePagination } from '@/composables/usePagination'
import { formatTanggalIndonesia } from '@/utils/formatDate'

const router = useRouter()
const { items, loading, fetchList, toggleStatus, remove } = useAdminBeritaList()
const { categories } = useCategories('kategori_berita')

const search = ref('')
const kategoriFilter = ref('')
const statusFilter = ref('')
const pendingDeleteId = ref<string | null>(null)
const deleting = ref(false)

onMounted(() => fetchList())

watch([search, kategoriFilter], () => fetchList(search.value, kategoriFilter.value))

const filteredItems = computed(() => {
  if (!statusFilter.value) return items.value
  const wantPublished = statusFilter.value === 'published'
  return items.value.filter((item) => (item.status === 'Terpublikasi') === wantPublished)
})

const { page, pageCount, pageItems, rangeStart, rangeEnd, next, prev } = usePagination(filteredItems)

function confirmDelete(id: string) {
  pendingDeleteId.value = id
}

async function handleDelete() {
  if (!pendingDeleteId.value) return
  deleting.value = true
  await remove(pendingDeleteId.value)
  deleting.value = false
  pendingDeleteId.value = null
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <div class="page__heading">
        <h1 class="page__title">Manajemen Berita</h1>
        <span class="page__count">{{ filteredItems.length }} artikel</span>
      </div>
      <BaseButton variant="primary" size="sm" @click="router.push({ name: 'admin-berita-baru' })">
        <template #icon><Plus :size="15" /></template>
        Buat Berita
      </BaseButton>
    </div>

    <div class="table-card">
      <div class="table-card__filters">
        <div class="filters__search">
          <BaseSearchBar v-model="search" dense placeholder="Cari berita…" />
        </div>
        <BaseSelect
          v-model="kategoriFilter"
          dense
          class="filters__select"
          placeholder="Semua kategori"
          :options="categories.map((k) => ({ value: k.id, label: k.nama }))"
        />
        <BaseSelect
          v-model="statusFilter"
          dense
          class="filters__select"
          placeholder="Semua status"
          :options="[
            { value: 'published', label: 'Terpublikasi' },
            { value: 'draft', label: 'Draft' },
          ]"
        />
      </div>

      <div v-if="loading" class="table-card__skeleton">
        <div v-for="n in 4" :key="n" class="table-card__skeleton-row" />
      </div>
      <p v-else-if="filteredItems.length === 0" class="table-card__empty">Belum ada berita.</p>
      <template v-else>
        <div class="table-card__scroll">
          <table class="table">
            <colgroup>
              <col style="width: 32%" />
              <col style="width: 14%" />
              <col style="width: 16%" />
              <col style="width: 12%" />
              <col style="width: 14%" />
              <col style="width: 12%" />
            </colgroup>
            <thead>
              <tr>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Penulis</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th class="table__col-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pageItems" :key="item.id">
                <td>
                  <NameCell :image="item.gambar_utama" :title="item.judul" :sub="`/${item.slug}`" />
                </td>
                <td><BaseBadge variant="blue" dense>{{ item.kategori_berita?.nama ?? '—' }}</BaseBadge></td>
                <td class="table__cell-muted">{{ item.penulis }}</td>
                <td class="table__cell-muted">
                  {{ item.tanggal_publikasi ? formatTanggalIndonesia(item.tanggal_publikasi) : '—' }}
                </td>
                <td>
                  <BaseToggle
                    :model-value="item.status === 'Terpublikasi'"
                    @update:model-value="toggleStatus(item.id, $event)"
                  />
                </td>
                <td class="table__col-actions">
                  <div class="table__actions">
                    <IconButton title="Edit" @click="router.push({ name: 'admin-berita-edit', params: { id: item.id } })">
                      <Pencil :size="13" />
                    </IconButton>
                    <IconButton title="Hapus" danger @click="confirmDelete(item.id)">
                      <Trash2 :size="13" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Versi ponsel: satu kartu per baris tabel. -->
        <div class="card-list">
          <AdminListCard
            v-for="item in pageItems"
            :key="item.id"
            :image="item.gambar_utama"
            :title="item.judul"
            :sub="[item.penulis, item.tanggal_publikasi ? formatTanggalIndonesia(item.tanggal_publikasi) : '—']
              .filter(Boolean)
              .join(' · ')"
            :category="item.kategori_berita?.nama ?? undefined"
            :published="item.status === 'Terpublikasi'"
            published-label="Terpublikasi"
            @update:published="toggleStatus(item.id, $event)"
            @edit="router.push({ name: 'admin-berita-edit', params: { id: item.id } })"
            @delete="confirmDelete(item.id)"
          />
        </div>

        <div class="table-card__footer">
          <span class="table-card__range">
            Menampilkan {{ rangeStart }}–{{ rangeEnd }} dari {{ filteredItems.length }} artikel
          </span>
          <div class="table-card__pager">
            <IconButton title="Sebelumnya" :disabled="page <= 1" @click="prev">
              <ChevronLeft :size="14" />
            </IconButton>
            <IconButton title="Berikutnya" :disabled="page >= pageCount" @click="next">
              <ChevronRight :size="14" />
            </IconButton>
          </div>
        </div>
      </template>
    </div>

    <ConfirmDialog
      :open="!!pendingDeleteId"
      title="Hapus Berita?"
      message="Artikel ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
      confirm-label="Hapus"
      danger
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="pendingDeleteId = null"
    />
  </div>
</template>

<style scoped>
.page {
  /* Tumbuh mengisi area gulir, tapi tak pernah dimampatkan saat konten panjang. */
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px 20px;
  font-family: var(--font-sans);
  box-sizing: border-box;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.page__heading {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.page__title {
  margin: 0;
  font-size: 20px;
  font-weight: var(--fw-bold);
  color: var(--blue-950);
}

.page__count {
  font-size: 12.5px;
  color: var(--gray-500);
}

.table-card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-card__filters {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--blue-200);
  flex-wrap: wrap;
}

.table-card__scroll {
  overflow-x: auto;
  flex: 1;
}

.table {
  width: 100%;
  min-width: 720px;
  table-layout: fixed;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 9px 14px;
  font-size: 11px;
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
  color: var(--ink-700);
}

.table td {
  padding: 7px 14px;
  border-top: 1px solid var(--blue-200);
  font-size: 13px;
  overflow-wrap: break-word;
}

.table__col-actions {
  text-align: right;
  white-space: nowrap;
}

.table__cell-muted {
  color: var(--ink-700);
}

.table tbody tr:hover {
  background: var(--blue-50);
}

.table__actions {
  display: inline-flex;
  gap: 6px;
}

.table-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 14px;
  border-top: 1px solid var(--blue-200);
}

.table-card__range {
  font-size: 12px;
  color: var(--ink-700);
}

.table-card__pager {
  display: flex;
  gap: 6px;
}

.table-card__skeleton {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
}

.table-card__skeleton-row {
  height: 18px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--blue-100) 25%, var(--blue-150) 37%, var(--blue-100) 63%);
  background-size: 400% 100%;
  animation: table-shimmer 1.4s ease infinite;
}

@keyframes table-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.table-card__empty {
  padding: 32px 24px;
  margin: 0;
  text-align: center;
  color: var(--text-muted);
}

.filters__search {
  width: 230px;
  max-width: 100%;
}

.card-list {
  display: none;
}

/* ---- Ponsel: tabel diganti daftar kartu ---- */
@media (max-width: 768px) {
  .page {
    padding: 14px var(--mobile-gutter) 22px;
  }

  /* Judul sudah tampil di top bar — di sini cukup jumlah data. */
  .page__title {
    display: none;
  }

  /* Kartu berdiri langsung di atas kanvas, bukan di dalam kartu tabel. */
  .table-card {
    background: transparent;
    box-shadow: none;
    border-radius: 0;
    overflow: visible;
    gap: 12px;
  }

  .table-card__filters {
    padding: 0;
    border-bottom: none;
    gap: 9px;
  }

  .filters__search {
    flex: 1 0 100%;
    width: auto;
  }

  .filters__select {
    flex: 1;
    min-width: 0;
  }

  .table-card__scroll {
    display: none;
  }

  .card-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .table-card__footer {
    padding: 4px 0 0;
    border-top: none;
  }

  .table-card__skeleton {
    padding: 0;
  }

  .table-card__empty {
    padding: 24px 0;
  }
}
</style>
