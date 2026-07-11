<script setup lang="ts">
import BaseSearchBar from '@/components/ui/BaseSearchBar.vue'
import heroVillage from '@/assets/design/hero-village.jpg'

defineProps<{
  title: string
  lead: string
  searchPlaceholder: string
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <section class="catalog-header" :style="{ backgroundImage: `linear-gradient(rgba(0,2,66,.78),rgba(0,2,66,.78)), url(${heroVillage})` }">
    <div class="catalog-header__inner">
      <div>
        <h1 class="catalog-header__title">{{ title }}</h1>
        <p class="catalog-header__lead">{{ lead }}</p>
      </div>
      <BaseSearchBar
        :model-value="modelValue"
        variant="soft"
        :placeholder="searchPlaceholder"
        width="300px"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.catalog-header {
  padding: 36px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  font-family: var(--font-sans);
}

.catalog-header__inner {
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.catalog-header__title {
  margin: 0;
  font-size: 30px;
  line-height: 36px;
  font-weight: var(--fw-bold);
  color: var(--white);
}

.catalog-header__lead {
  margin: 6px 0 0;
  max-width: 560px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
}
</style>
