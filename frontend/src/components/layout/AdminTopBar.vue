<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, User, ExternalLink } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSearchBar from '@/components/ui/BaseSearchBar.vue'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const title = computed(() => (route.meta.navTitle as string | undefined) ?? 'Admin Panel')
const initial = computed(() => (user.value?.email?.[0] ?? 'A').toUpperCase())
const search = ref('')
</script>

<template>
  <header class="topbar">
    <span class="topbar__title">{{ title }}</span>
    <div class="topbar__actions">
      <BaseButton variant="outline" size="sm" @click="router.push({ name: 'home' })">
        <template #icon><ExternalLink :size="15" /></template>
        Lihat Website
      </BaseButton>
      <BaseSearchBar v-model="search" dense placeholder="Cari" width="220px" />
      <span class="topbar__bell">
        <Bell :size="18" color="var(--ink-700)" />
        <span class="topbar__bell-dot" />
      </span>
      <div class="topbar__avatar">
        <User v-if="!user" :size="16" color="var(--blue-50)" />
        <span v-else>{{ initial }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--topbar-height);
  flex-shrink: 0;
  background: var(--surface-card);
  border-bottom: 1px solid var(--blue-200);
  box-shadow: var(--shadow-btn);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.topbar__title {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: var(--blue-950);
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.topbar__bell {
  position: relative;
  display: inline-flex;
  color: var(--ink-700);
}

.topbar__bell-dot {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--gold-400);
}

.topbar__avatar {
  width: 30px;
  height: 30px;
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
}
</style>
