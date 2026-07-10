<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'category'
  }>(),
  {
    variant: 'category',
  },
)
</script>

<template>
  <span class="badge" :class="`badge--${variant}`">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-family: var(--font-sans);
  font-size: var(--fs-md);
  line-height: 1;
  white-space: nowrap;
}

.badge--category {
  background: var(--surface-chip);
  color: var(--ink-000);
  font-weight: var(--fw-medium);
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.1);
}
</style>
