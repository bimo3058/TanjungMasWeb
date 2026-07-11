<script setup lang="ts">
import { ref } from 'vue'
import { Mail, Phone, MapPin } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import ImageUploader from '@/components/ui/ImageUploader.vue'
import { useAdminProfilDesa } from '@/composables/useAdminProfilDesa'
import { formatRelativeIndonesia } from '@/utils/formatDate'
import heroFallback from '@/assets/design/hero-village.jpg'

const { profil, loading, saving, error, updatedAt, save } = useAdminProfilDesa()
const savedMessage = ref(false)

async function handleSubmit() {
  savedMessage.value = false
  try {
    await save(profil.value)
    savedMessage.value = true
  } catch {
    // error state already surfaced via `error` ref
  }
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <div class="page__heading">
        <h1 class="page__title">Profil Desa</h1>
        <span class="page__count">informasi umum situs publik</span>
      </div>
      <BaseButton variant="primary" size="sm" type="submit" form="profil-form" :loading="saving">
        Simpan Perubahan
      </BaseButton>
    </div>

    <p v-if="loading" class="page__loading">Memuat data...</p>

    <div v-else class="lower">
      <form id="profil-form" class="form-card" @submit.prevent="handleSubmit">
        <div class="form-card__grid">
          <BaseInput v-model="profil.nama_desa" dense label="Nama Desa" />
          <BaseInput v-model="profil.alamat_kantor" dense label="Alamat Kantor" />
          <BaseInput v-model="profil.kontak_email" dense label="Email Kontak" type="email">
            <template #icon><Mail :size="14" /></template>
          </BaseInput>
          <BaseInput v-model="profil.kontak_telepon" dense label="Telepon Kontak" type="tel">
            <template #icon><Phone :size="14" /></template>
          </BaseInput>
        </div>

        <BaseTextarea v-model="profil.deskripsi_singkat" dense label="Deskripsi Singkat" :rows="2" />
        <BaseTextarea v-model="profil.sejarah_asal_usul" dense label="Sejarah / Asal-usul" :rows="8" />

        <ImageUploader
          v-model="profil.gambar_profil"
          folder="profil-desa"
          label="Gambar Tentang Desa"
          enable-crop
          :crop-aspect-ratio="480 / 340"
        />

        <div class="form-card__divider">Hero Beranda (Halaman Utama)</div>

        <BaseInput
          v-model="profil.hero_eyebrow"
          dense
          label="Label Lokasi"
          placeholder="Semarang · Jawa Tengah"
        />
        <BaseInput
          v-model="profil.hero_title"
          dense
          label="Judul Hero"
          placeholder="Desa Wisata Kampung Nelayan Bahari Tambaklorok"
        />
        <BaseTextarea
          v-model="profil.hero_lead"
          dense
          label="Deskripsi Hero"
          placeholder="Kehidupan pesisir yang autentik — wisata bahari, cita rasa laut, dan kehangatan masyarakat nelayan Semarang."
          :rows="2"
        />
        <ImageUploader
          v-model="profil.hero_image"
          folder="profil-desa"
          label="Gambar Hero"
          enable-crop
          :crop-aspect-ratio="16 / 6"
        />

        <p v-if="error" class="form-card__error">{{ error }}</p>
        <p v-else-if="savedMessage" class="form-card__success">Perubahan berhasil disimpan.</p>

        <div v-if="updatedAt" class="form-card__footer">
          Terakhir diperbarui {{ formatRelativeIndonesia(updatedAt) }}
        </div>
      </form>

      <div class="side">
        <div class="preview-card">
          <div class="preview-card__header">
            <h2 class="preview-card__title">Pratinjau di Situs Publik</h2>
          </div>
          <img :src="profil.gambar_profil || heroFallback" class="preview-card__image" alt="" />
          <div class="preview-card__body">
            <div class="preview-card__name">{{ profil.nama_desa || 'Desa Wisata Tanjung Mas' }}</div>
            <div v-if="profil.deskripsi_singkat" class="preview-card__desc">
              {{ profil.deskripsi_singkat }}
            </div>
            <div v-if="profil.alamat_kantor" class="preview-card__row">
              <MapPin :size="14" class="preview-card__icon" />
              <span>{{ profil.alamat_kantor }}</span>
            </div>
            <div v-if="profil.kontak_email" class="preview-card__row">
              <Mail :size="14" class="preview-card__icon" />
              <span>{{ profil.kontak_email }}</span>
            </div>
            <div v-if="profil.kontak_telepon" class="preview-card__row">
              <Phone :size="14" class="preview-card__icon" />
              <span>{{ profil.kontak_telepon }}</span>
            </div>
          </div>
        </div>

        <div class="history-card">
          <div class="history-card__header">
            <h2 class="history-card__title">Riwayat Perubahan</h2>
          </div>
          <div class="history-card__empty">Belum ada riwayat tercatat.</div>
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

.page__loading {
  color: var(--text-muted);
}

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
}

.form-card__divider {
  margin-top: 4px;
  padding-top: 14px;
  border-top: 1px solid var(--blue-200);
  font-size: 11px;
  font-weight: var(--fw-semibold);
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--gray-500);
}

.form-card__error {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--danger);
}

.form-card__success {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--color-primary);
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

.preview-card__image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.preview-card__body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-card__name {
  font-size: 14px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.preview-card__desc {
  font-size: 12.5px;
  line-height: 18px;
  color: var(--ink-700);
}

.preview-card__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  line-height: 17px;
  color: var(--ink-700);
}

.preview-card__icon {
  color: var(--blue-900);
  flex-shrink: 0;
  margin-top: 1px;
}

.history-card {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
}

.history-card__header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--blue-200);
}

.history-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.history-card__empty {
  padding: 16px;
  font-size: 12.5px;
  color: var(--gray-500);
}
</style>
