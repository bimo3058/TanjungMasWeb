<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import BaseButton from './BaseButton.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    file: File | null
    aspectRatio?: number
  }>(),
  {
    aspectRatio: 4 / 3,
  },
)

const emit = defineEmits<{
  confirm: [blob: Blob]
  cancel: []
}>()

const imageEl = ref<HTMLImageElement | null>(null)
let cropper: Cropper | null = null
let objectUrl: string | null = null

function destroyCropper() {
  cropper?.destroy()
  cropper = null
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

watch(
  () => [props.open, props.file] as const,
  async ([open, file]) => {
    destroyCropper()
    if (!open || !file) return

    objectUrl = URL.createObjectURL(file)
    await nextTick()
    if (!imageEl.value) return

    imageEl.value.src = objectUrl
    cropper = new Cropper(imageEl.value, {
      aspectRatio: props.aspectRatio,
      viewMode: 1,
      autoCropArea: 1,
      background: false,
    })
  },
)

onBeforeUnmount(destroyCropper)

function handleConfirm() {
  const canvas = cropper?.getCroppedCanvas()
  if (!canvas) return
  canvas.toBlob(
    (blob) => {
      if (blob) emit('confirm', blob)
    },
    'image/jpeg',
    0.9,
  )
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div v-if="open" class="overlay" @click.self="handleCancel">
    <div class="dialog">
      <h2 class="dialog__title">Sesuaikan Gambar</h2>
      <div class="dialog__cropper">
        <img ref="imageEl" alt="" />
      </div>
      <div class="dialog__actions">
        <BaseButton variant="outline" type="button" @click="handleCancel">Batal</BaseButton>
        <BaseButton variant="primary" type="button" @click="handleConfirm">Gunakan Gambar</BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(13, 28, 47, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
}

.dialog {
  width: 560px;
  max-width: 100%;
  box-sizing: border-box;
  background: var(--white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-pop);
  padding: 24px;
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog__title {
  margin: 0;
  font-size: var(--fs-title);
  font-weight: var(--fw-semibold);
  color: var(--ink-900);
}

.dialog__cropper {
  height: 380px;
  background: var(--blue-950);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.dialog__cropper img {
  display: block;
  max-width: 100%;
}

.dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
