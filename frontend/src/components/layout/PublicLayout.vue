<script setup lang="ts">
import TopBar from './TopBar.vue'
import SiteFooter from './SiteFooter.vue'
</script>

<template>
  <div class="public-layout">
    <TopBar />
    <router-view />
    <SiteFooter />
  </div>
</template>

<style scoped>
.public-layout {
  background: var(--white);
}
</style>
