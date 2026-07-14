<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseToggle from '@/components/ui/BaseToggle.vue'
import CategorySelect from '@/components/ui/CategorySelect.vue'
import ImageUploader from '@/components/ui/ImageUploader.vue'
import NewsCard from '@/components/ui/NewsCard.vue'
import FormChecklist from '@/components/admin/FormChecklist.vue'
import {
  getBeritaById,
  getDefaultPenulis,
  saveBerita,
  type BeritaFormValues,
} from '@/composables/useAdminBerita'
import { useCategories } from '@/composables/useCategories'
import { formatRelativeIndonesia } from '@/utils/formatDate'
import { slugify } from '@/utils/slugify'

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
  sorotan: false,
})

const tanggalPublikasiLocal = ref('')

const jumlahKata = computed(
  () => values.value.konten.trim().split(/\s+/).filter(Boolean).length,
)

const checklist = computed(() => [
  { label: 'Judul diisi', done: !!values.value.judul.trim() },
  { label: 'Konten minimal 40 kata', done: jumlahKata.value >= 40 },
  { label: 'Kategori dipilih', done: !!values.value.kategori_id },
  { label: 'Gambar utama diunggah', done: !!values.value.gambar_utama },
  { label: 'Status Terpublikasi', done: values.value.status === 'Terpublikasi' },
])

const checklistMeta = computed(() => {
  const kata = jumlahKata.value
  // Slug baru dihitung ulang dari judul saat menyimpan, jadi yang ditampilkan
  // di sini adalah tautan yang akan terbentuk — bukan slug lama yang tersimpan.
  const slug = slugify(values.value.judul) || 'judul-berita'

  return [
    { label: 'Jumlah kata', value: `${kata}` },
    // 200 kata per menit — kecepatan baca rata-rata orang dewasa.
    { label: 'Perkiraan baca', value: `${Math.max(1, Math.round(kata / 200))} menit` },
    { label: 'Tautan publik', value: `/berita/${slug}` },
  ]
})

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
    sorotan: row.sorotan,
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

        <div class="form-card__sorotan">
          <BaseToggle v-model="values.sorotan" />
          <div>
            <span class="form-card__field-label">Jadikan Sorotan</span>
            <span class="form-card__hint form-card__hint--inline">
              Tampil sebagai kartu besar di puncak halaman Berita. Hanya satu berita bisa jadi
              sorotan — menandai yang ini otomatis melepas sorotan sebelumnya.
            </span>
          </div>
        </div>

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

        <FormChecklist :items="checklist" :meta="checklistMeta" class="side__checklist" />
      </div>
    </div>
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

/* Tanpa stretch, tiap kolom setinggi isinya sendiri dan dasarnya tidak pernah
   sejajar. Kolom kanan yang menyesuaikan: checklist-nya memuai. */
.lower {
  flex: 1;
  display: flex;
  gap: 14px;
  align-items: stretch;
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

.form-card__sorotan {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--blue-50);
}

.form-card__sorotan .form-card__field-label {
  display: block;
}

.form-card__hint--inline {
  display: block;
  margin-top: 3px;
  line-height: 16px;
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
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Kartu pratinjau setinggi isinya; checklist menyerap sisa tinggi kolom agar
   dasarnya rata dengan kartu form di kiri. */
.side__checklist {
  flex: 1;
}

.preview-card {
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
