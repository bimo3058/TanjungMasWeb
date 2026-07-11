<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    options: Array<{ value: string; label: string }>
    dense?: boolean
  }>(),
  {
    placeholder: 'Pilih...',
    dense: false,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label class="field" :class="{ 'field--dense': dense }">
    <span v-if="label" class="field__label">{{ label }}</span>
    <span class="field__control">
      <select
        :value="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <ChevronDown :size="dense ? 15 : 18" class="field__chevron" />
    </span>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-family: var(--font-sans);
}

.field__label {
  font-size: var(--fs-sm);
  line-height: var(--lh-sm);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-label);
  color: var(--ink-900);
}

.field__control {
  position: relative;
  display: flex;
  align-items: center;
}

.field__control select {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 40px 13px 12px;
  background: var(--blue-50);
  border: 1px solid var(--border-input);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--fs-md);
  color: var(--ink-900);
  outline: none;
  appearance: none;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.field__control select:focus {
  border-color: var(--blue-900);
  box-shadow: 0 0 0 3px rgba(4, 13, 122, 0.1);
}

.field__chevron {
  position: absolute;
  right: 12px;
  color: var(--ink-700);
  pointer-events: none;
}

.field--dense .field__label {
  font-size: 12px;
  line-height: 16px;
}

.field--dense .field__control select {
  height: 34px;
  padding: 0 28px 0 10px;
  background: var(--blue-50);
  font-size: 13px;
}

.field--dense .field__chevron {
  right: 10px;
}
</style>
