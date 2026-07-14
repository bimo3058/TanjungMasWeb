import { ref, computed } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase'

export type UserRole = 'admin' | 'viewer'

const session = ref<Session | null>(null)
const loading = ref(true)
const role = ref<UserRole | null>(null)
const roleLoading = ref(true)
// Nama tampilan bersumber dari profiles.nama_lengkap — satu sumber kebenaran,
// dipakai sidebar, avatar, dan halaman Kelola Pengguna.
const namaLengkap = ref<string | null>(null)

// Ambil role + nama dari tabel profiles untuk user yang sedang aktif.
// Dipanggil saat init dan tiap perubahan auth agar guard/UI selalu sinkron.
async function loadRole(currentSession: Session | null) {
  if (!currentSession) {
    role.value = null
    namaLengkap.value = null
    roleLoading.value = false
    return
  }
  roleLoading.value = true
  const { data, error } = await supabase
    .from('profiles')
    .select('role, nama_lengkap')
    .eq('id', currentSession.user.id)
    .single()
  role.value = error ? null : ((data?.role as UserRole | undefined) ?? null)
  namaLengkap.value = error ? null : ((data?.nama_lengkap as string | null) ?? null)
  roleLoading.value = false
}

supabase.auth.getSession().then(async ({ data }) => {
  session.value = data.session
  await loadRole(data.session)
  loading.value = false
})

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession
  // Fire-and-forget: perbarui role mengikuti sesi terbaru.
  void loadRole(newSession)
})

function mapAuthError(message: string): string {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) {
    return 'Email atau password salah.'
  }
  if (normalized.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Silakan periksa kotak masuk Anda.'
  }
  if (normalized.includes('already been registered') || normalized.includes('already registered')) {
    return 'Email tersebut sudah dipakai akun lain.'
  }
  if (normalized.includes('should be different')) {
    return 'Email baru sama dengan email Anda sekarang.'
  }
  if (normalized.includes('invalid email')) {
    return 'Format email tidak valid.'
  }
  return message
}

export function useAuth() {
  const user = computed(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => !!session.value)
  const isAdmin = computed(() => role.value === 'admin')

  // Satu akun bisa punya beberapa identitas (mis. 'email' dan/atau 'google').
  const providers = computed(() => {
    const ids = user.value?.identities?.map((i) => i.provider) ?? []
    // Fallback bila `identities` tidak ikut terkirim di sesi.
    if (ids.length === 0 && user.value?.app_metadata?.provider) {
      return [user.value.app_metadata.provider as string]
    }
    return ids
  })

  // Email hanya bisa diganti bila akun punya identitas 'email' (login password).
  // Akun Google: alamatnya milik Google — Supabase menolak menggantinya, dan
  // memaksakannya hanya akan memutus tautan login OAuth-nya.
  const canChangeEmail = computed(() => providers.value.includes('email'))
  const isGoogleAccount = computed(() => providers.value.includes('google'))

  const displayName = computed(
    () => namaLengkap.value?.trim() || user.value?.email?.split('@')[0] || 'Admin',
  )

  // Baca role terkini langsung dari DB (dipakai router guard & login untuk
  // memutuskan akses tanpa menunggu listener async me-refresh state).
  async function fetchRole(): Promise<UserRole | null> {
    const {
      data: { session: current },
    } = await supabase.auth.getSession()
    await loadRole(current)
    return role.value
  }

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
    role.value = null
    namaLengkap.value = null
  }

  /** Simpan nama tampilan. RLS hanya mengizinkan kolom nama_lengkap milik sendiri. */
  async function updateNamaLengkap(nama: string) {
    const id = user.value?.id
    if (!id) return { error: 'Sesi tidak ditemukan.' }

    const { error } = await supabase
      .from('profiles')
      .update({ nama_lengkap: nama.trim() })
      .eq('id', id)

    if (error) return { error: error.message }

    namaLengkap.value = nama.trim()
    return { error: null }
  }

  /**
   * Ajukan penggantian email. Email TIDAK langsung berubah: Supabase mengirim
   * tautan konfirmasi dan alamat baru baru berlaku setelah diklik (bila
   * "Secure email change" aktif, tautan dikirim ke alamat lama DAN baru).
   */
  async function updateEmail(email: string) {
    if (!canChangeEmail.value) {
      return { error: 'Email akun Google tidak dapat diubah dari sini.' }
    }
    const { error } = await supabase.auth.updateUser({ email: email.trim() })
    return { error: error ? mapAuthError(error.message) : null }
  }

  return {
    session,
    user,
    role,
    namaLengkap,
    displayName,
    providers,
    canChangeEmail,
    isGoogleAccount,
    isAdmin,
    isAuthenticated,
    loading,
    roleLoading,
    fetchRole,
    signInWithPassword,
    signInWithGoogle,
    resetPasswordForEmail,
    updateNamaLengkap,
    updateEmail,
    signOut,
  }
}
