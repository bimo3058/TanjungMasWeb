<script setup lang="ts">
import BaseButton from './BaseButton.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
    loading?: boolean
  }>(),
  {
    confirmLabel: 'Konfirmasi',
    cancelLabel: 'Batal',
    danger: false,
    loading: false,
  },
)

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div v-if="open" class="overlay" @click.self="$emit('cancel')">
    <div class="dialog">
      <h2 class="dialog__title">{{ title }}</h2>
      <p v-if="message" class="dialog__message">{{ message }}</p>
      <div class="dialog__actions">
        <BaseButton variant="outline" @click="$emit('cancel')">{{ cancelLabel }}</BaseButton>
        <BaseButton
          :class="{ 'dialog__confirm--danger': danger }"
          :variant="danger ? 'primary' : 'primary'"
          :loading="loading"
          @click="$emit('confirm')"
        >
          {{ confirmLabel }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(13, 28, 47, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog {
  width: 400px;
  max-width: calc(100vw - 48px);
  box-sizing: border-box;
  background: var(--white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-pop);
  padding: 28px;
  font-family: var(--font-sans);
}

.dialog__title {
  margin: 0 0 12px;
  font-size: var(--fs-title);
  line-height: var(--lh-title);
  font-weight: var(--fw-semibold);
  color: var(--ink-900);
}

.dialog__message {
  margin: 0 0 24px;
  font-size: var(--fs-md);
  line-height: var(--lh-md);
  color: var(--ink-700);
}

.dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog__confirm--danger {
  background: var(--danger) !important;
}
</style>
