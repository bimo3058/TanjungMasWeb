<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Mail, User, ShieldCheck, Info } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import GoogleGIcon from '@/components/ui/icons/GoogleGIcon.vue'
import { useAuth } from '@/composables/useAuth'

const {
  user,
  role,
  namaLengkap,
  displayName,
  canChangeEmail,
  isGoogleAccount,
  updateNamaLengkap,
  updateEmail,
  resetPasswordForEmail,
} = useAuth()

const nama = ref('')
const email = ref('')

// Sesi bisa datang belakangan (dimuat async) — isi form begitu tersedia.
watch(
  [namaLengkap, user],
  () => {
    nama.value = namaLengkap.value ?? ''
    email.value = user.value?.email ?? ''
  },
  { immediate: true },
)

const saving = ref(false)
const error = ref('')
const success = ref('')

const initial = computed(() => displayName.value[0]?.toUpperCase() ?? 'A')
const emailChanged = computed(
  () => canChangeEmail.value && email.value.trim() !== (user.value?.email ?? ''),
)
const namaChanged = computed(() => nama.value.trim() !== (namaLengkap.value ?? ''))
const dirty = computed(() => namaChanged.value || emailChanged.value)

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (!nama.value.trim()) {
    error.value = 'Nama tidak boleh kosong.'
    return
  }

  saving.value = true
  const pesan: string[] = []

  if (namaChanged.value) {
    const { error: namaError } = await updateNamaLengkap(nama.value)
    if (namaError) {
      error.value = namaError
      saving.value = false
      return
    }
    pesan.push('Nama berhasil diperbarui.')
  }

  if (emailChanged.value) {
    // Dikunci dulu: updateUser memicu onAuthStateChange, dan watch di atas akan
    // mengembalikan field email ke alamat lama (email memang belum berganti
    // sampai tautan dikonfirmasi). Tanpa ini pesan menyebut alamat yang salah.
    const emailBaru = email.value.trim()

    const { error: emailError } = await updateEmail(emailBaru)
    if (emailError) {
      error.value = emailError
      saving.value = false
      // Nama mungkin sudah tersimpan — jangan sembunyikan kabar itu.
      success.value = pesan.join(' ')
      return
    }
    pesan.push(
      `Tautan konfirmasi dikirim ke ${emailBaru}. Email baru berlaku setelah tautan itu diklik — periksa juga kotak masuk email lama Anda.`,
    )
  }

  saving.value = false
  success.value = pesan.join(' ')
}

const resetSent = ref(false)
const resetting = ref(false)

