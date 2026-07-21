<script setup lang="ts">
import { ref } from 'vue'
import { ImagePlus, X, Loader2 } from '@lucide/vue'
import { useImageUpload } from '@/composables/useImageUpload'
import type { GaleriFoto } from '@/types/galeri'

const props = defineProps<{
  modelValue: GaleriFoto[]
  folder: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: GaleriFoto[]]
}>()

const { uploadImage } = useImageUpload()
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const error = ref('')

function openPicker() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  error.value = ''
  uploading.value = true
  try {
    const url = await uploadImage(file, props.folder)
    emit('update:modelValue', [...props.modelValue, { id: '', url_gambar: url }])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal mengunggah gambar.'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function removeAt(index: number) {
  const next = props.modelValue.slice()
  next.splice(index, 1)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="gallery">
    <span v-if="label" class="gallery__label">{{ label }}</span>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="gallery__input"
      @change="handleFileChange"
    />

    <div class="gallery__grid">
      <div v-for="(item, index) in modelValue" :key="item.id || item.url_gambar" class="gallery__tile">
        <img :src="item.url_gambar" alt="" class="gallery__image" />
        <button type="button" class="gallery__remove" @click="removeAt(index)">
          <X :size="14" color="var(--white)" />
        </button>
      </div>

      <button type="button" class="gallery__add" :disabled="uploading" @click="openPicker">
        <Loader2 v-if="uploading" :size="20" class="gallery__spinner" />
        <ImagePlus v-else :size="20" color="var(--ink-700)" />
      </button>
    </div>

    <p v-if="error" class="gallery__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-family: var(--font-sans);
}

.gallery__label {
  font-size: var(--fs-sm);
  line-height: var(--lh-sm);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-label);
  color: var(--ink-900);
}

.gallery__input {
  display: none;
}

.gallery__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.gallery__tile {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.gallery__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.6);
  cursor: pointer;
}

.gallery__add {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--blue-50);
  border: 1px dashed var(--border-input);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.gallery__add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gallery__spinner {
  animation: gallery-spin 0.8s linear infinite;
  color: var(--ink-700);
}

@keyframes gallery-spin {
  to {
    transform: rotate(360deg);
  }
}

.gallery__error {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--danger);
}
</style>
