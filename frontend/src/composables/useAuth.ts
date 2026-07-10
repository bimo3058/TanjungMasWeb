import { ref, computed } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase'

const session = ref<Session | null>(null)
const loading = ref(true)

supabase.auth.getSession().then(({ data }) => {
  session.value = data.session
  loading.value = false
})

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession
})

function mapAuthError(message: string): string {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) {
    return 'Email atau password salah.'
  }
  if (normalized.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Silakan periksa kotak masuk Anda.'
  }
  return message
}

export function useAuth() {
  const user = computed(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => !!session.value)

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? mapAuthError(error.message) : null }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    })
    return { error: error ? mapAuthError(error.message) : null }
  }

  async function resetPasswordForEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    })
    return { error: error ? mapAuthError(error.message) : null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    session,
    user,
    isAuthenticated,
    loading,
    signInWithPassword,
    signInWithGoogle,
    resetPasswordForEmail,
    signOut,
  }
}
