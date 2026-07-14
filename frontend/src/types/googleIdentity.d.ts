export {}

interface GoogleIdConfiguration {
  client_id: string
  callback: (response: { credential: string }) => void
  /** Nonce yang sudah di-hash SHA-256; versi mentahnya dikirim ke Supabase. */
  nonce?: string
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  use_fedcm_for_prompt?: boolean
}

interface GoogleButtonOptions {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  /** Hanya menerima piksel, maksimum 400. */
  width?: number
  locale?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void
          renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void
          cancel: () => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}
