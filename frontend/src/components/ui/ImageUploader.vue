<script setup lang="ts">
import { ref } from 'vue'
import { ImagePlus, Loader2 } from '@lucide/vue'
import { useImageUpload } from '@/composables/useImageUpload'
import ImageCropperModal from './ImageCropperModal.vue'

const props = defineProps<{
  modelValue: string | null
  folder: string
  label?: string
  enableCrop?: boolean
  cropAspectRatio?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const { uploadImage } = useImageUpload()
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const error = ref('')

const cropperOpen = ref(false)
const pendingFile = ref<File | null>(null)

function openPicker() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (fileInput.value) fileInput.value.value = ''
  if (!file) return

  if (props.enableCrop) {
    pendingFile.value = file
    cropperOpen.value = true
    return
  }

  await doUpload(file)
}

async function doUpload(file: File | Blob) {
  error.value = ''
  uploading.value = true
  try {
    const url = await uploadImage(file, props.folder)
    emit('update:modelValue', url)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal mengunggah gambar.'
  } finally {
    uploading.value = false
  }
}

async function handleCropConfirm(blob: Blob) {
  cropperOpen.value = false
  pendingFile.value = null
  await doUpload(blob)
}

function handleCropCancel() {
  cropperOpen.value = false
  pendingFile.value = null
}

function removeImage() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="uploader">
    <span v-if="label" class="uploader__label">{{ label }}</span>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="uploader__input"
      @change="handleFileChange"
    />

    <div v-if="modelValue" class="uploader__preview">
      <img :src="modelValue" alt="" class="uploader__image" />
      <div class="uploader__actions">
        <button type="button" class="uploader__btn" :disabled="uploading" @click="openPicker">
          Ganti
        </button>
        <button
          type="button"
          class="uploader__btn uploader__btn--danger"
          :disabled="uploading"
          @click="removeImage"
        >
          Hapus
        </button>
      </div>
    </div>

    <button v-else type="button" class="uploader__dropzone" :disabled="uploading" @click="openPicker">
      <Loader2 v-if="uploading" :size="24" class="uploader__spinner" />
      <ImagePlus v-else :size="24" color="var(--ink-700)" />
      <span>{{ uploading ? 'Mengunggah...' : 'Klik untuk unggah gambar' }}</span>
    </button>

    <p v-if="error" class="uploader__error">{{ error }}</p>

    <ImageCropperModal
      v-if="enableCrop"
      :open="cropperOpen"
      :file="pendingFile"
      :aspect-ratio="cropAspectRatio"
      @confirm="handleCropConfirm"
      @cancel="handleCropCancel"
    />
  </div>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-family: var(--font-sans);
}

.uploader__label {
  font-size: var(--fs-sm);
  line-height: var(--lh-sm);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-label);
  color: var(--ink-900);
}

.uploader__input {
  display: none;
}

.uploader__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 160px;
  background: var(--blue-50);
  border: 1px dashed var(--border-input);
  border-radius: var(--radius-sm);
  color: var(--ink-700);
  font-family: var(--font-sans);
  font-size: var(--fs-sm);
  cursor: pointer;
}

.uploader__dropzone:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.uploader__spinner {
  animation: uploader-spin 0.8s linear infinite;
  color: var(--ink-700);
}

@keyframes uploader-spin {
  to {
    transform: rotate(360deg);
  }
}

.uploader__preview {
  position: relative;
  width: 100%;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.uploader__image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.uploader__actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

.uploader__btn {
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.6);
  color: var(--white);
  font-family: var(--font-sans);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  cursor: pointer;
}

.uploader__btn--danger:hover {
  background: var(--danger);
}

.uploader__error {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--danger);
}
</style>
