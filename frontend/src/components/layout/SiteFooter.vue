<script setup lang="ts">
import { computed } from 'vue'
import { MapPin, Mail, Phone } from '@lucide/vue'
import logoCrest from '@/assets/design/logo-crest.png'
import { useProfilDesa } from '@/composables/useProfilDesa'

const { profil } = useProfilDesa()

const EXPLORE_LINKS = [
  { name: 'wisata', label: 'Wisata' },
  { name: 'umkm', label: 'UMKM' },
  { name: 'berita', label: 'Berita' },
  { name: 'tentang', label: 'Tentang' },
  { name: 'kontak', label: 'Hubungi Kami' },
]

const CONTACT = computed(() =>
  [
    profil.value?.alamat_kantor && { icon: MapPin, text: profil.value.alamat_kantor },
    profil.value?.kontak_email && { icon: Mail, text: profil.value.kontak_email },
    profil.value?.kontak_telepon && { icon: Phone, text: profil.value.kontak_telepon },
  ].filter((row): row is { icon: typeof MapPin; text: string } => !!row),
)
</script>

<template>
  <footer class="footer">
    <div class="footer__grid">
      <div class="footer__brand">
        <div class="footer__brand-row">
          <img :src="logoCrest" alt="Kelurahan Tanjung Mas" class="footer__logo" />
          <b class="footer__wordmark">Kelurahan Tanjung Mas</b>
        </div>
        <p class="footer__tagline">
          Desa Wisata Kampung Nelayan Bahari. Melestarikan budaya, memberdayakan pesisir.
        </p>
      </div>
      <div>
        <h4 class="footer__heading">Jelajahi</h4>
        <RouterLink
          v-for="link in EXPLORE_LINKS"
          :key="link.name"
          :to="{ name: link.name }"
          class="footer__link"
        >
          {{ link.label }}
        </RouterLink>
      </div>
      <div>
        <h4 class="footer__heading">Kontak</h4>
        <div v-for="(item, i) in CONTACT" :key="i" class="footer__contact-row">
          <component :is="item.icon" :size="13" class="footer__contact-icon" />
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© 2026 Kampung Nelayan Bahari Tambaklorok. All Rights Reserved.</span>
      <span>Dikelola oleh Pokdarwis &amp; Pemerintah Kelurahan</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--blue-950);
  padding: 32px 36px 20px;
  color: rgba(255, 255, 255, 0.85);
  font-family: var(--font-sans);
}

.footer__grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.2fr;
  gap: 36px;
  max-width: 1160px;
  margin: 0 auto;
}

.footer__brand-row {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
}

.footer__logo {
  height: 32px;
  width: auto;
}

.footer__wordmark {
  color: var(--white);
  font-size: 14px;
  line-height: 18px;
}

.footer__tagline {
  font-size: 12.5px;
  line-height: 1.6;
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
}

.footer__heading {
  color: var(--gold-400);
  font-size: 11px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin: 0 0 8px;
}

.footer__link {
  display: block;
  font-size: 13px;
  padding: 3px 0;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
}

.footer__link:hover {
  color: var(--white);
}

.footer__contact-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 3px 0;
  color: rgba(255, 255, 255, 0.75);
}

.footer__contact-icon {
  color: var(--gold-400);
  flex-shrink: 0;
}

.footer__bottom {
  max-width: 1160px;
  margin: 24px auto 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
