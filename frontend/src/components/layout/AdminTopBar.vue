<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bell,
  User,
  ExternalLink,
  Menu,
  UserCog,
  LogOut,
  FilePlus2,
  Pencil,
  Trash2,
  FileText,
  UserPlus,
  ShieldAlert,
} from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuth } from '@/composables/useAuth'
import {
  useNotifications,
  notifikasiTarget,
  type NotifikasiItem,
  type NotifikasiTipe,
} from '@/composables/useNotifications'
import { formatRelativeIndonesia } from '@/utils/formatDate'

const route = useRoute()
const router = useRouter()
const { user, displayName, signOut } = useAuth()

const { items: notifications, unread, loading: notifLoading, fetchAll, markAllRead, markRead } =
  useNotifications()

const NOTIF_ICON: Record<NotifikasiTipe, typeof Bell> = {
  konten_baru: FilePlus2,
  konten_diubah: Pencil,
  konten_dihapus: Trash2,
  draf: FileText,
  pengguna_baru: UserPlus,
  sistem: ShieldAlert,
}

const notifOpen = ref(false)
const notifRef = ref<HTMLElement | null>(null)
const unreadLabel = computed(() => (unread.value > 9 ? '9+' : String(unread.value)))

function toggleNotif() {
  notifOpen.value = !notifOpen.value
  // Ambil ulang tiap kali dibuka: realtime bersifat opsional, ini yang menjamin
  // isi laci selalu mutakhir.
  if (notifOpen.value) fetchAll()
}

async function openNotif(item: NotifikasiItem) {
  await markRead(item.id)
  const target = notifikasiTarget(item)
  notifOpen.value = false
  if (target) router.push(target)
}

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const title = computed(() => (route.meta.navTitle as string | undefined) ?? 'Admin Panel')
const initial = computed(() => (displayName.value[0] ?? 'A').toUpperCase())

// Menu avatar. Di ponsel ini satu-satunya jalan ke Kelola Pengguna & keluar,
// karena sidebar diganti tab bar yang hanya memuat 5 seksi utama.
const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function closeOnOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  if (menuRef.value && !menuRef.value.contains(target)) {
    menuOpen.value = false
  }
  if (notifRef.value && !notifRef.value.contains(target)) {
    notifOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutsideClick))

function go(name: string) {
  menuOpen.value = false
  router.push({ name })
}

async function handleLogout() {
  menuOpen.value = false
  await signOut()
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__left">
      <button class="topbar__hamburger" @click="emit('toggle')" aria-label="Toggle Sidebar">
        <Menu :size="24" color="var(--blue-950)" />
      </button>
      <span class="topbar__title">{{ title }}</span>
    </div>

    <div class="topbar__actions">
      <BaseButton class="topbar__view-site" variant="outline" size="sm" @click="router.push({ name: 'home' })">
        <template #icon><ExternalLink :size="15" /></template>
        Lihat Website
      </BaseButton>

      <div ref="notifRef" class="topbar__notif">
        <button
          class="topbar__bell"
          :aria-expanded="notifOpen"
          aria-haspopup="true"
          :title="unread ? `${unread} notifikasi belum dibaca` : 'Notifikasi'"
          @click="toggleNotif"
        >
          <Bell :size="18" color="var(--ink-700)" />
          <span v-if="unread > 0" class="topbar__bell-badge">{{ unreadLabel }}</span>
        </button>

        <div v-if="notifOpen" class="notif">
          <div class="notif__head">
            <h2 class="notif__title">
              Notifikasi
              <span v-if="unread > 0" class="notif__count">{{ unread }} baru</span>
            </h2>
            <button v-if="unread > 0" class="notif__mark-all" @click="markAllRead">
              Tandai semua dibaca
            </button>
          </div>

          <p v-if="notifLoading && !notifications.length" class="notif__empty">Memuat…</p>
          <p v-else-if="!notifications.length" class="notif__empty">Belum ada notifikasi.</p>

          <ul v-else class="notif__list">
            <li v-for="item in notifications" :key="item.id">
              <button
                class="notif__item"
                :class="{
                  'notif__item--unread': !item.dibaca,
                  'notif__item--kritis': item.severity === 'kritis',
                }"
                @click="openNotif(item)"
              >
                <span class="notif__icon" :class="`notif__icon--${item.severity}`">
                  <component :is="NOTIF_ICON[item.tipe]" :size="15" />
                </span>
                <span class="notif__body">
                  <span class="notif__pesan">{{ item.pesan ?? item.judul }}</span>
                  <span class="notif__time">{{ formatRelativeIndonesia(item.created_at) }}</span>
                </span>
                <span v-if="!item.dibaca" class="notif__dot" aria-label="Belum dibaca" />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div ref="menuRef" class="topbar__menu">
        <button
          class="topbar__avatar"
          :aria-expanded="menuOpen"
          aria-haspopup="true"
          title="Akun"
          @click="menuOpen = !menuOpen"
        >
          <User v-if="!user" :size="16" color="var(--blue-50)" />
          <span v-else>{{ initial }}</span>
        </button>

        <div v-if="menuOpen" class="topbar__dropdown">
          <div class="topbar__dropdown-head">
            <div class="topbar__dropdown-name">{{ user?.email ?? 'Admin' }}</div>
          </div>
          <button class="topbar__dropdown-item" @click="go('admin-akun')">
            <User :size="16" /> Akun Saya
          </button>
          <button class="topbar__dropdown-item" @click="go('admin-pengguna')">
            <UserCog :size="16" /> Kelola Pengguna
          </button>
          <button class="topbar__dropdown-item" @click="go('home')">
            <ExternalLink :size="16" /> Lihat Website
          </button>
          <button class="topbar__dropdown-item topbar__dropdown-item--danger" @click="handleLogout">
            <LogOut :size="16" /> Keluar
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  min-height: var(--topbar-height);
  flex-shrink: 0;
  background: var(--surface-card);
  border-bottom: 1px solid var(--blue-200);
  box-shadow: var(--shadow-btn);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: var(--safe-top) 20px 0;
  box-sizing: border-box;
  position: relative;
  z-index: 5;
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.topbar__hamburger {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.topbar__hamburger:hover {
  opacity: 0.7;
}

.topbar__title {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: var(--blue-950);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 14px;
  /* Jangkar laci notifikasi: di-anchor ke tepi kanan blok aksi (bukan ke tombol
     lonceng) agar panel yang lebar tidak meluber ke kiri layar di ponsel. */
  position: relative;
}

/* Sengaja `static`: biar laci di dalamnya ter-anchor ke .topbar__actions. */
.topbar__notif {
  display: inline-flex;
}

.topbar__bell {
  position: relative;
  display: inline-flex;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--ink-700);
  cursor: pointer;
}

