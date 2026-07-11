<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    error?: string
    rows?: number
    dense?: boolean
  }>(),
  {
    rows: 4,
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
    <textarea
      class="field__control"
      :class="{ 'field__control--error': !!error }"
      :rows="rows"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
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

.field--dense .field__label {
  font-size: 12px;
  line-height: 16px;
}

.field__control {
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
  resize: vertical;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.field--dense .field__control {
  padding: 8px 10px;
  font-size: 13px;
  line-height: 18px;
}

.field__control:focus {
  border-color: var(--blue-900);
  box-shadow: 0 0 0 3px rgba(4, 13, 122, 0.1);
}

.field__control--error,
.field__control--error:focus {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(186, 26, 26, 0.1);
}

.field__error {
  font-size: var(--fs-xs);
  line-height: var(--lh-xs);
  color: var(--danger);
}
</style>
