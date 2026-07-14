<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import logoCrest from '@/assets/design/logo-crest.png'

const route = useRoute()
const router = useRouter()

const NAV = [
  { name: 'home', label: 'Beranda' },
  { name: 'wisata', label: 'Wisata' },
  { name: 'umkm', label: 'UMKM' },
  { name: 'berita', label: 'Berita' },
  { name: 'tentang', label: 'Tentang' },
]

const handleCtaClick = () => router.push({ name: 'kontak' })
</script>

<template>
  <!-- Di ponsel navigasi pindah ke bottom tab bar (AppTabBar), jadi top bar
       cukup memuat logo + CTA. Tidak ada lagi menu hamburger. -->
  <header class="topbar">
    <RouterLink :to="{ name: 'home' }" class="topbar__brand">
      <img :src="logoCrest" alt="Kelurahan Tanjung Mas" class="topbar__logo" />
      <div class="topbar__brand-text">
        <div class="topbar__wordmark">Tanjung Mas</div>
        <div class="topbar__eyebrow">Kampung Nelayan Bahari</div>
      </div>
    </RouterLink>

    <nav class="topbar__nav">
      <RouterLink
        v-for="item in NAV"
        :key="item.name"
        :to="{ name: item.name }"
        class="topbar__link"
        :class="{ 'topbar__link--active': route.name === item.name }"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <BaseButton variant="cta" class="topbar__cta" @click="handleCtaClick">
      Hubungi Kami
    </BaseButton>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  min-height: var(--public-topbar-height);
  background: var(--blue-950);
  display: flex;
  align-items: center;
  padding: var(--safe-top) 36px 0;
  gap: 28px;
  font-family: var(--font-sans);
}

.topbar__brand {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  text-decoration: none;
  min-width: 0;
}

.topbar__logo {
  height: 30px;
  width: auto;
  flex-shrink: 0;
}

.topbar__brand-text {
  line-height: 1;
  min-width: 0;
}

.topbar__wordmark {
  font-weight: var(--fw-bold);
  font-size: 14px;
  color: var(--white);
  line-height: 17px;
}

.topbar__eyebrow {
  font-size: 9.5px;
  font-weight: var(--fw-semibold);
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: var(--gold-400);
  white-space: nowrap;
}

.topbar__nav {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.topbar__link {
  font-size: 13.5px;
  font-weight: var(--fw-medium);
  cursor: pointer;
  color: var(--blue-300);
  background: transparent;
  padding: 7px 12px;
  border-radius: 8px;
  text-decoration: none;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.topbar__link:hover {
  color: var(--white);
}

.topbar__link--active {
  color: var(--white);
  font-weight: var(--fw-bold);
  background: rgba(255, 255, 255, 0.1);
}

.topbar__cta {
  flex-shrink: 0;
  padding: 7px 18px !important;
  font-size: 13.5px !important;
  border-radius: var(--radius-pill) !important;
}

@media (max-width: 768px) {
  .topbar {
    padding-left: var(--mobile-gutter);
    padding-right: var(--mobile-gutter);
    gap: 12px;
  }

  /* Tautan navigasi kini hidup di bottom tab bar. */
  .topbar__nav {
    display: none;
  }

  .topbar__cta {
    margin-left: auto;
    padding: 6px 14px !important;
    font-size: 12.5px !important;
  }
}

/* Layar sangat sempit: eyebrow dilepas agar CTA tetap muat. */
@media (max-width: 360px) {
  .topbar__eyebrow {
    display: none;
  }
}
</style>
