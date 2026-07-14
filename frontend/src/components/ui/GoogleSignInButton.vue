<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createNoncePair, loadGoogleIdentity } from '@/utils/googleIdentity'

const emit = defineEmits<{
  credential: [token: string, nonce: string]
  /** GIS tidak bisa dipakai (skrip diblokir / client ID kosong) — parent
   *  menampilkan tombol redirect biasa sebagai cadangan. */
  unavailable: []
}>()

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

const host = ref<HTMLDivElement | null>(null)
const slot = ref<HTMLDivElement | null>(null)

let observer: ResizeObserver | null = null
let fallbackTimer: number | undefined
let renderedWidth = 0
let rawNonce = ''

// Lebar tombol GIS hanya bisa diset dalam piksel (maks 400), jadi tombol
// di-render ulang tiap lebar kartu login berubah agar tetap selebar form.
function renderButton() {
  if (!host.value || !slot.value || !window.google) return

  const width = Math.min(Math.round(host.value.clientWidth) || 320, 400)
  if (width === renderedWidth) return
  renderedWidth = width

  slot.value.innerHTML = ''
  window.google.accounts.id.renderButton(slot.value, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    locale: 'id',
    width,
  })
}

onMounted(async () => {
  if (!clientId) {
    emit('unavailable')
    return
  }

  try {
    await loadGoogleIdentity()
  } catch {
    emit('unavailable')
    return
  }

  const { raw, hashed } = await createNoncePair()
  rawNonce = raw

  window.google!.accounts.id.initialize({
    client_id: clientId,
    nonce: hashed,
    callback: (response) => emit('credential', response.credential, rawNonce),
  })

  renderButton()
  observer = new ResizeObserver(() => renderButton())
  observer.observe(host.value!)

  // Bila origin situs belum terdaftar di Authorized JavaScript origins, GIS
  // diam-diam tidak merender apa pun (errornya hanya muncul di console). Tanpa
  // penjaga ini halaman login akan kehilangan tombol Google sepenuhnya.
  fallbackTimer = window.setTimeout(() => {
    if (!slot.value?.childElementCount) emit('unavailable')
  }, 2500)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.clearTimeout(fallbackTimer)
  window.google?.accounts.id.cancel()
})
</script>

<template>
  <div ref="host" class="google-signin">
    <div ref="slot" class="google-signin__slot" />
  </div>
</template>

<style scoped>
.google-signin {
  width: 100%;
}

.google-signin__slot {
  display: flex;
  justify-content: center;
}
</style>