async function handlePasswordReset() {
  if (!user.value?.email) return
  resetting.value = true
  const { error: resetError } = await resetPasswordForEmail(user.value.email)
  resetting.value = false
  if (resetError) error.value = resetError
  else resetSent.value = true
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <div class="page__heading">
        <h1 class="page__title">Akun Saya</h1>
        <span class="page__count">informasi akun Anda sendiri</span>
      </div>
      <BaseButton
        variant="primary"
        size="sm"
        type="submit"
        form="akun-form"
        :loading="saving"
        :disabled="!dirty"
      >
        Simpan Perubahan
      </BaseButton>
    </div>

    <div class="lower">
      <form id="akun-form" class="form-card" @submit.prevent="handleSubmit">
        <BaseInput v-model="nama" dense label="Nama Lengkap" placeholder="Nama Anda">
          <template #icon><User :size="14" /></template>
        </BaseInput>

        <div>
          <BaseInput
            v-model="email"
            dense
            label="Email"
            type="email"
            :disabled="!canChangeEmail"
            autocomplete="email"
          >
            <template #icon><Mail :size="14" /></template>
          </BaseInput>

          <!-- Alamat akun Google dimiliki Google. Menggantinya di sini hanya akan
               memutus tautan login OAuth-nya, jadi field-nya dikunci. -->
          <p v-if="isGoogleAccount && !canChangeEmail" class="form-card__hint">
            <Info :size="13" class="form-card__hint-icon" />
            Email ini dikelola oleh Google. Untuk menggantinya, gunakan akun Google
            yang berbeda saat masuk — atau minta admin lain membuatkan akun email biasa.
          </p>
          <p v-else-if="emailChanged" class="form-card__hint">
            <Info :size="13" class="form-card__hint-icon" />
            Email tidak langsung berubah. Kami akan mengirim tautan konfirmasi lebih dulu.
          </p>
        </div>

        <p v-if="error" class="form-card__error">{{ error }}</p>
        <p v-else-if="success" class="form-card__success">{{ success }}</p>

        <div v-if="canChangeEmail" class="form-card__footer">
          <span>Ingin mengganti password?</span>
          <button
            type="button"
            class="form-card__link"
            :disabled="resetting || resetSent"
            @click="handlePasswordReset"
          >
            {{ resetSent ? 'Tautan reset terkirim ✓' : 'Kirim tautan reset password' }}
          </button>
        </div>
      </form>

      <aside class="side">
        <div class="ident-card">
          <div class="ident-card__avatar">{{ initial }}</div>
          <div class="ident-card__name">{{ displayName }}</div>
          <div class="ident-card__email">{{ user?.email }}</div>

          <div class="ident-card__rows">
            <div class="ident-card__row">
              <ShieldCheck :size="14" class="ident-card__icon" />
              <span>Peran</span>
              <BaseBadge :variant="role === 'admin' ? 'accent' : 'category'" dense>
                {{ role === 'admin' ? 'Admin' : 'Viewer' }}
              </BaseBadge>
            </div>
            <div class="ident-card__row">
              <GoogleGIcon v-if="isGoogleAccount" class="ident-card__icon" />
              <Mail v-else :size="14" class="ident-card__icon" />
              <span>Masuk lewat</span>
              <BaseBadge variant="blue" dense>
                {{ isGoogleAccount ? 'Google' : 'Email & Password' }}
              </BaseBadge>
            </div>
          </div>

          <p class="ident-card__note">
            Peran hanya dapat diubah oleh admin lain lewat Kelola Pengguna — Anda tidak
            bisa menaikkan peran akun sendiri.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page {
  /* Tumbuh mengisi area gulir, tapi tak pernah dimampatkan saat konten panjang. */
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px 20px;
  font-family: var(--font-sans);
  box-sizing: border-box;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.page__heading {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.page__title {
  margin: 0;
  font-size: 20px;
  font-weight: var(--fw-bold);
  color: var(--blue-950);
}

.page__count {
  font-size: 12.5px;
  color: var(--gray-500);
}

.lower {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.form-card {
  flex: 1.6;
  min-width: 0;
  box-sizing: border-box;
  padding: 18px;
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-card__hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 8px 0 0;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--gray-500);
}

.form-card__hint-icon {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--blue-900);
}

.form-card__error {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--danger);
}

.form-card__success {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 19px;
  color: var(--color-primary);
}

.form-card__footer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px solid var(--blue-200);
  padding-top: 12px;
  font-size: 12.5px;
  color: var(--gray-500);
}

.form-card__link {
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: 12.5px;
  font-weight: var(--fw-semibold);
  color: var(--blue-900);
  cursor: pointer;
}

.form-card__link:disabled {
  color: var(--gray-500);
  cursor: default;
}

.side {
  flex: 1;
  min-width: 0;
}

.ident-card {
  padding: 18px;
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ident-card__avatar {
  width: 56px;
  height: 56px;
  margin-bottom: 6px;
  border-radius: var(--radius-full);
  background: var(--blue-750);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: var(--fw-bold);
}

.ident-card__name {
  font-size: 15px;
  font-weight: var(--fw-bold);
  color: var(--ink-900);
  text-transform: capitalize;
}

.ident-card__email {
  font-size: 12.5px;
  color: var(--gray-500);
  overflow-wrap: anywhere;
  text-align: center;
}

.ident-card__rows {
  width: 100%;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ident-card__row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--ink-700);
}

.ident-card__row span {
  flex: 1;
}

.ident-card__icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  color: var(--blue-900);
}

.ident-card__note {
  margin: 14px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--blue-200);
  font-size: 11.5px;
  line-height: 16px;
  color: var(--gray-500);
}

@media (max-width: 768px) {
  .page {
    padding: 14px var(--mobile-gutter) 22px;
  }

  /* Judul sudah tampil di top bar. */
  .page__title,
  .page__count {
    display: none;
  }

  .page__header {
    justify-content: flex-end;
  }

  /* Kartu identitas naik ke atas form supaya "siapa saya" terbaca lebih dulu. */
  .lower {
    flex-direction: column-reverse;
  }

  .side,
  .form-card {
    width: 100%;
  }

  .form-card {
    padding: 16px;
  }
}
</style>
