<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Shield, User, Lock } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import GoogleGIcon from '@/components/ui/icons/GoogleGIcon.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signInWithPassword, signInWithGoogle, resetPasswordForEmail } = useAuth()

type Mode = 'login' | 'forgot' | 'reset-sent'
const mode = ref<Mode>('login')

const email = ref('')
const password = ref('')
const resetEmail = ref('')

const formError = ref('')
const isSubmitting = ref(false)
const isGoogleSubmitting = ref(false)
const isResetSubmitting = ref(false)

async function handleLogin() {
  formError.value = ''
  if (!email.value || !password.value) {
    formError.value = 'Email dan password wajib diisi.'
    return
  }
  isSubmitting.value = true
  const { error } = await signInWithPassword(email.value, password.value)
  isSubmitting.value = false
  if (error) {
    formError.value = error
    return
  }
  router.push({ name: 'admin-dashboard' })
}

async function handleGoogleSignIn() {
  formError.value = ''
  isGoogleSubmitting.value = true
  const { error } = await signInWithGoogle()
  if (error) {
    isGoogleSubmitting.value = false
    formError.value = error
  }
}

function openForgotPassword() {
  formError.value = ''
  resetEmail.value = email.value
  mode.value = 'forgot'
}

async function handleResetRequest() {
  formError.value = ''
  if (!resetEmail.value) {
    formError.value = 'Masukkan email Anda.'
    return
  }
  isResetSubmitting.value = true
  const { error } = await resetPasswordForEmail(resetEmail.value)
  isResetSubmitting.value = false
  if (error) {
    formError.value = error
    return
  }
  mode.value = 'reset-sent'
}

function backToLogin() {
  formError.value = ''
  mode.value = 'login'
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__badge-block">
        <div class="login-card__badge"><Shield :size="24" color="var(--white)" /></div>
        <h1 class="login-card__heading">Admin Portal</h1>
        <span class="login-card__subheading">Kelurahan Tanjung Mas</span>
      </div>

      <form v-if="mode === 'login'" class="login-card__form" @submit.prevent="handleLogin">
        <BaseInput
          v-model="email"
          label="Email / Username"
          placeholder="Masukkan email atau username"
          autocomplete="username"
        >
          <template #icon><User :size="17" /></template>
        </BaseInput>
        <div>
          <BaseInput
            v-model="password"
            label="Password"
            type="password"
            placeholder="Masukkan password"
            autocomplete="current-password"
          >
            <template #icon><Lock :size="17" /></template>
          </BaseInput>
          <div class="login-card__forgot-row">
            <a class="login-card__forgot-link" @click="openForgotPassword">Lupa Password?</a>
          </div>
        </div>

        <p v-if="formError" class="login-card__error">{{ formError }}</p>

        <BaseButton
          variant="primary"
          type="submit"
          :loading="isSubmitting"
          class="login-card__submit"
        >
          Masuk
        </BaseButton>

        <div class="login-card__divider"><span>atau</span></div>

        <BaseButton
          variant="outline"
          type="button"
          :loading="isGoogleSubmitting"
          class="login-card__submit"
          @click="handleGoogleSignIn"
        >
          <template #icon><GoogleGIcon /></template>
          Masuk dengan Google
        </BaseButton>
      </form>

      <form
        v-else-if="mode === 'forgot'"
        class="login-card__form"
        @submit.prevent="handleResetRequest"
      >
        <p class="login-card__forgot-intro">
          Masukkan email akun Anda, kami akan mengirimkan tautan untuk mengatur ulang password.
        </p>
        <BaseInput
          v-model="resetEmail"
          label="Email"
          placeholder="Masukkan email akun Anda"
          autocomplete="email"
        >
          <template #icon><User :size="17" /></template>
        </BaseInput>

        <p v-if="formError" class="login-card__error">{{ formError }}</p>

        <BaseButton
          variant="primary"
          type="submit"
          :loading="isResetSubmitting"
          class="login-card__submit"
        >
          Kirim Link Reset
        </BaseButton>
        <a class="login-card__back-link" @click="backToLogin">Kembali ke login</a>
      </form>

      <div v-else class="login-card__confirmation">
        <p class="login-card__confirmation-text">
          Cek email Anda. Kami telah mengirimkan tautan untuk mengatur ulang password ke
          <strong>{{ resetEmail }}</strong
          >.
        </p>
        <a class="login-card__back-link" @click="backToLogin">Kembali ke login</a>
      </div>

      <div class="login-card__footer">© 2026 Desa Wisata Tanjung Mas</div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--blue-300);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  padding: 24px;
}

.login-card {
  width: 448px;
  max-width: 100%;
  box-sizing: border-box;
  background: #fff;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-pop);
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.login-card__badge-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.login-card__badge {
  width: 64px;
  height: 52px;
  border-radius: 9999px;
  background: var(--blue-900);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card__heading {
  margin: 8px 0 0;
  font-size: var(--fs-title);
  line-height: var(--lh-title);
  font-weight: var(--fw-semibold);
  color: var(--ink-900);
}

.login-card__subheading {
  font-size: 16px;
  color: var(--ink-700);
}

.login-card__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-card__forgot-row {
  text-align: right;
  margin-top: 8px;
}

.login-card__forgot-link {
  font-size: 12px;
  font-weight: var(--fw-semibold);
  letter-spacing: 0.48px;
  color: var(--blue-900);
  cursor: pointer;
}

.login-card__error {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--danger);
}

.login-card__submit {
  width: 100%;
}

.login-card__divider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-card__divider::before,
.login-card__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--gray-200);
}

.login-card__divider span {
  color: var(--gray-500);
  font-size: var(--fs-sm);
}

.login-card__back-link {
  display: block;
  text-align: center;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--blue-900);
  cursor: pointer;
  margin-top: 4px;
}

.login-card__forgot-intro {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--ink-700);
}

.login-card__confirmation {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
}

.login-card__confirmation-text {
  margin: 0;
  font-size: var(--fs-md);
  color: var(--ink-700);
}

.login-card__footer {
  text-align: center;
  font-size: 14px;
  color: var(--ink-700);
}
</style>
