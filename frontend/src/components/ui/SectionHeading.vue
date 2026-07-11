<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    lead?: string
    align?: 'center' | 'left'
    tone?: 'light' | 'dark'
    action?: string
  }>(),
  {
    align: 'center',
    tone: 'light',
  },
)

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="heading-row" :class="{ 'heading-row--with-action': action }">
    <div class="heading" :class="[`heading--${align}`, `heading--${tone}`]">
      <span v-if="eyebrow" class="heading__eyebrow">{{ eyebrow }}</span>
      <h2 class="heading__title">{{ title }}</h2>
      <p v-if="lead" class="heading__lead">{{ lead }}</p>
    </div>
    <a v-if="action" class="heading__action" @click="$emit('action')">
      {{ action }} <ArrowRight :size="14" />
    </a>
  </div>
</template>

<style scoped>
.heading-row--with-action {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.heading__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: var(--fw-semibold);
  color: var(--blue-900);
  cursor: pointer;
  white-space: nowrap;
  padding-bottom: 3px;
  text-decoration: none;
}

.heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--font-sans);
}

.heading--center {
  align-items: center;
  text-align: center;
}

.heading--left {
  align-items: flex-start;
  text-align: left;
}

.heading__eyebrow {
  font-size: 11.5px;
  font-weight: var(--fw-bold);
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--gold-500);
}

.heading__title {
  margin: 0;
  font-size: 26px;
  line-height: 32px;
  font-weight: var(--fw-bold);
  color: var(--blue-950);
}

.heading--dark .heading__title {
  color: var(--white);
}

.heading__lead {
  margin: 0;
  max-width: 720px;
  font-size: var(--fs-lg);
  line-height: var(--lh-lg);
  font-weight: var(--fw-regular);
  color: var(--ink-700);
}

.heading--dark .heading__lead {
  color: rgba(255, 255, 255, 0.85);
}
</style>
