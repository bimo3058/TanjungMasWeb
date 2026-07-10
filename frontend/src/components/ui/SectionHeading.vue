<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    lead?: string
    align?: 'center' | 'left'
    tone?: 'light' | 'dark'
  }>(),
  {
    align: 'center',
    tone: 'light',
  },
)
</script>

<template>
  <div class="heading" :class="[`heading--${align}`, `heading--${tone}`]">
    <span v-if="eyebrow" class="heading__eyebrow">{{ eyebrow }}</span>
    <h2 class="heading__title">{{ title }}</h2>
    <p v-if="lead" class="heading__lead">{{ lead }}</p>
  </div>
</template>

<style scoped>
.heading {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
  color: var(--gold-ink);
}

.heading__title {
  margin: 0;
  font-size: var(--fs-h1);
  line-height: var(--lh-h1);
  font-weight: var(--fw-bold);
  color: var(--blue-900);
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