.topbar__bell-badge {
  position: absolute;
  top: -5px;
  right: -6px;
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  box-sizing: border-box;
  border-radius: var(--radius-full);
  background: var(--danger);
  color: var(--white);
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: var(--fw-bold);
  line-height: 15px;
  text-align: center;
}

/* ---- Laci notifikasi ---- */
.notif {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 30;
  width: min(360px, calc(100vw - 32px));
  background: var(--surface-card);
  border: 1px solid var(--blue-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-pop);
  overflow: hidden;
}

.notif__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--blue-200);
}

.notif__title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}

.notif__count {
  padding: 1px 7px;
  border-radius: var(--radius-full);
  background: var(--blue-150);
  color: var(--blue-900);
  font-size: 10px;
  font-weight: var(--fw-semibold);
}

.notif__mark-all {
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: var(--fw-semibold);
  color: var(--blue-900);
  cursor: pointer;
}

.notif__mark-all:hover {
  text-decoration: underline;
}

.notif__list {
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 340px;
  overflow-y: auto;
}

.notif__empty {
  margin: 0;
  padding: 24px 14px;
  text-align: center;
  font-family: var(--font-sans);
  font-size: 12.5px;
  color: var(--gray-500);
}

.notif__item {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  border-top: 1px solid var(--blue-100);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.notif__list li:first-child .notif__item {
  border-top: none;
}

.notif__item:hover {
  background: var(--blue-50);
}

.notif__item--unread {
  background: var(--blue-50);
}

.notif__item--kritis {
  background: rgba(186, 26, 26, 0.05);
}

.notif__icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--blue-150);
  color: var(--blue-900);
}

.notif__icon--peringatan {
  background: rgba(243, 200, 72, 0.25);
  color: var(--gold-ink);
}

.notif__icon--kritis {
  background: rgba(186, 26, 26, 0.12);
  color: var(--danger);
}

.notif__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notif__pesan {
  font-family: var(--font-sans);
  font-size: 12.5px;
  line-height: 17px;
  color: var(--ink-900);
}

.notif__time {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--gray-500);
}

.notif__dot {
  flex-shrink: 0;
  margin-top: 6px;
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--blue-900);
}

.topbar__menu {
  position: relative;
  flex-shrink: 0;
}

.topbar__avatar {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  background: var(--blue-750);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--blue-50);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
}

.topbar__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 30;
  min-width: 208px;
  padding: 6px;
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-pop);
  border: 1px solid var(--blue-200);
}

.topbar__dropdown-head {
  padding: 8px 10px;
  border-bottom: 1px solid var(--blue-200);
  margin-bottom: 4px;
}

.topbar__dropdown-name {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--gray-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar__dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: var(--fw-medium);
  color: var(--ink-900);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;
}

.topbar__dropdown-item:hover {
  background: var(--blue-50);
}

.topbar__dropdown-item--danger {
  color: var(--danger);
}

@media (max-width: 1024px) {
  .topbar {
    padding-left: 16px;
    padding-right: 16px;
  }

  .topbar__hamburger {
    display: flex;
  }
}

@media (max-width: 768px) {
  /* Tab bar bawah menggantikan drawer, jadi hamburger tidak diperlukan. */
  .topbar__hamburger,
  .topbar__view-site {
    display: none;
  }

  .topbar__title {
    font-size: 18px;
  }

  .topbar__actions {
    gap: 12px;
  }
}
</style>
