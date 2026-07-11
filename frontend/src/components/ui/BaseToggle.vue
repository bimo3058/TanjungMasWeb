<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <button
    type="button"
    class="toggle"
    :class="{ 'toggle--on': modelValue }"
    role="switch"
    :aria-checked="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="toggle__thumb" />
  </button>
</template>

<style scoped>
.toggle {
  position: relative;
  width: 34px;
  height: 19px;
  padding: 0;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--gray-300);
  cursor: pointer;
  transition: background-color 0.15s ease;
  flex-shrink: 0;
}

.toggle--on {
  background: var(--color-primary);
}

.toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 15px;
  height: 15px;
  border-radius: var(--radius-full);
  background: var(--white);
  transition: transform 0.15s ease;
}

.toggle--on .toggle__thumb {
  transform: translateX(15px);
}
</style>
