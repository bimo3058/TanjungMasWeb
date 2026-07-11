<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import CategorySelect from '@/components/ui/CategorySelect.vue'
import ImageUploader from '@/components/ui/ImageUploader.vue'
import NewsCard from '@/components/ui/NewsCard.vue'
import {
  getBeritaById,
  getDefaultPenulis,
  saveBerita,
  type BeritaFormValues,
} from '@/composables/useAdminBerita'
import { useCategories } from '@/composables/useCategories'
import { formatRelativeIndonesia } from '@/utils/formatDate'

const route = useRoute()
const router = useRouter()

const id = route.params.id as string | undefined
const isEdit = !!id

const { categories } = useCategories('kategori_berita')
const kategoriNama = computed(
  () => categories.value.find((k) => k.id === values.value.kategori_id)?.nama,
)

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Terpublikasi', label: 'Terpublikasi' },
]

const loading = ref(isEdit)
const saving = ref(false)
const error = ref('')
const updatedAt = ref<string | null>(null)

const values = ref<BeritaFormValues>({
  judul: '',
  konten: '',
  gambar_utama: null,
  kategori_id: null,
  status: 'Draft',
  penulis: 'Admin Utama',
  tanggal_publikasi: null,
})

const tanggalPublikasiLocal = ref('')

function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(local: string): string | null {
  if (!local) return null
  return new Date(local).toISOString()
}

onMounted(async () => {
  if (!id) {
    values.value.penulis = await getDefaultPenulis()
    return
  }
  const row = await getBeritaById(id)
  if (!row) {
    error.value = 'Data berita tidak ditemukan.'
    loading.value = false
    return
  }
  values.value = {
    judul: row.judul,
    konten: row.konten,
    gambar_utama: row.gambar_utama,
    kategori_id: row.kategori_id,
    status: row.status,
    penulis: row.penulis,
    tanggal_publikasi: row.tanggal_publikasi,
  }
  tanggalPublikasiLocal.value = toLocalInput(row.tanggal_publikasi)
  updatedAt.value = row.updated_at
  loading.value = false
})

async function handleSubmit() {
  if (!values.value.judul.trim()) {
    error.value = 'Judul berita wajib diisi.'
    return
  }
  error.value = ''
  saving.value = true
  try {
    values.value.tanggal_publikasi = fromLocalInput(tanggalPublikasiLocal.value)
    await saveBerita(values.value, id)
    router.push({ name: 'admin-berita' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal menyimpan berita.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ isEdit ? 'Edit Berita' : 'Tambah Berita' }}</h1>
      <div class="page__actions">
        <BaseButton variant="outline" size="sm" type="button" @click="router.push({ name: 'admin-berita' })">
          Batal
        </BaseButton>
        <BaseButton variant="primary" size="sm" type="submit" form="berita-form" :loading="saving">
          Simpan
        </BaseButton>
      </div>
    </div>

    <p v-if="loading" class="page__loading">Memuat data...</p>

    <div v-else class="lower">
      <form id="berita-form" class="form-card" @submit.prevent="handleSubmit">
        <BaseInput v-model="values.judul" dense label="Judul Berita" />
        <BaseTextarea v-model="values.konten" dense label="Konten" :rows="5" />

        <div class="form-card__grid">
          <CategorySelect v-model="values.kategori_id" dense table="kategori_berita" label="Kategori" />
          <BaseSelect v-model="values.status" dense label="Status" :options="STATUS_OPTIONS" />
        </div>

        <div class="form-card__grid">
          <BaseInput v-model="values.penulis" dense label="Penulis" />
          <label class="form-card__field">
            <span class="form-card__field-label">Tanggal Publikasi</span>
            <input v-model="tanggalPublikasiLocal" type="datetime-local" class="form-card__datetime" />
          </label>
        </div>
        <span class="form-card__hint">
          Tanggal dikosongkan berarti otomatis diisi saat status diubah ke Terpublikasi.
        </span>

        <ImageUploader v-model="values.gambar_utama" folder="berita" label="Gambar Utama" />

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
            <NewsCard
              :image="values.gambar_utama"
              :category="kategoriNama"
              :date="values.tanggal_publikasi"
              :title="values.judul || 'Judul berita'"
              :excerpt="values.konten"
              big
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

.form-card__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-card__field-label {
  font-size: 12px;
  line-height: 16px;
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-label);
  color: var(--ink-900);
}

.form-card__datetime {
  box-sizing: border-box;
  padding: 8px 10px;
  background: var(--blue-50);
  border: 1px solid var(--border-input);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--ink-900);
  outline: none;
}

.form-card__hint {
  margin-top: -8px;
  font-size: 11.5px;
  color: var(--text-muted);
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
