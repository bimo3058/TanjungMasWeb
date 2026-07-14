<script setup lang="ts">
import { MapPin, Mail, Phone } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useProfilDesa } from '@/composables/useProfilDesa'
import heroVillage from '@/assets/design/hero-village.jpg'

const { profil, loading } = useProfilDesa()
</script>

<template>
  <div>
    <section
      class="kontak-header"
      :style="{ backgroundImage: `linear-gradient(rgba(0,2,66,.78),rgba(0,2,66,.78)), url(${heroVillage})` }"
    >
      <div class="kontak-header__inner">
        <h1 class="kontak-header__title">Hubungi Kami</h1>
        <p class="kontak-header__lead">
          Ada pertanyaan atau ingin merencanakan kunjungan? Hubungi Kelurahan Tanjung Mas melalui
          kontak berikut.
        </p>
      </div>
    </section>

    <section class="kontak-body">
      <div v-slide-in class="kontak-card">
        <h2 class="kontak-card__title">Kantor Kelurahan Tanjung Mas</h2>
        <p v-if="loading" class="kontak-card__loading">Memuat...</p>
        <template v-else>
          <p v-if="profil?.deskripsi_singkat" class="kontak-card__desc">{{ profil.deskripsi_singkat }}</p>

          <div class="kontak-card__rows">
            <div v-if="profil?.alamat_kantor" class="kontak-card__row">
              <MapPin :size="16" class="kontak-card__icon" />
              <span>{{ profil.alamat_kantor }}</span>
            </div>
            <div v-if="profil?.kontak_email" class="kontak-card__row">
              <Mail :size="16" class="kontak-card__icon" />
              <span>{{ profil.kontak_email }}</span>
            </div>
            <div v-if="profil?.kontak_telepon" class="kontak-card__row">
              <Phone :size="16" class="kontak-card__icon" />
              <span>{{ profil.kontak_telepon }}</span>
            </div>
          </div>

          <div class="kontak-card__actions">
            <BaseButton
              v-if="profil?.kontak_email"
              variant="primary"
              :href="`mailto:${profil.kontak_email}`"
            >
              <template #icon><Mail :size="16" /></template>
              Kirim Email
            </BaseButton>
            <BaseButton
              v-if="profil?.kontak_telepon"
              variant="outline"
              :href="`tel:${profil.kontak_telepon}`"
            >
              <template #icon><Phone :size="16" /></template>
              Telepon
            </BaseButton>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.kontak-header {
  padding: 36px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  font-family: var(--font-sans);
}

.kontak-header__inner {
  max-width: var(--content-max);
  margin: 0 auto;
}

.kontak-header__title {
  margin: 0;
  font-size: 30px;
  line-height: 36px;
  font-weight: var(--fw-bold);
  color: var(--white);
}

.kontak-header__lead {
  margin: 6px 0 0;
  max-width: 560px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
}

.kontak-body {
  padding: 40px 36px 56px;
  background: var(--blue-50);
  font-family: var(--font-sans);
}

.kontak-card {
  max-width: 560px;
  margin: 0 auto;
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  padding: 28px 32px;
}

.kontak-card__title {
  margin: 0 0 10px;
  font-size: 22px;
  line-height: 28px;
  font-weight: var(--fw-bold);
  color: var(--blue-950);
}

.kontak-card__loading {
  color: var(--text-muted);
}

.kontak-card__desc {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ink-700);
}

.kontak-card__rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--blue-200);
}

.kontak-card__row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  font-size: 14px;
  line-height: 20px;
  color: var(--ink-700);
  border-bottom: 1px solid var(--blue-100);
  overflow-wrap: anywhere;
}

.kontak-card__row:last-child {
  border-bottom: none;
}

.kontak-card__icon {
  color: var(--blue-900);
  flex-shrink: 0;
  margin-top: 1px;
}

.kontak-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 600px) {
  .kontak-header {
    padding: 32px 20px;
  }
  .kontak-header__title {
    font-size: 25px;
    line-height: 30px;
  }
  .kontak-body {
    padding: 28px 20px 44px;
  }
  .kontak-card {
    padding: 22px 20px;
  }
}
</style>
