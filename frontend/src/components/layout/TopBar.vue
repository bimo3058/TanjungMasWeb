<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, X } from '@lucide/vue'
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

// Status untuk mengontrol buka/tutup menu di tampilan mobile
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleCtaClick = () => {
  closeMobileMenu()
  router.push({ name: 'kontak' })
}
</script>

<template>
  <!-- TOPBAR UTAMA -->
  <header class="topbar">
    <RouterLink :to="{ name: 'home' }" class="topbar__brand" @click="closeMobileMenu">
      <img :src="logoCrest" alt="Kelurahan Tanjung Mas" class="topbar__logo" />
      <div class="topbar__brand-text">
        <div class="topbar__wordmark">Tanjung Mas</div>
        <div class="topbar__eyebrow">Kampung Nelayan Bahari</div>
      </div>
    </RouterLink>

    <!-- NAVIGASI DESKTOP -->
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

    <!-- TOMBOL CTA DESKTOP -->
    <BaseButton variant="cta" class="topbar__cta" @click="handleCtaClick">
      Hubungi Kami
    </BaseButton>

    <!-- TOMBOL HAMBURGER MOBILE -->
    <button class="topbar__hamburger" @click="toggleMobileMenu" aria-label="Toggle Menu">
      <Menu v-if="!isMobileMenuOpen" :size="24" color="var(--white)" />
      <X v-else :size="24" color="var(--white)" />
    </button>
  </header>

  <!-- MENU OVERLAY MOBILE -->
  <div class="mobile-menu" :class="{ 'mobile-menu--open': isMobileMenuOpen }">
    <nav class="mobile-menu__nav">
      <RouterLink
        v-for="item in NAV"
        :key="item.name"
        :to="{ name: item.name }"
        class="mobile-menu__link"
        :class="{ 'mobile-menu__link--active': route.name === item.name }"
        @click="closeMobileMenu"
      >
        {{ item.label }}
      </RouterLink>
      <BaseButton variant="cta" class="mobile-menu__cta" @click="handleCtaClick">
        Hubungi Kami
      </BaseButton>
    </nav>
  </div>
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

.topbar__hamburger {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: auto; 
}

.mobile-menu {
  display: none; 
}


@media (max-width: 768px) {
  .topbar {
    padding: 0 20px;
  }

  .topbar__nav, 
  .topbar__cta {
    display: none;
  }

  /* Tampilkan tombol hamburger */
  .topbar__hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Styling menu overlay mobile */
  .mobile-menu {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 54px; /* Berada tepat di bawah topbar */
    left: 0;
    width: 100%;
    height: calc(100vh - 54px);
    background: var(--blue-950);
    z-index: 19;
    padding: 24px 20px;
    box-sizing: border-box;
    
    /* Animasi Buka/Tutup Menu */
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  }

  .mobile-menu--open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .mobile-menu__nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mobile-menu__link {
    font-size: 16px;
    font-weight: var(--fw-medium);
    color: var(--blue-300);
    text-decoration: none;
    padding: 14px 16px;
    border-radius: 8px;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .mobile-menu__link:hover,
  .mobile-menu__link:active {
    background: rgba(255, 255, 255, 0.05);
  }

  .mobile-menu__link--active {
    color: var(--white);
    font-weight: var(--fw-bold);
    background: rgba(255, 255, 255, 0.1);
  }

  .mobile-menu__cta {
    margin-top: 16px;
    width: 100%;
    justify-content: center;
  }
}
</style>