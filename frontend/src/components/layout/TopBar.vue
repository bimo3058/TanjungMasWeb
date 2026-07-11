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
</script>

<template>
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
    <BaseButton variant="cta" class="topbar__cta" @click="router.push({ name: 'kontak' })">
      Hubungi Kami
    </BaseButton>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 54px;
  background: var(--blue-950);
  display: flex;
  align-items: center;
  padding: 0 36px;
  gap: 28px;
  font-family: var(--font-sans);
}

.topbar__brand {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  text-decoration: none;
}

.topbar__logo {
  height: 30px;
  width: auto;
}

.topbar__brand-text {
  line-height: 1;
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
  padding: 7px 18px !important;
  font-size: 13.5px !important;
  border-radius: var(--radius-pill) !important;
}
</style>
