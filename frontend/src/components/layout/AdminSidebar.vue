<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LayoutGrid, Waves, Store, Newspaper, Info, LogOut } from '@lucide/vue'
import logoCrest from '@/assets/design/logo-crest.png'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user, signOut } = useAuth()

const NAV = [
  { name: 'admin-dashboard', label: 'Dashboard', icon: LayoutGrid },
  { name: 'admin-wisata', label: 'Manajemen Wisata', icon: Waves },
  { name: 'admin-umkm', label: 'Manajemen UMKM', icon: Store },
  { name: 'admin-berita', label: 'Manajemen Berita', icon: Newspaper },
  { name: 'admin-profil', label: 'Profil Desa', icon: Info },
]

const displayName = computed(
  () => (user.value?.user_metadata?.full_name as string | undefined) ??
    user.value?.email?.split('@')[0] ??
    'Admin',
)

function isActive(name: string) {
  return route.matched.some((record) => record.name === name)
}

async function handleLogout() {
  await signOut()
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <aside class="sidebar">
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
      >
        <component :is="item.icon" :size="17" class="sidebar__icon" />
        {{ item.label }}
      </RouterLink>
    </nav>
    <div class="sidebar__user">
      <div class="sidebar__user-text">
        <div class="sidebar__user-name">{{ displayName }}</div>
        <div class="sidebar__user-email">{{ user?.email }}</div>
      </div>
      <button type="button" class="sidebar__logout" title="Keluar" @click="handleLogout">
        <LogOut :size="16" />
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
}

.sidebar__user-name {
  font-family: var(--font-sans);
  font-size: 12.5px;
  font-weight: var(--fw-semibold);
  color: var(--white);
  line-height: 16px;
  text-transform: capitalize;
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
</style>
