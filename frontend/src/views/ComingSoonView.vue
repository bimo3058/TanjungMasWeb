<script setup lang="ts">
import { useRoute } from 'vue-router'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const route = useRoute()
const navTitle = (route.meta.navTitle as string | undefined) ?? ''
</script>

<template>
  <section class="coming-soon">
    <SectionHeading
      :eyebrow="navTitle"
      title="Segera Hadir"
      lead="Halaman ini sedang dalam pengembangan."
    />
  </section>
</template>

<style scoped>
.coming-soon {
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--blue-50);
  padding: 80px;
}
</style>
