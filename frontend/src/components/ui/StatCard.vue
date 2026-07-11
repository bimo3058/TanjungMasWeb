<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
}>()
</script>

<template>
  <div class="stat-card">
    <div class="stat-card__icon"><slot name="icon" /></div>
    <div class="stat-card__text">
      <div class="stat-card__label">{{ label }}</div>
      <div class="stat-card__value">{{ value }}</div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  padding: 13px 16px;
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  font-family: var(--font-sans);
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-card__icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  background: var(--blue-150);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--blue-950);
}

.stat-card__text {
  min-width: 0;
}

.stat-card__label {
  font-size: 10.5px;
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-caps);
  color: var(--ink-700);
}

.stat-card__value {
  font-size: 22px;
  line-height: 26px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
}
</style>
