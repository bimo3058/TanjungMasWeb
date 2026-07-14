<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Pencil, Plus, Trash2 } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseToggle from '@/components/ui/BaseToggle.vue'
import IconButton from '@/components/ui/IconButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import BeritaSidebar from '@/components/ui/BeritaSidebar.vue'
import { useAdminPengumuman, type PengumumanFormValues } from '@/composables/useAdminInfoDesa'
import { formatTanggalIndonesia } from '@/utils/formatDate'
import type { Pengumuman } from '@/types/infoDesa'

const TINGKAT_OPTIONS = [
  { value: 'info', label: 'Info' },
  { value: 'penting', label: 'Penting' },
]

const { items, loading, saving, fetchList, save, togglePublished, remove } = useAdminPengumuman()

const form = reactive<PengumumanFormValues>({ judul: '', isi: '', tingkat: 'info' })
const editingId = ref<string | null>(null)
const formError = ref('')
const pendingDeleteId = ref<string | null>(null)
const deleting = ref(false)

// Pratinjau memakai komponen sidebar yang sama persis dengan halaman publik,
// jadi yang dilihat admin bukan tiruan yang bisa melenceng dari aslinya.
const preview = computed<Pengumuman[]>(() => [
  {
    id: 'preview',
    judul: form.judul.trim() || 'Judul pengumuman',
    isi: form.isi.trim() || null,
    tingkat: form.tingkat,
    published: true,
    created_at: new Date().toISOString(),
  },
])

onMounted(() => fetchList())

function resetForm() {
  form.judul = ''
  form.isi = ''
  form.tingkat = 'info'
  editingId.value = null
  formError.value = ''
}

function startEdit(item: Pengumuman) {
  form.judul = item.judul
  form.isi = item.isi ?? ''
  form.tingkat = item.tingkat
  editingId.value = item.id
  formError.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSave() {
  formError.value = ''
  if (!form.judul.trim()) {
    formError.value = 'Judul pengumuman wajib diisi.'
    return
  }

  const { error } = await save(form, editingId.value)
  if (error) {
    formError.value = error
    return
  }
  resetForm()
}

async function handleDelete() {
  if (!pendingDeleteId.value) return
  deleting.value = true
  await remove(pendingDeleteId.value)
  deleting.value = false
  // Baris yang sedang disunting bisa saja baris yang barusan dihapus.
  if (editingId.value === pendingDeleteId.value) resetForm()
  pendingDeleteId.value = null
}
</script>

<template>
  <div class="panel">
    <div class="lower">
      <form class="form-card" @submit.prevent="handleSave">
        <div class="form-card__header">
          <h2 class="form-card__title">
            {{ editingId ? 'Edit Pengumuman' : 'Tambah Pengumuman' }}
          </h2>
          <div class="form-card__actions">
            <BaseButton v-if="editingId" variant="outline" size="sm" type="button" @click="resetForm">
              Batal
            </BaseButton>
            <BaseButton variant="primary" size="sm" type="submit" :loading="saving">
              <template v-if="!editingId" #icon><Plus :size="15" /></template>
              {{ editingId ? 'Simpan Perubahan' : 'Tambah' }}
            </BaseButton>
          </div>
        </div>

        <BaseInput
          v-model="form.judul"
          dense
          label="Judul Pengumuman"
          placeholder="Peringatan Gelombang Tinggi Perairan Utara"
        />

        <BaseTextarea
          v-model="form.isi"
          dense
          label="Isi"
          :rows="3"
          placeholder="Dihimbau kepada seluruh nelayan untuk menunda aktivitas melaut pada 13–15 Juni."
        />

        <div class="form-card__grid">
          <BaseSelect v-model="form.tingkat" dense label="Tingkat" :options="TINGKAT_OPTIONS" />
        </div>
        <span class="form-card__hint">
          Tingkat "Penting" ditandai ikon peringatan di sidebar. Pengumuman yang terbit dalam 7 hari
          terakhir otomatis berlabel "Terkini".
        </span>

        <p v-if="formError" class="form-card__error">{{ formError }}</p>
      </form>

      <div class="side">
        <div class="preview-card">
          <div class="preview-card__header">
            <h2 class="preview-card__title">Pratinjau di Situs Publik</h2>
          </div>
          <div class="preview-card__body">
            <BeritaSidebar only="pengumuman" :pengumuman="preview" :festival="[]" />
          </div>
        </div>
      </div>
    </div>

    <div class="list-card">
      <div class="list-card__header">
        <h2 class="list-card__title">Daftar Pengumuman</h2>
        <span class="list-card__count">{{ items.length }} pengumuman</span>
      </div>

      <div v-if="loading" class="list-card__skeleton">
        <div v-for="n in 3" :key="n" class="list-card__skeleton-row" />
      </div>
      <p v-else-if="items.length === 0" class="list-card__empty">Belum ada pengumuman.</p>
      <ul v-else class="rows">
        <li
          v-for="item in items"
          :key="item.id"
          class="row"
          :class="{ 'row--editing': editingId === item.id }"
        >
          <div class="row__main">
            <div class="row__heading">
              <span v-if="item.tingkat === 'penting'" class="row__tag">Penting</span>
              <h3 class="row__title">{{ item.judul }}</h3>
            </div>
            <p v-if="item.isi" class="row__text">{{ item.isi }}</p>
            <span class="row__date">{{ formatTanggalIndonesia(item.created_at) }}</span>
          </div>

          <div class="row__side">
            <BaseToggle
              :model-value="item.published"
              @update:model-value="togglePublished(item.id, $event)"
            />
            <IconButton title="Edit" @click="startEdit(item)">
              <Pencil :size="13" />
            </IconButton>
            <IconButton title="Hapus" danger @click="pendingDeleteId = item.id">
              <Trash2 :size="13" />
            </IconButton>
          </div>
        </li>
      </ul>
    </div>

    <ConfirmDialog
      :open="!!pendingDeleteId"
      title="Hapus Pengumuman?"
      message="Pengumuman ini akan dihapus permanen dari sidebar halaman Berita."
      confirm-label="Hapus"
      danger
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="pendingDeleteId = null"
    />
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lower {
  display: flex;
  gap: 14px;
  align-items: start;
}

/* ---- Kartu form (mengikuti halaman Buat Berita) ---- */
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

.form-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.form-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.form-card__actions {
  display: flex;
  gap: 8px;
}

.form-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: start;
}

