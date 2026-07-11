<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'category' | 'accent' | 'blue' | 'solid'
    dense?: boolean
    clickable?: boolean
  }>(),
  {
    variant: 'category',
    dense: false,
    clickable: false,
  },
)
</script>

<template>
  <span class="badge" :class="[`badge--${variant}`, { 'badge--dense': dense, 'badge--clickable': clickable }]">
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

.badge--clickable {
  cursor: pointer;
  transition: filter 0.15s ease;
}

.badge--clickable:hover {
  filter: brightness(0.96);
}

.badge--dense {
  padding: 2px 8px;
  font-size: 11.5px;
  border-radius: var(--radius-sm);
}

.badge--category {
  background: var(--surface-chip);
  color: var(--ink-000);
  font-weight: var(--fw-medium);
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.badge--accent {
  background: var(--color-accent);
  color: var(--color-accent-ink);
  font-weight: var(--fw-semibold);
}

.badge--blue {
  background: var(--blue-150);
  color: var(--blue-900);
  font-weight: var(--fw-semibold);
}

.badge--solid {
  background: var(--blue-900);
  color: var(--white);
  font-weight: var(--fw-semibold);
}
</style>
