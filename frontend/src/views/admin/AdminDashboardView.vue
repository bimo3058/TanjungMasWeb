<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, signOut } = useAuth()

async function handleLogout() {
  await signOut()
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__card">
      <h1 class="dashboard__title">Selamat datang di Admin Portal</h1>
      <p class="dashboard__subtitle">Login sebagai <strong>{{ user?.email }}</strong></p>
      <BaseButton variant="outline" @click="handleLogout">Keluar</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--blue-50);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  padding: 24px;
}

.dashboard__card {
  width: 448px;
  max-width: 100%;
  box-sizing: border-box;
  background: var(--white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.dashboard__title {
  margin: 0;
  font-size: var(--fs-title);
  line-height: var(--lh-title);
  font-weight: var(--fw-semibold);
  color: var(--ink-900);
}

.dashboard__subtitle {
  margin: 0;
  font-size: var(--fs-md);
  color: var(--ink-700);
}
</style>
