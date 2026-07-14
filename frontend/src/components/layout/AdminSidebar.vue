<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import {
  mdiViewDashboard,
  mdiMapOutline,
  mdiStorefront,
  mdiNewspaper,
  mdiInformation,
  mdiAccountCog,
  mdiLogout
} from '@mdi/js'
import logoCrest from '@/assets/design/logo-crest.png'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const { user, isAdmin, displayName, signOut } = useAuth()

// Gunakan path MDI untuk ikon menu
const NAV = [
  { name: 'admin-dashboard', label: 'Dashboard', icon: mdiViewDashboard },
  { name: 'admin-wisata', label: 'Manajemen Wisata', icon: mdiMapOutline },
  { name: 'admin-umkm', label: 'Manajemen UMKM', icon: mdiStorefront },
  { name: 'admin-berita', label: 'Manajemen Berita', icon: mdiNewspaper },
  { name: 'admin-profil', label: 'Profil Desa', icon: mdiInformation },
  { name: 'admin-pengguna', label: 'Kelola Pengguna', icon: mdiAccountCog },
]

function isActive(name: string) {
  return route.matched.some((record) => record.name === name)
}

async function handleLogout() {
  await signOut()
  router.push({ name: 'admin-login' })
}

// Menutup sidebar di perangkat mobile ketika tautan diklik
function handleClose() {
  if (window.innerWidth <= 1024) {
    emit('close')
  }
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--open': isOpen }">
    <div class="sidebar__brand">
      <img :src="logoCrest" alt="Kelurahan Tanjung Mas" class="sidebar__logo" />
      <div class="sidebar__brand-text">
        <div class="sidebar__wordmark">Tanjung Mas</div>
        <div class="sidebar__subtitle">Admin Portal</div>
      </div>
    </div>
    <nav class="sidebar__nav">
      <div class="sidebar__eyebrow">MENU</div>
      <RouterLink
        v-for="item in NAV"
        :key="item.name"
        :to="{ name: item.name }"
        class="sidebar__link"
        :class="{ 'sidebar__link--active': isActive(item.name) }"
        @click="handleClose"
      >
        <!-- Menggunakan SVG untuk merender MDI -->
        <svg viewBox="0 0 24 24" width="17" height="17" class="sidebar__icon">
          <path :d="item.icon" fill="currentColor" />
        </svg>
        {{ item.label }}
      </RouterLink>
    </nav>
    <div class="sidebar__user">
      <RouterLink
        :to="{ name: 'admin-akun' }"
        class="sidebar__user-text"
        title="Akun Saya"
        @click="handleClose"
      >
        <div class="sidebar__user-name">
          {{ displayName }}
          <span v-if="isAdmin" class="sidebar__user-role">Admin</span>
        </div>
        <div class="sidebar__user-email">{{ user?.email }}</div>
      </RouterLink>
      <button type="button" class="sidebar__logout" title="Keluar" @click="handleLogout">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path :d="mdiLogout" fill="currentColor" />
        </svg>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
  background: var(--blue-950);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-nav);
  z-index: 100;
  transition: transform 0.3s ease-in-out;
}

.sidebar__brand {
  padding: 18px 22px 14px;
  display: flex;
  align-items: center;
  gap: 11px;
}

.sidebar__logo {
  height: 34px;
  width: auto;
  flex-shrink: 0;
}

.sidebar__brand-text {
  min-width: 0;
}

.sidebar__wordmark {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: var(--fw-bold);
  line-height: 18px;
  color: var(--white);
}

.sidebar__subtitle {
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: var(--fw-semibold);
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--gold-400);
}

.sidebar__nav {
  padding: 6px 0;
  display: flex;
  flex-direction: column;
  flex: 1; /* Mendorong profil user ke bawah */
}

.sidebar__eyebrow {
  padding: 6px 22px;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: var(--fw-semibold);
  letter-spacing: 1.2px;
  color: rgba(255, 255, 255, 0.35);
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 1px 10px;
  padding: 9px 12px;
  box-sizing: border-box;
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 18px;
  letter-spacing: var(--ls-label);
  background: transparent;
  color: var(--blue-300);
  font-weight: var(--fw-medium);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  text-decoration: none;
}

.sidebar__link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--white);
}

.sidebar__link--active {
  background: rgba(255, 255, 255, 0.12);
  color: var(--white);
  font-weight: var(--fw-bold);
}

.sidebar__icon {
  flex-shrink: 0;
}

.sidebar__link--active .sidebar__icon {
  color: var(--gold-400);
}

.sidebar__user {
  margin: auto 10px 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar__user-text {
  min-width: 0;
  flex: 1;
  text-decoration: none;
  border-radius: 8px;
  transition: opacity 0.15s ease;
}

.sidebar__user-text:hover {
  opacity: 0.8;
}

.sidebar__user-name {
  font-family: var(--font-sans);
  font-size: 12.5px;
  font-weight: var(--fw-semibold);
  color: var(--white);
  line-height: 16px;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sidebar__user-role {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--gold-400);
  color: var(--blue-950);
  font-size: 9px;
  font-weight: var(--fw-bold);
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.sidebar__user-email {
  font-family: var(--font-sans);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__logout {
  flex-shrink: 0;
  display: inline-flex;
  padding: 4px;
  border: none;
  background: transparent;
  color: var(--blue-300);
  cursor: pointer;
}

.sidebar__logout:hover {
  color: var(--white);
}

/* KODE RESPONSIVITAS SIDEBAR */
@media (max-width: 1024px) {
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
  }

  .sidebar.sidebar--open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  }
}

/* Di ponsel navigasi ditangani AdminTabBar (tab bar bawah) + menu avatar. */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>