import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { UserRole } from '@/composables/useAuth'

export interface AdminUser {
  id: string
  email: string
  nama_lengkap: string | null
  role: UserRole
  created_at: string | null
}

// Semua data & mutasi lewat RPC SECURITY DEFINER (admin_list_users /
// admin_set_role) yang menggerbang akses berdasarkan is_admin() di database.
export function useAdminUsers() {
  const users = ref<AdminUser[]>([])
  const loading = ref(true)
  const error = ref('')

  async function fetchUsers() {
    loading.value = true
    error.value = ''
    const { data, error: rpcError } = await supabase.rpc('admin_list_users')
    if (rpcError) {
      error.value = rpcError.message
      users.value = []
    } else {
      users.value = (data ?? []) as AdminUser[]
    }
    loading.value = false
  }

  async function setRole(id: string, role: UserRole): Promise<{ error: string | null }> {
    const { error: rpcError } = await supabase.rpc('admin_set_role', {
      target_user: id,
      new_role: role,
    })
    if (rpcError) return { error: rpcError.message }
    const target = users.value.find((u) => u.id === id)
    if (target) target.role = role
    return { error: null }
  }

  return { users, loading, error, fetchUsers, setRole }
}
