<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    danger?: boolean
    disabled?: boolean
  }>(),
  {
    danger: false,
    disabled: false,
  },
)
</script>

<template>
  <button type="button" class="icon-btn" :class="{ 'icon-btn--danger': danger }" :title="title" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.icon-btn {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid var(--blue-200);
  background: #fff;
  color: var(--ink-700);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.icon-btn:hover:not(:disabled) {
  background: var(--blue-100);
}

.icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.icon-btn--danger {
  color: var(--danger);
}
</style>
