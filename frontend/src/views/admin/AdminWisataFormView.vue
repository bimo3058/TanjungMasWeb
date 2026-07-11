<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseToggle from '@/components/ui/BaseToggle.vue'
import CategorySelect from '@/components/ui/CategorySelect.vue'
import OperatingHoursInput from '@/components/ui/OperatingHoursInput.vue'
import ImageUploader from '@/components/ui/ImageUploader.vue'
import GalleryUploader from '@/components/ui/GalleryUploader.vue'
import WisataCard from '@/components/ui/WisataCard.vue'
import { getWisataById, saveWisata, type WisataFormValues } from '@/composables/useAdminWisata'
import { useCategories } from '@/composables/useCategories'
import { formatRelativeIndonesia } from '@/utils/formatDate'
import type { GaleriFoto } from '@/types/galeri'

const route = useRoute()
const router = useRouter()

const id = route.params.id as string | undefined
const isEdit = !!id

const { categories } = useCategories('kategori_wisata')
const kategoriNama = computed(
  () => categories.value.find((k) => k.id === values.value.kategori_id)?.nama,
)

const loading = ref(isEdit)
const saving = ref(false)
const error = ref('')
const updatedAt = ref<string | null>(null)

const values = ref<WisataFormValues>({
  nama: '',
  deskripsi: '',
  gambar_utama: null,
  kategori_id: null,
  lokasi_maps_url: '',
  alamat_lengkap: '',
  jam_operasional: '',
  harga_tiket: '',
  published: true,
})

const gallery = ref<GaleriFoto[]>([])
let originalGallery: GaleriFoto[] = []

onMounted(async () => {
  if (!id) return
  const result = await getWisataById(id)
  if (!result) {
    error.value = 'Data wisata tidak ditemukan.'
    loading.value = false
    return
  }
  const { row, gallery: existingGallery } = result
  values.value = {
    nama: row.nama,
    deskripsi: row.deskripsi ?? '',
    gambar_utama: row.gambar_utama,
    kategori_id: row.kategori_id,
    lokasi_maps_url: row.lokasi_maps_url ?? '',
    alamat_lengkap: row.alamat_lengkap ?? '',
    jam_operasional: row.jam_operasional ?? '',
    harga_tiket: row.harga_tiket ?? '',
    published: row.published,
  }
  gallery.value = existingGallery
  originalGallery = existingGallery
  updatedAt.value = row.updated_at
  loading.value = false
})

async function handleSubmit() {
  if (!values.value.nama.trim()) {
    error.value = 'Nama wisata wajib diisi.'
    return
  }
  error.value = ''
  saving.value = true
  try {
    await saveWisata(
      values.value,
      gallery.value,
      isEdit && id ? { id, originalGallery } : undefined,
    )
    router.push({ name: 'admin-wisata' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal menyimpan data wisata.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ isEdit ? 'Edit Wisata' : 'Tambah Wisata' }}</h1>
      <div class="page__actions">
        <BaseButton variant="outline" size="sm" type="button" @click="router.push({ name: 'admin-wisata' })">
          Batal
        </BaseButton>
        <BaseButton variant="primary" size="sm" type="submit" form="wisata-form" :loading="saving">
          Simpan
        </BaseButton>
      </div>
    </div>

    <p v-if="loading" class="page__loading">Memuat data...</p>

    <div v-else class="lower">
      <form id="wisata-form" class="form-card" @submit.prevent="handleSubmit">
        <BaseInput v-model="values.nama" dense label="Nama Wisata" placeholder="Contoh: Mangrove Center" />

        <div class="form-card__grid">
          <CategorySelect v-model="values.kategori_id" dense table="kategori_wisata" label="Kategori" />
          <BaseInput
            v-model="values.lokasi_maps_url"
            dense
            label="Link Google Maps"
            placeholder="https://maps.google.com/..."
          />
        </div>

        <BaseTextarea v-model="values.deskripsi" dense label="Deskripsi" :rows="3" />
        <BaseTextarea v-model="values.alamat_lengkap" dense label="Alamat Lengkap" :rows="2" />

        <div class="form-card__grid">
          <OperatingHoursInput v-model="values.jam_operasional" dense label="Jam Operasional" />
          <BaseInput v-model="values.harga_tiket" dense label="Harga Tiket" placeholder="Rp 10.000" />
        </div>

        <ImageUploader v-model="values.gambar_utama" folder="wisata" label="Gambar Utama" />
        <GalleryUploader v-model="gallery" folder="galeri-wisata" label="Galeri Foto" />

        <div class="form-card__publish">
          <BaseToggle v-model="values.published" />
          <span>Publikasikan wisata ini</span>
        </div>

        <p v-if="error" class="form-card__error">{{ error }}</p>

        <div v-if="updatedAt" class="form-card__footer">
          Terakhir diperbarui {{ formatRelativeIndonesia(updatedAt) }}
        </div>
      </form>

      <div class="side">
        <div class="preview-card">
          <div class="preview-card__header">
            <h2 class="preview-card__title">Pratinjau di Situs Publik</h2>
          </div>
          <div class="preview-card__body">
            <WisataCard
              :image="values.gambar_utama"
              :category="kategoriNama"
              :title="values.nama || 'Nama wisata'"
              :description="values.deskripsi"
              :address="values.alamat_lengkap"
              :harga="values.harga_tiket"
              :jam="values.jam_operasional"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px 20px;
  font-family: var(--font-sans);
  min-height: 0;
  box-sizing: border-box;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page__title {
  margin: 0;
  font-size: 20px;
  font-weight: var(--fw-bold);
  color: var(--blue-950);
}

.page__actions {
  display: flex;
  gap: 8px;
}

.page__loading {
  color: var(--text-muted);
}

.lower {
  flex: 1;
  display: flex;
  gap: 14px;
  align-items: start;
  min-height: 0;
}

.form-card {
  flex: 1.6;
  min-width: 0;
  box-sizing: border-box;
  padding: 18px;
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: start;
}

.form-card__publish {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--ink-900);
}

.form-card__error {
  margin: 0;
  font-size: 13px;
  color: var(--danger);
}

.form-card__footer {
  border-top: 1px solid var(--blue-200);
  padding-top: 10px;
  font-size: 11.5px;
  color: var(--gray-500);
}

.side {
  flex: 1;
  min-width: 0;
}

.preview-card {
  position: sticky;
  top: 0;
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  overflow: hidden;
}

.preview-card__header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--blue-200);
}

.preview-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.preview-card__body {
  padding: 16px;
}
</style>
