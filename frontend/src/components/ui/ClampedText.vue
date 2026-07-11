<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string
    lines?: number
    moreLabel?: string
    lessLabel?: string
  }>(),
  {
    lines: 3,
    moreLabel: 'Baca selengkapnya',
    lessLabel: 'Tutup',
  },
)

const expanded = ref(false)
const overflowing = ref(false)
const textEl = ref<HTMLParagraphElement | null>(null)

async function checkOverflow() {
  expanded.value = false
  await nextTick()
  overflowing.value = !!textEl.value && textEl.value.scrollHeight > textEl.value.clientHeight + 1
}

onMounted(checkOverflow)
watch(() => props.text, checkOverflow)
</script>

<template>
  <div class="clamped">
    <p
      ref="textEl"
      class="clamped__text"
      :class="{ 'clamped__text--clamped': !expanded }"
      :style="expanded ? undefined : { WebkitLineClamp: lines }"
    >
      {{ text }}
    </p>
    <button
      v-if="overflowing"
      type="button"
      class="clamped__toggle"
      @click.stop="expanded = !expanded"
    >
      {{ expanded ? lessLabel : moreLabel }}
    </button>
  </div>
</template>

<style scoped>
.clamped__text {
  margin: 0;
}

.clamped__text--clamped {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.clamped__toggle {
  display: inline-block;
  margin-top: 4px;
  padding: 0;
  border: none;
  background: none;
  font-family: var(--font-sans);
  font-size: 11.5px;
  font-weight: var(--fw-semibold);
  color: var(--blue-900);
  cursor: pointer;
}

.clamped__toggle:hover {
  text-decoration: underline;
}
</style>
