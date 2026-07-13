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

      <RouterView />
      
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminSidebar from './AdminSidebar.vue'
import AdminTopBar from './AdminTopBar.vue'

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
  width: 100vw;
  background-color: #F8F9FF;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #F8F9FF;
  overflow-y: auto;
  min-width: 0; 
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 1024px) {
  .sidebar-overlay {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 90;
  }
}
</style>