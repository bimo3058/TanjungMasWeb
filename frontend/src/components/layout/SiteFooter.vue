<script setup lang="ts">
import logoCrest from '@/assets/design/logo-crest.png'

const EXPLORE_LINKS = ['Wisata', 'UMKM', 'Berita', 'Tentang']
</script>

<template>
  <footer class="footer">
    <div class="footer__grid">
      <div class="footer__brand">
        <div class="footer__brand-row">
          <img :src="logoCrest" alt="Kelurahan Tanjung Mas" class="footer__logo" />
          <b class="footer__wordmark">Kelurahan<br />Tanjung Mas</b>
        </div>
        <p class="footer__tagline">
          Desa Wisata Kampung Nelayan Bahari. Melestarikan budaya, memberdayakan pesisir.
        </p>
      </div>
      <div>
        <h4 class="footer__heading">Jelajahi</h4>
        <div v-for="link in EXPLORE_LINKS" :key="link" class="footer__link">{{ link }}</div>
      </div>
      <div>
        <h4 class="footer__heading">Kontak</h4>
        <div class="footer__link">Jl. Tambaklorok, Semarang</div>
        <div class="footer__link">Dikelola oleh Pokdarwis &amp; Pemdes</div>
      </div>
    </div>
    <div class="footer__bottom">© 2026 Kampung Nelayan Bahari Tambaklorok. All Rights Reserved.</div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--blue-950);
  padding: 48px 52px 32px;
  color: rgba(255, 255, 255, 0.85);
  font-family: var(--font-sans);
}

.footer__grid {
  display: flex;
  gap: 60px;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.footer__brand {
  max-width: 340px;
}

.footer__brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.footer__logo {
  height: 40px;
  width: auto;
}

.footer__wordmark {
  color: var(--blue-300);
  font-size: 16px;
  line-height: 1.2;
}

.footer__tagline {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.footer__heading {
  color: var(--white);
  font-size: 14px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin: 0 0 12px;
}

.footer__link {
  font-size: 14px;
  padding: 4px 0;
}

.footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  margin-top: 32px;
  padding-top: 20px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}
</style>
