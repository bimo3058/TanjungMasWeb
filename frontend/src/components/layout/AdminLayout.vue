<template>
  <div class="dashboard-layout">
    
    <div 
      class="sidebar-overlay" 
      v-if="isSidebarOpen" 
      @click="closeSidebar"
    ></div>

    <AdminSidebar :isOpen="isSidebarOpen" @close="closeSidebar" />

    <main class="main-content">

      <AdminTopBar @toggle="toggleSidebar" />

      <!-- Hanya area ini yang bergulir; top bar & tab bar tetap di tempatnya. -->
      <div class="content-scroll">
        <RouterView />
      </div>

      <!-- Navigasi utama di ponsel; sidebar disembunyikan pada lebar ini. -->
      <AppTabBar :tabs="TABS" class="tabbar" />

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LayoutGrid, Waves, Store, Newspaper, Info } from '@lucide/vue'
import AdminSidebar from './AdminSidebar.vue'
import AdminTopBar from './AdminTopBar.vue'
import AppTabBar from './AppTabBar.vue'
import type { Tab } from './tabs'
import { useIdleTimeout } from '@/composables/useIdleTimeout'

// Kelola Pengguna & Keluar ada di menu avatar (AdminTopBar), bukan di sini.
const TABS: Tab[] = [
  { name: 'admin-dashboard', label: 'Dashboard', icon: LayoutGrid },
  { name: 'admin-wisata', label: 'Wisata', icon: Waves },
  { name: 'admin-umkm', label: 'UMKM', icon: Store },
  { name: 'admin-berita', label: 'Berita', icon: Newspaper },
  { name: 'admin-profil', label: 'Profil', icon: Info },
]

// Auto-logout saat idle. Aktif hanya selama panel admin (komponen ini) hidup.
useIdleTimeout()

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Poppins', sans-serif;
}

.dashboard-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #F8F9FF;
  overflow: hidden;
  position: relative;
}

/* Tiga baris tetap: top bar · area gulir · tab bar. `overflow: hidden` di sini
   memastikan yang bergulir hanya .content-scroll, bukan seluruh kolom — jadi
   top bar tidak ikut tergulir dan tab bar tidak pernah menutupi konten. */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #F8F9FF;
  overflow: hidden;
  min-width: 0;
  /* Jangkar untuk tab bar melayang di ponsel. */
  position: relative;
}

.content-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
}

/* Halaman ikut mengisi ruang sisa bila kontennya pendek, tetapi TIDAK boleh
   dimampatkan bila kontennya panjang (flex-shrink: 0). Tanpa ini kartu-kartu
   di dalamnya ikut menyusut dan isinya terpotong alih-alih memicu scroll. */
.content-scroll > * {
  flex: 1 0 auto;
}

.sidebar-overlay {
  display: none;
}

.tabbar {
  display: none;
}

@media (max-width: 1024px) {
  .sidebar-overlay {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 90;
  }
}

/* Di ponsel sidebar/drawer diganti tab bar melayang — lihat AppTabBar. */
@media (max-width: 768px) {
  .sidebar-overlay {
    display: none;
  }

  .tabbar {
    display: flex;
    position: absolute;
    left: var(--mobile-gutter);
    right: var(--mobile-gutter);
    bottom: calc(var(--tabbar-inset) + var(--safe-bottom));
    z-index: 20;
  }

  /* Tab bar kini melayang di atas konten, jadi area gulir perlu ruang bawah
     agar isi terakhir tetap bisa naik melewatinya. */
  .content-scroll {
    padding-bottom: calc(
      var(--tabbar-height) + var(--tabbar-inset) * 2 + var(--safe-bottom)
    );
  }
}
</style>