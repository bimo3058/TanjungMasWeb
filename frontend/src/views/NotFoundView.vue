<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Home, MapPinOff } from '@lucide/vue'

const route = useRoute()
const isAdminPath = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <main class="not-found">
    <section class="not-found__card" aria-labelledby="not-found-title">
      <div class="not-found__icon" aria-hidden="true">
        <MapPinOff :size="42" />
      </div>
      <span class="not-found__code">404</span>
      <h1 id="not-found-title" class="not-found__title">Halaman tidak ditemukan</h1>
      <p class="not-found__message">
        Alamat yang kamu buka mungkin keliru, sudah dipindahkan, atau tidak lagi tersedia.
      </p>
      <code class="not-found__path">{{ route.fullPath }}</code>

      <div class="not-found__actions">
        <button class="not-found__button not-found__button--secondary" type="button" @click="$router.back()">
          <ArrowLeft :size="17" />
          Kembali
        </button>
        <RouterLink
          class="not-found__button not-found__button--primary"
          :to="{ name: isAdminPath ? 'admin-login' : 'home' }"
        >
          <Home :size="17" />
          {{ isAdminPath ? 'Ke Login Admin' : 'Ke Beranda' }}
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.not-found {
  box-sizing: border-box;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 20% 20%, var(--blue-100), transparent 38%),
    linear-gradient(145deg, var(--blue-50), var(--white));
  font-family: var(--font-sans);
}

.not-found__card {
  width: min(100%, 520px);
  box-sizing: border-box;
  padding: 42px 36px;
  border: 1px solid var(--blue-200);
  border-radius: var(--radius-md);
  background: var(--surface-card);
  box-shadow: var(--shadow-admin);
  text-align: center;
}

.not-found__icon {
  width: 76px;
  height: 76px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-full);
  background: var(--blue-100);
  color: var(--blue-900);
}

.not-found__code {
  display: block;
  color: var(--gold-700, #9a6a00);
  font-size: 14px;
  font-weight: var(--fw-bold);
  letter-spacing: 0.16em;
}

.not-found__title {
  margin: 6px 0 10px;
  color: var(--blue-950);
  font-size: clamp(24px, 5vw, 34px);
  line-height: 1.2;
}

.not-found__message {
  max-width: 420px;
  margin: 0 auto;
  color: var(--ink-700);
  font-size: 14px;
  line-height: 1.7;
}

.not-found__path {
  display: block;
  max-width: 100%;
  margin: 18px 0 24px;
  padding: 9px 12px;
  overflow-wrap: anywhere;
  border-radius: var(--radius-sm);
  background: var(--blue-50);
  color: var(--ink-700);
  font-family: monospace;
  font-size: 12px;
}

.not-found__actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.not-found__button {
  min-height: 40px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 16px;
  border: 1px solid var(--blue-800);
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 13px;
  font-weight: var(--fw-semibold);
  text-decoration: none;
  cursor: pointer;
}

.not-found__button--primary {
  background: var(--blue-900);
  color: var(--white);
}

.not-found__button--secondary {
  background: var(--white);
  color: var(--blue-900);
}

@media (max-width: 520px) {
  .not-found {
    padding: var(--mobile-gutter);
  }

  .not-found__card {
    padding: 32px 20px;
  }

  .not-found__actions {
    flex-direction: column-reverse;
  }

  .not-found__button {
    width: 100%;
  }
}
</style>
