<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseToggle from '@/components/ui/BaseToggle.vue'
import CategorySelect from '@/components/ui/CategorySelect.vue'
import OperatingHoursInput from '@/components/ui/OperatingHoursInput.vue'
import ImageUploader from '@/components/ui/ImageUploader.vue'
import GalleryUploader from '@/components/ui/GalleryUploader.vue'
import UmkmCard from '@/components/ui/UmkmCard.vue'
import { getUmkmById, saveUmkm, type UmkmFormValues } from '@/composables/useAdminUmkm'
import { useCategories } from '@/composables/useCategories'
import { formatRelativeIndonesia } from '@/utils/formatDate'
import type { GaleriFoto } from '@/types/galeri'

const route = useRoute()
const router = useRouter()

const id = route.params.id as string | undefined
const isEdit = !!id

const { categories } = useCategories('kategori_umkm')
const kategoriNama = computed(
  () => categories.value.find((k) => k.id === values.value.kategori_id)?.nama,
)

const STATUS_IZIN_OPTIONS = [
  { value: 'Berizin', label: 'Berizin' },
  { value: 'Belum Berizin', label: 'Belum Berizin' },
  { value: 'Proses', label: 'Proses' },
]

const loading = ref(isEdit)
const saving = ref(false)
const error = ref('')
const updatedAt = ref<string | null>(null)

const values = ref<UmkmFormValues>({
  nama_usaha: '',
  nama_pemilik: '',
  nomor_telepon: '',
  alamat_lengkap: '',
  deskripsi: '',
  gambar_utama: null,
  kategori_id: null,
  jam_operasional: '',
  tahun_berdiri: '',
  status_izin: 'Proses',
  published: true,
})

const gallery = ref<GaleriFoto[]>([])
let originalGallery: GaleriFoto[] = []

onMounted(async () => {
  if (!id) return
  const result = await getUmkmById(id)
  if (!result) {
    error.value = 'Data UMKM tidak ditemukan.'
    loading.value = false
    return
  }
  const { row, gallery: existingGallery } = result
  values.value = {
    nama_usaha: row.nama_usaha,
    nama_pemilik: row.nama_pemilik,
    nomor_telepon: row.nomor_telepon ?? '',
    alamat_lengkap: row.alamat_lengkap ?? '',
    deskripsi: row.deskripsi ?? '',
    gambar_utama: row.gambar_utama,
    kategori_id: row.kategori_id,
    jam_operasional: row.jam_operasional ?? '',
    tahun_berdiri: row.tahun_berdiri ?? '',
    status_izin: row.status_izin ?? 'Proses',
    published: row.published,
  }
  gallery.value = existingGallery
  originalGallery = existingGallery
  updatedAt.value = row.updated_at
  loading.value = false
})

async function handleSubmit() {
  if (!values.value.nama_usaha.trim() || !values.value.nama_pemilik.trim()) {
    error.value = 'Nama usaha dan nama pemilik wajib diisi.'
    return
  }
  error.value = ''
  saving.value = true
  try {
    await saveUmkm(values.value, gallery.value, isEdit && id ? { id, originalGallery } : undefined)
    router.push({ name: 'admin-umkm' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal menyimpan data UMKM.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ isEdit ? 'Edit UMKM' : 'Tambah UMKM' }}</h1>
      <div class="page__actions">
        <BaseButton variant="outline" size="sm" type="button" @click="router.push({ name: 'admin-umkm' })">
          Batal
        </BaseButton>
        <BaseButton variant="primary" size="sm" type="submit" form="umkm-form" :loading="saving">
          Simpan
        </BaseButton>
      </div>
    </div>

    <p v-if="loading" class="page__loading">Memuat data...</p>

    <div v-else class="lower">
      <form id="umkm-form" class="form-card" @submit.prevent="handleSubmit">
        <BaseInput v-model="values.nama_usaha" dense label="Nama Usaha" placeholder="Contoh: Ikan Asap Tambaklorok" />

        <div class="form-card__grid">
          <BaseInput v-model="values.nama_pemilik" dense label="Nama Pemilik" />
          <BaseInput v-model="values.nomor_telepon" dense label="Nomor Telepon" type="tel" />
        </div>

        <div class="form-card__grid">
          <CategorySelect v-model="values.kategori_id" dense table="kategori_umkm" label="Kategori" />
          <BaseSelect v-model="values.status_izin" dense label="Status Izin" :options="STATUS_IZIN_OPTIONS" />
        </div>

        <BaseTextarea v-model="values.deskripsi" dense label="Deskripsi" :rows="3" />
        <BaseTextarea v-model="values.alamat_lengkap" dense label="Alamat Lengkap" :rows="2" />

        <div class="form-card__grid">
          <OperatingHoursInput v-model="values.jam_operasional" dense label="Jam Operasional" />
          <BaseInput v-model="values.tahun_berdiri" dense label="Tahun Berdiri" placeholder="2015" />
        </div>

        <ImageUploader v-model="values.gambar_utama" folder="umkm" label="Gambar Utama" />
        <GalleryUploader v-model="gallery" folder="galeri-umkm" label="Galeri Foto" />

        <div class="form-card__publish">
          <BaseToggle v-model="values.published" />
          <span>Publikasikan UMKM ini</span>
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
            <UmkmCard
              :image="values.gambar_utama"
              :category="kategoriNama"
              :title="values.nama_usaha || 'Nama usaha'"
              :description="values.deskripsi"
              :address="values.alamat_lengkap"
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
