<script setup lang="ts">
import { Home, Waves, Store, Newspaper, Info } from '@lucide/vue'
import TopBar from './TopBar.vue'
import SiteFooter from './SiteFooter.vue'
import AppTabBar from './AppTabBar.vue'
import type { Tab } from './tabs'

// "Hubungi Kami" sengaja tidak jadi tab: sudah tersedia sebagai CTA di top bar,
// tombol di hero, dan tautan footer.
const TABS: Tab[] = [
  { name: 'home', label: 'Beranda', icon: Home },
  { name: 'wisata', label: 'Wisata', icon: Waves },
  { name: 'umkm', label: 'UMKM', icon: Store },
  { name: 'berita', label: 'Berita', icon: Newspaper },
  { name: 'tentang', label: 'Tentang', icon: Info },
]
</script>

<template>
  <div class="public-layout">
    <TopBar />
    <router-view />
    <SiteFooter />

    <!-- Navigasi utama di ponsel; menggantikan menu hamburger. -->
    <AppTabBar :tabs="TABS" class="tabbar" />
  </div>
</template>

<style scoped>
.public-layout {
  background: var(--white);
}

.tabbar {
  display: none;
}

@media (max-width: 768px) {
  /* Halaman publik menggulir dokumen (bukan app shell seperti admin), jadi tab
     bar dipaku ke viewport — melayang dengan jarak ke tepi layar. */
  .tabbar {
    display: flex;
    position: fixed;
    left: var(--mobile-gutter);
    right: var(--mobile-gutter);
    bottom: calc(var(--tabbar-inset) + var(--safe-bottom));
    z-index: 30;
  }

  /* Ruang untuk tab bar + jarak melayangnya, agar footer tidak tertutup. */
  .public-layout {
    padding-bottom: calc(
      var(--tabbar-height) + var(--tabbar-inset) * 2 + var(--safe-bottom)
    );
  }
}
</style>
