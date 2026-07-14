<script setup lang="ts">
import { computed } from 'vue'
import BaseSearchBar from '@/components/ui/BaseSearchBar.vue'
import heroVillage from '@/assets/design/hero-village.jpg'
import { useProfilDesa } from '@/composables/useProfilDesa'

withDefaults(
  defineProps<{
    title: string
    lead: string
    eyebrow?: string
    searchPlaceholder?: string
    modelValue?: string
    searchable?: boolean
    /** Lepaskan lead dari lebar 560px. Untuk halaman yang lead-nya satu paragraf
     *  penuh (Tentang), bukan satu-dua baris seperti halaman katalog. */
    wideLead?: boolean
  }>(),
  {
    eyebrow: '',
    searchPlaceholder: 'Cari...',
    modelValue: '',
    searchable: true,
    wideLead: false,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()

// Gambar hero dinamis: sumber dari profil_desa (dikelola admin), sama seperti
// hero beranda. Fallback ke aset statis bila belum diatur.
const { profil } = useProfilDesa()
const heroImage = computed(() => profil.value?.hero_image || heroVillage)
</script>

<template>
  <section
    class="catalog-header"
    :style="{
      backgroundImage: `linear-gradient(90deg, rgba(0,2,66,.9) 0%, rgba(0,2,66,.66) 52%, rgba(4,13,122,.32) 100%), url(${heroImage})`,
    }"
  >
    <div class="catalog-header__inner">
      <div class="catalog-header__text">
        <span v-if="eyebrow" class="catalog-header__eyebrow">
          <span class="catalog-header__eyebrow-dash" />{{ eyebrow }}
        </span>
        <h1 class="catalog-header__title">{{ title }}</h1>
        <p class="catalog-header__lead" :class="{ 'catalog-header__lead--wide': wideLead }">
          {{ lead }}
        </p>
      </div>
      <BaseSearchBar
        v-if="searchable"
        class="catalog-header__search"
        :model-value="modelValue"
        variant="soft"
        :placeholder="searchPlaceholder"
        width="300px"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.catalog-header {
  padding: 48px 36px 52px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  font-family: var(--font-sans);
}

.catalog-header__inner {
  max-width: var(--content-max);
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.catalog-header__text {
  min-width: 0;
}

.catalog-header__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--gold-400);
}

.catalog-header__eyebrow-dash {
  width: 22px;
  height: 2px;
  background: var(--gold-400);
  display: inline-block;
}

.catalog-header__title {
  margin: 12px 0 0;
  font-size: 34px;
  line-height: 1.12;
  font-weight: var(--fw-bold);
  color: var(--white);
}

.catalog-header__lead {
  margin: 10px 0 0;
  max-width: 560px;
  font-size: 15px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
}

/* Lead sepanjang satu paragraf dibiarkan memanjang ke kanan, bukan menumpuk
   jadi kolom sempit di kiri sementara separuh hero kosong. */
.catalog-header__lead--wide {
  max-width: 920px;
}

@media (max-width: 600px) {
  .catalog-header {
    padding: 22px var(--mobile-gutter) 20px;
  }

  .catalog-header__inner {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .catalog-header__title {
    margin-top: 10px;
    font-size: 23px;
    line-height: 28px;
  }

  .catalog-header__lead {
    margin-top: 6px;
    font-size: 13px;
  }

  /* !important untuk menimpa inline style dari prop `width` (desktop 300px). */
  .catalog-header__search {
    width: 100% !important;
    height: 44px;
  }
}
</style>
