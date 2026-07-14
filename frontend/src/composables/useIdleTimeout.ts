import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// Auto-logout setelah tidak ada aktivitas selama durasi ini.
const IDLE_LIMIT_MS = 30 * 60 * 1000 // 30 menit
// Jangan menulis ke localStorage tiap event (mousemove bisa ratusan/detik).
const STORAGE_THROTTLE_MS = 5000
const STORAGE_KEY = 'tjmas-admin-last-activity'
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const

/**
 * Memantau aktivitas user dan otomatis logout bila idle melewati batas.
 * Timestamp aktivitas dibagikan antar-tab lewat localStorage, sehingga aktivitas
 * di satu tab me-reset timer di tab lain dan logout menyebar ke semua tab.
 * Panggil sekali dari komponen yang hidup selama sesi admin (AdminLayout).
 */
export function useIdleTimeout() {
  const router = useRouter()
  const { signOut } = useAuth()

  let lastActivity = Date.now()
  let lastStorageWrite = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let loggingOut = false

  function clearTimer() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  async function logout() {
    if (loggingOut) return
    loggingOut = true
    clearTimer()
    await signOut()
    router.push({ name: 'admin-login', query: { timeout: '1' } })
  }

  function schedule() {
    clearTimer()
    const remaining = lastActivity + IDLE_LIMIT_MS - Date.now()
    if (remaining <= 0) {
      void logout()
      return
    }
    timer = setTimeout(check, remaining)
  }

  function check() {
    if (Date.now() - lastActivity >= IDLE_LIMIT_MS) {
      void logout()
    } else {
      schedule()
    }
  }

  function onActivity() {
    const now = Date.now()
    lastActivity = now
    if (now - lastStorageWrite > STORAGE_THROTTLE_MS) {
      lastStorageWrite = now
      try {
        localStorage.setItem(STORAGE_KEY, String(now))
      } catch {
        /* localStorage tidak tersedia — timer in-memory tetap jalan */
      }
    }
    schedule()
  }

  // Aktivitas di tab lain memperbarui timestamp bersama → sinkronkan timer.
  function onStorage(e: StorageEvent) {
    if (e.key !== STORAGE_KEY || !e.newValue) return
    const shared = Number(e.newValue)
    if (!Number.isNaN(shared) && shared > lastActivity) {
      lastActivity = shared
      schedule()
    }
  }

  // Saat tab kembali terlihat, langsung cek apakah sudah kedaluwarsa.
  function onVisibility() {
    if (document.visibilityState === 'visible') check()
  }

  onMounted(() => {
    // Hormati aktivitas terakhir dari tab lain bila ada.
    try {
      const stored = Number(localStorage.getItem(STORAGE_KEY))
      if (!Number.isNaN(stored) && stored > 0) lastActivity = Math.max(lastActivity, stored)
    } catch {
      /* abaikan */
    }
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }))
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisibility)
    onActivity()
  })

  onBeforeUnmount(() => {
    clearTimer()
    ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity))
    window.removeEventListener('storage', onStorage)
    document.removeEventListener('visibilitychange', onVisibility)
  })
}
