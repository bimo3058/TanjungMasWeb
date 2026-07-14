<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, X } from '@lucide/vue'
import type { GaleriFoto } from '@/types/galeri'

const props = defineProps<{ photos: GaleriFoto[] }>()

const openIndex = ref<number | null>(null)

function open(index: number) {
  openIndex.value = index
}

function close() {
  openIndex.value = null
}

function step(delta: number) {
  if (openIndex.value === null || props.photos.length === 0) return
  // Berputar di ujung daftar supaya panah tidak pernah jadi jalan buntu.
  const total = props.photos.length
  openIndex.value = (openIndex.value + delta + total) % total
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
  if (event.key === 'ArrowRight') step(1)
  if (event.key === 'ArrowLeft') step(-1)
}

// Listener dan penguncian scroll hanya hidup selama lightbox terbuka.
watch(openIndex, (index) => {
  const active = index !== null
  document.body.style.overflow = active ? 'hidden' : ''
  if (active) {
    window.addEventListener('keydown', onKeydown)
  } else {
    window.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div v-if="photos.length > 0">
    <div class="grid">
      <button
        v-for="(photo, index) in photos"
        :key="photo.id"
        type="button"
        class="thumb"
        :style="{ backgroundImage: `url(${photo.url_gambar})` }"
        :aria-label="`Lihat foto ${index + 1} dari ${photos.length}`"
        @click="open(index)"
      />
    </div>

    <div v-if="openIndex !== null" class="lightbox" role="dialog" aria-modal="true" @click.self="close">
      <button type="button" class="lightbox__btn lightbox__close" aria-label="Tutup" @click="close">
        <X :size="20" />
      </button>

      <button
        v-if="photos.length > 1"
        type="button"
        class="lightbox__btn lightbox__nav lightbox__nav--prev"
        aria-label="Foto sebelumnya"
        @click="step(-1)"
      >
        <ChevronLeft :size="22" />
      </button>

      <img class="lightbox__image" :src="photos[openIndex].url_gambar" alt="" />

      <button
        v-if="photos.length > 1"
        type="button"
        class="lightbox__btn lightbox__nav lightbox__nav--next"
        aria-label="Foto berikutnya"
        @click="step(1)"
      >
        <ChevronRight :size="22" />
      </button>

      <span class="lightbox__counter">{{ openIndex + 1 }} / {{ photos.length }}</span>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.thumb {
  aspect-ratio: 4 / 3;
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--blue-100);
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.thumb:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-pop);
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
  background: rgba(0, 2, 66, 0.86);
}

.lightbox__image {
  max-width: min(1000px, 100%);
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.lightbox__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: none;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  cursor: pointer;
}

.lightbox__btn:hover {
  background: rgba(255, 255, 255, 0.26);
}

.lightbox__close {
  position: absolute;
  top: 18px;
  right: 18px;
}

.lightbox__counter {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-sans);
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.75);
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 8px;
  }

  .lightbox {
    padding: 16px;
    gap: 8px;
  }

  /* Panah menempel di tepi layar agar gambar tetap dapat ruang maksimal. */
  .lightbox__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .lightbox__nav--prev {
    left: 10px;
  }

  .lightbox__nav--next {
    right: 10px;
  }
}
</style>
