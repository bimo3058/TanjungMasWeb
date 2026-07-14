<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { Tab } from './tabs'

defineProps<{ tabs: Tab[] }>()

const route = useRoute()

// Rute anak (mis. admin-wisata-baru) harus tetap menyalakan tab induknya.
function isActive(name: string) {
  const current = route.name
  if (typeof current !== 'string') return false
  return current === name || current.startsWith(`${name}-`)
}
</script>

<template>
  <nav class="tabbar" aria-label="Navigasi utama">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.name"
      :to="{ name: tab.name }"
      class="tabbar__tab"
      :class="{ 'tabbar__tab--active': isActive(tab.name) }"
    >
      <component :is="tab.icon" :size="21" />
      <span class="tabbar__label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabbar {
  display: flex;
  flex-shrink: 0;
  /* Tinggi dikunci ke token: layout memakainya untuk menghitung spacer agar
     konten tidak tertutup, jadi tinggi nyata harus sama persis dengan token.
     Jarak aman bawah (home indicator) ditangani lewat posisi melayangnya,
     bukan padding di sini. */
  height: var(--tabbar-height);
  box-sizing: border-box;
  background: var(--surface-card);
  border: 1px solid var(--blue-200);
  border-radius: var(--radius-pill);
  box-shadow:
    0 8px 24px rgba(0, 2, 66, 0.14),
    0 2px 6px rgba(0, 2, 66, 0.06);
  padding: 6px 4px;
  font-family: var(--font-sans);
}

.tabbar__tab {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 2px;
  color: var(--gray-500);
  text-decoration: none;
  transition: color 0.15s ease;
}

.tabbar__label {
  font-size: 10px;
  /* Eksplisit — tanpa ini label mewarisi line-height body (24px) dan tab bar
     jadi ~16px lebih tinggi dari tokennya. */
  line-height: 13px;
  font-weight: var(--fw-medium);
  letter-spacing: 0.2px;
}

.tabbar__tab--active {
  color: var(--blue-900);
}

.tabbar__tab--active .tabbar__label {
  font-weight: var(--fw-bold);
}
</style>
