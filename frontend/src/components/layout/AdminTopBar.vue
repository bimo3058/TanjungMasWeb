<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, User, ExternalLink, Menu } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSearchBar from '@/components/ui/BaseSearchBar.vue'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const title = computed(() => (route.meta.navTitle as string | undefined) ?? 'Admin Panel')
const initial = computed(() => (user.value?.email?.[0] ?? 'A').toUpperCase())
const search = ref((route.query.q as string) || '')
let searchTimeout: ReturnType<typeof setTimeout> 
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    router.push({ name: route.name as string, query: { ...route.query, q: search.value || undefined } })
  }, 300)
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
      
      <div class="topbar__search">
        <BaseSearchBar v-model="search" @update:modelValue="handleSearch" dense placeholder="Cari" width="220px" />
      </div>
      
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

.topbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
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

@media (max-width: 1024px) {
  .topbar {
    padding: 0 16px;
  }
  
  .topbar__hamburger {
    display: flex;
  }
}

@media (max-width: 768px) {
  .topbar__view-site,
  .topbar__search {
    display: none;
  }
  
  .topbar__actions {
    gap: 10px;
  }
}
</style>