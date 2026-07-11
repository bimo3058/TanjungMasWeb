<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    sub?: string
    image?: string | null
  }>(),
  {
    sub: '',
    image: null,
  },
)
</script>

<template>
  <div class="name-cell">
    <img v-if="image" :src="image" class="name-cell__thumb" alt="" />
    <div v-else class="name-cell__thumb name-cell__thumb--placeholder" />
    <div class="name-cell__text">
      <div class="name-cell__title">{{ title }}</div>
      <div v-if="sub" class="name-cell__sub">{{ sub }}</div>
    </div>
  </div>
</template>

<style scoped>
.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.name-cell__thumb {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 6px;
  object-fit: cover;
}

.name-cell__thumb--placeholder {
  background: var(--blue-150);
}

.name-cell__text {
  min-width: 0;
  max-width: 220px;
}

.name-cell__title {
  font-size: 13px;
  font-weight: var(--fw-semibold);
  color: var(--ink-900);
  line-height: 17px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-cell__sub {
  font-size: 11px;
  color: var(--gray-500);
  line-height: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
