<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus } from '@lucide/vue'
import BaseSelect from './BaseSelect.vue'
import BaseButton from './BaseButton.vue'
import { useCategories, type KategoriTable } from '@/composables/useCategories'

const props = defineProps<{
  modelValue: string | null
  table: KategoriTable
  label?: string
  dense?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const { categories, addCategory } = useCategories(props.table)

const options = computed(() => categories.value.map((k) => ({ value: k.id, label: k.nama })))

const adding = ref(false)
const newName = ref('')
const saving = ref(false)
const error = ref('')

function startAdd() {
  error.value = ''
  newName.value = ''
  adding.value = true
}

function cancelAdd() {
  adding.value = false
}

async function confirmAdd() {
  if (!newName.value.trim()) return
  saving.value = true
  error.value = ''
  try {
    const kategori = await addCategory(newName.value.trim())
    emit('update:modelValue', kategori.id)
    adding.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal menambahkan kategori.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="category-select">
    <BaseSelect
      :label="label"
      :model-value="modelValue ?? ''"
      :options="options"
      :dense="dense"
      placeholder="Pilih kategori"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <button v-if="!adding" type="button" class="category-select__add-link" @click="startAdd">
      <Plus :size="14" /> Kategori baru
    </button>

    <div v-else class="category-select__add-row">
      <input
        v-model="newName"
        type="text"
        class="category-select__input"
        :class="{ 'category-select__input--dense': dense }"
        placeholder="Nama kategori baru"
        @keyup.enter="confirmAdd"
      />
      <BaseButton variant="primary" size="sm" :loading="saving" @click="confirmAdd">Tambah</BaseButton>
      <BaseButton variant="outline" size="sm" :disabled="saving" @click="cancelAdd">Batal</BaseButton>
    </div>
    <p v-if="error" class="category-select__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.category-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--font-sans);
}

.category-select__add-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--blue-900);
  cursor: pointer;
}

.category-select__add-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-select__input {
  flex: 1;
  box-sizing: border-box;
  padding: 10px 12px;
  background: var(--blue-50);
  border: 1px solid var(--border-input);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--fs-sm);
  color: var(--ink-900);
  outline: none;
}

.category-select__input--dense {
  padding: 8px 10px;
  font-size: 13px;
}

.category-select__error {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--danger);
}
</style>
