<script setup lang="ts">
import { Loader2 } from '@lucide/vue'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'accent' | 'cta' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
  >
    <Loader2 v-if="loading" :size="16" class="btn__spinner" />
    <span v-else-if="$slots.icon" class="btn__icon"><slot name="icon" /></span>
    <slot />
    <span v-if="!loading && $slots['icon-right']" class="btn__icon"><slot name="icon-right" /></span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  font-family: var(--font-sans);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-label);
  white-space: nowrap;
  cursor: pointer;
  transition:
    filter 0.15s ease,
    transform 0.05s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:not(:disabled):hover {
  filter: brightness(0.94);
}

.btn:not(:disabled):active {
  transform: translateY(1px);
}

.btn--sm {
  padding: 8px 14px;
  font-size: var(--fs-xs);
  line-height: var(--lh-xs);
}

.btn--md {
  padding: 12px 16px;
  font-size: var(--fs-sm);
  line-height: var(--lh-sm);
}

.btn--lg {
  padding: 13px 24px;
  font-size: var(--fs-sm);
  line-height: var(--lh-sm);
}

.btn--primary {
  background: var(--color-primary);
  color: var(--text-on-primary);
  box-shadow: var(--shadow-btn);
  border-radius: var(--radius-sm);
}

.btn--accent {
  background: var(--color-accent);
  color: var(--color-accent-ink);
  box-shadow: var(--shadow-btn);
  border-radius: var(--radius-sm);
}

.btn--cta {
  background: var(--color-accent-strong);
  color: var(--ink-000);
  border-radius: var(--radius-pill);
  padding: 17px 32px;
  font-size: var(--fs-lg);
  font-weight: var(--fw-medium);
}

.btn--outline {
  background: transparent;
  color: var(--color-primary);
  box-shadow: inset 0 0 0 1px var(--gray-300);
  border-radius: var(--radius-sm);
}

.btn--ghost {
  background: rgba(255, 255, 255, 0.1);
  color: var(--white);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
}

.btn__icon {
  display: inline-flex;
}

.btn__spinner {
  animation: btn-spin 0.8s linear infinite;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
