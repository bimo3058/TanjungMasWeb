<script setup lang="ts">
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import logoCrest from '@/assets/design/logo-crest.png'

const route = useRoute()

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
    <div class="topbar__brand">
      <img :src="logoCrest" alt="Kelurahan Tanjung Mas" class="topbar__logo" />
      <span class="topbar__wordmark">Kelurahan Tanjung Mas</span>
    </div>
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
    <BaseButton variant="cta" class="topbar__cta">Hubungi Kami</BaseButton>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 60px;
  background: var(--blue-700);
  display: flex;
  align-items: center;
  padding: 0 52px;
  gap: 40px;
}

.topbar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar__logo {
  height: 34px;
  width: auto;
}

.topbar__wordmark {
  font-family: var(--font-sans);
  font-weight: var(--fw-semibold);
  font-size: 18px;
  color: var(--blue-300);
  white-space: nowrap;
}

.topbar__nav {
  display: flex;
  gap: 28px;
  margin-left: auto;
}

.topbar__link {
  font-family: var(--font-sans);
  font-size: var(--fs-md);
  font-weight: var(--fw-medium);
  cursor: pointer;
  color: var(--blue-300);
  border-bottom: 2px solid transparent;
  padding-bottom: 4px;
}

.topbar__link--active {
  color: var(--white);
  border-bottom-color: var(--gold-500);
}

.topbar__cta {
  padding: 9px 22px !important;
  font-size: var(--fs-md) !important;
  border-radius: var(--radius-pill) !important;
}
</style>
