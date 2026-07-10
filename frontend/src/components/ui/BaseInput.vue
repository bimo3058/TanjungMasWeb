<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    type?: string
    placeholder?: string
    error?: string
    autocomplete?: string
  }>(),
  {
    type: 'text',
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label class="field">
    <span v-if="label" class="field__label">{{ label }}</span>
    <span class="field__control" :class="{ 'field__control--icon': !!$slots.icon, 'field__control--error': !!error }">
      <span v-if="$slots.icon" class="field__icon"><slot name="icon" /></span>
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </span>
    <span v-if="error" class="field__error">{{ error }}</span>
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

.field__icon {
  position: absolute;
  left: 12px;
  display: inline-flex;
  color: var(--ink-700);
  pointer-events: none;
}

.field__control input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 12px;
  background: var(--blue-50);
  border: 1px solid var(--border-input);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--fs-md);
  color: var(--ink-900);
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.field__control--icon input {
  padding-left: 40px;
}

.field__control input:focus {
  border-color: var(--blue-900);
  box-shadow: 0 0 0 3px rgba(4, 13, 122, 0.1);
}

.field__control--error input,
.field__control--error input:focus {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(186, 26, 26, 0.1);
}

.field__error {
  font-size: var(--fs-xs);
  line-height: var(--lh-xs);
  color: var(--danger);
}
</style>
