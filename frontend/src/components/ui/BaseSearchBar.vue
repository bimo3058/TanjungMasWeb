<script setup lang="ts">
import { Search } from '@lucide/vue'

withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    variant?: 'pill' | 'soft'
    dense?: boolean
    width?: string
  }>(),
  {
    placeholder: 'Cari...',
    variant: 'pill',
    dense: false,
    width: undefined,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <span
    class="search"
    :class="[`search--${variant}`, { 'search--dense': dense }]"
    :style="width ? { width } : undefined"
  >
    <Search :size="dense || variant === 'soft' ? 15 : 18" class="search__icon" />
    <input
      class="search__input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </span>
</template>

<style scoped>
.search {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
}

.search--pill {
  height: 39px;
  background: var(--blue-100);
  border-radius: var(--radius-full);
}

.search--soft {
  height: 42px;
  background: var(--lav-100);
  border-radius: var(--radius-lg);
}

.search--soft .search__input {
  padding: 0 14px 0 38px;
  font-size: 13px;
}

.search--soft .search__icon {
  left: 12px;
}

.search--dense {
  height: 34px;
}

.search--dense .search__icon {
  left: 12px;
}

.search--dense .search__input {
  padding: 0 14px 0 36px;
  font-size: 13px;
}

.search__icon {
  position: absolute;
  left: 14px;
  color: var(--ink-700);
  pointer-events: none;
}

.search__input {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 16px 0 42px;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-sans);
  font-size: var(--fs-sm);
  color: var(--ink-900);
}
</style>