.form-card__hint {
  margin-top: -8px;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--text-muted);
}

.form-card__error {
  margin: 0;
  font-size: 13px;
  color: var(--danger);
}

/* ---- Pratinjau ---- */
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

/* Latar biru meniru kanvas halaman publik, supaya kartu panel di dalamnya
   terbaca sebagai kartu — bukan blok putih di atas putih. */
.preview-card__body {
  padding: 16px;
  background: var(--blue-50);
}

/* ---- Kartu daftar ---- */
.list-card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  overflow: hidden;
}

.list-card__header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--blue-200);
}

.list-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.list-card__count {
  font-size: 12.5px;
  color: var(--gray-500);
}

.list-card__empty {
  margin: 0;
  padding: 32px 24px;
  text-align: center;
  color: var(--text-muted);
}

.list-card__skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.list-card__skeleton-row {
  height: 46px;
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--blue-100) 25%, var(--blue-150) 37%, var(--blue-100) 63%);
  background-size: 400% 100%;
  animation: panel-shimmer 1.4s ease infinite;
}

@keyframes panel-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.rows {
  list-style: none;
  margin: 0;
  padding: 0;
}

.row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--blue-200);
}

.row:first-child {
  border-top: none;
}

.row:hover {
  background: var(--blue-50);
}

.row--editing {
  background: var(--blue-50);
  box-shadow: inset 3px 0 0 var(--gold-500);
}

.row__main {
  flex: 1;
  min-width: 0;
}

.row__heading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row__tag {
  flex-shrink: 0;
  padding: 1px 8px;
  border-radius: 9999px;
  background: var(--gold-500);
  color: var(--gold-ink);
  font-size: 10.5px;
  font-weight: var(--fw-semibold);
}

.row__title {
  margin: 0;
  font-size: 13.5px;
  font-weight: var(--fw-semibold);
  color: var(--ink-900);
  overflow-wrap: break-word;
}

.row__text {
  margin: 3px 0 0;
  font-size: 12px;
  line-height: 17px;
  color: var(--ink-700);
}

.row__date {
  display: block;
  margin-top: 4px;
  font-size: 11.5px;
  color: var(--gray-500);
}

.row__side {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  /* Pratinjau turun ke bawah form sebelum kolomnya terlalu sempit. */
  .lower {
    flex-direction: column;
  }

  .form-card,
  .side {
    width: 100%;
    flex: none;
  }

  .preview-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .form-card {
    padding: 14px;
  }

  .form-card__grid {
    grid-template-columns: 1fr;
  }

  .row {
    flex-direction: column;
    gap: 10px;
  }

  .row__side {
    align-self: flex-end;
  }
}
</style>
