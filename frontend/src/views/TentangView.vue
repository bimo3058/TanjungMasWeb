<script setup lang="ts">
import { useRouter } from 'vue-router'
import { MapPin, Mail, Phone } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PublicCatalogHeader from '@/components/layout/PublicCatalogHeader.vue'
import { useProfilDesa } from '@/composables/useProfilDesa'
import heroVillage from '@/assets/design/hero-village.jpg'

const router = useRouter()
const { profil, loading } = useProfilDesa()
</script>

<template>
  <div>
    <PublicCatalogHeader
      :searchable="false"
      wide-lead
      eyebrow="Tentang Kami"
      :title="profil?.nama_desa || 'Kampung Nelayan Bahari Tambaklorok'"
      :lead="
        profil?.deskripsi_singkat ||
        'Kehidupan pesisir yang autentik di jantung Kota Semarang — wisata bahari, cita rasa laut, dan kehangatan masyarakat nelayan.'
      "
    />
    <section class="tentang">
    <div class="tentang__grid">
      <div v-slide-in class="story-card">
        <img :src="profil?.gambar_profil || heroVillage" class="story-card__image" alt="" />
        <div class="story-card__body">
          <div class="story-card__eyebrow">Sejarah Kampung</div>
          <h2 class="story-card__title">Asal-Usul &amp; Perjalanan</h2>
          <p v-if="loading" class="story-card__loading">Memuat...</p>
          <template v-else>
            <p v-if="profil?.sejarah_asal_usul" class="story-card__text">{{ profil.sejarah_asal_usul }}</p>
            <p v-else class="story-card__text">Cerita asal-usul desa akan segera hadir.</p>
          </template>
        </div>
      </div>
      <div class="side">
        <div v-slide-in style="animation-delay: 120ms" class="contact-card">
          <h3 class="contact-card__title">Kontak & Alamat</h3>
          <div v-if="profil?.alamat_kantor" class="contact-card__row">
            <MapPin :size="14" class="contact-card__icon" />
            <span>{{ profil.alamat_kantor }}</span>
          </div>
          <div v-if="profil?.kontak_email" class="contact-card__row">
            <Mail :size="14" class="contact-card__icon" />
            <span>{{ profil.kontak_email }}</span>
          </div>
          <div v-if="profil?.kontak_telepon" class="contact-card__row">
            <Phone :size="14" class="contact-card__icon" />
            <span>{{ profil.kontak_telepon }}</span>
          </div>
        </div>
        <div v-slide-in style="animation-delay: 240ms" class="cta-card">
          <h3 class="cta-card__title">Rencanakan Kunjungan</h3>
          <p class="cta-card__text">
            Hubungi Pokdarwis untuk paket susur kampung, wisata perahu, dan kuliner pesisir.
          </p>
          <BaseButton variant="cta" class="cta-card__btn" @click="router.push({ name: 'kontak' })">
            Hubungi Kami
          </BaseButton>
        </div>
      </div>
    </div>
    </section>
  </div>
</template>

<style scoped>
.tentang {
  padding: 40px 36px 56px;
  background: var(--blue-50);
  font-family: var(--font-sans);
}

.tentang__grid {
  max-width: var(--content-max);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
  align-items: start;
}

.story-card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  overflow: hidden;
}

.story-card__image {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
}

.story-card__body {
  padding: 20px 24px 24px;
}

.story-card__eyebrow {
  font-size: 11.5px;
  font-weight: var(--fw-bold);
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--gold-500);
}

.story-card__title {
  margin: 6px 0 12px;
  font-size: 26px;
  line-height: 32px;
  font-weight: var(--fw-bold);
  color: var(--blue-950);
}

.story-card__loading {
  margin: 0;
  color: var(--text-muted);
}

.story-card__text {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--ink-700);
}

.story-card__text:last-child {
  margin-bottom: 0;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  padding: 16px 18px;
}

.contact-card__title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.contact-card__row {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 5px 0;
  font-size: 13px;
  line-height: 19px;
  color: var(--ink-700);
}

.contact-card__icon {
  color: var(--blue-900);
  flex-shrink: 0;
  margin-top: 2px;
}

.cta-card {
  background: var(--blue-900);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  padding: 18px;
  color: var(--white);
}

.cta-card__title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: var(--fw-bold);
}

.cta-card__text {
  margin: 0 0 14px;
  font-size: 12.5px;
  line-height: 18px;
  color: rgba(190, 194, 255, 0.9);
}

.cta-card__btn {
  padding: 9px 20px !important;
  font-size: 13.5px !important;
}

@media (max-width: 860px) {
  .tentang__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .tentang {
    padding: 28px 20px 40px;
  }
  .story-card__body {
    padding: 18px 18px 20px;
  }
  .story-card__title {
    font-size: 22px;
    line-height: 28px;
  }
}
</style>
