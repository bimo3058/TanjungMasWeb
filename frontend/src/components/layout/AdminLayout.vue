<script setup lang="ts">
import AdminSidebar from './AdminSidebar.vue'
import AdminTopBar from './AdminTopBar.vue'
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    <div class="admin-layout__main">
      <AdminTopBar />
      <div class="admin-layout__content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: var(--blue-50);
  overflow: hidden;
}

.admin-layout__main {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.admin-layout__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
