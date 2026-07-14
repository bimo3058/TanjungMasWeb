<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ShieldCheck, ShieldOff } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseSearchBar from '@/components/ui/BaseSearchBar.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useAdminUsers, type AdminUser } from '@/composables/useAdminUsers'
import { useAuth } from '@/composables/useAuth'
import { formatTanggalIndonesia } from '@/utils/formatDate'

const { users, loading, error, fetchUsers, setRole } = useAdminUsers()
const { user } = useAuth()

const search = ref('')
const pending = ref<AdminUser | null>(null)
const saving = ref(false)
const actionError = ref('')

onMounted(fetchUsers)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(
    (u) =>
      u.email.toLowerCase().includes(q) ||
      (u.nama_lengkap ?? '').toLowerCase().includes(q),
  )
})

const adminCount = computed(() => users.value.filter((u) => u.role === 'admin').length)

function isSelf(u: AdminUser) {
  return u.id === user.value?.id
}

const targetRole = computed<'admin' | 'viewer'>(() =>
  pending.value?.role === 'admin' ? 'viewer' : 'admin',
)

async function handleConfirm() {
  if (!pending.value) return
  saving.value = true
  actionError.value = ''
  const { error: err } = await setRole(pending.value.id, targetRole.value)
  saving.value = false
  if (err) {
    actionError.value = err
    return
  }
  pending.value = null
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <div class="page__heading">
        <h1 class="page__title">Kelola Pengguna</h1>
        <span class="page__count">{{ users.length }} akun · {{ adminCount }} admin</span>
      </div>
    </div>

    <p class="page__hint">
      Hanya akun dengan role <strong>Admin</strong> yang dapat masuk ke panel dan mengubah data.
      Anda tidak dapat mengubah role akun Anda sendiri.
    </p>

    <div class="table-card">
      <div class="table-card__filters">
        <BaseSearchBar v-model="search" dense width="260px" placeholder="Cari nama atau email…" />
      </div>

      <div v-if="loading" class="table-card__skeleton">
        <div v-for="n in 4" :key="n" class="table-card__skeleton-row" />
      </div>
      <p v-else-if="error" class="table-card__empty">{{ error }}</p>
      <p v-else-if="filtered.length === 0" class="table-card__empty">Tidak ada pengguna.</p>
      <div v-else class="table-card__scroll">
        <table class="table">
          <colgroup>
            <col style="width: 26%" />
            <col style="width: 30%" />
            <col style="width: 14%" />
            <col style="width: 14%" />
            <col style="width: 16%" />
          </colgroup>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Terdaftar</th>
              <th class="table__col-actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filtered" :key="u.id">
              <td>
                {{ u.nama_lengkap || '—' }}
                <span v-if="isSelf(u)" class="table__self">(Anda)</span>
              </td>
              <td class="table__cell-muted">{{ u.email }}</td>
              <td>
                <BaseBadge :variant="u.role === 'admin' ? 'solid' : 'blue'" dense>
                  {{ u.role === 'admin' ? 'Admin' : 'Viewer' }}
                </BaseBadge>
              </td>
              <td class="table__cell-muted">
                {{ u.created_at ? formatTanggalIndonesia(u.created_at) : '—' }}
              </td>
              <td class="table__col-actions">
                <BaseButton
                  v-if="!isSelf(u)"
                  variant="outline"
                  size="sm"
                  @click="((actionError = ''), (pending = u))"
                >
                  <template #icon>
                    <ShieldOff v-if="u.role === 'admin'" :size="14" />
                    <ShieldCheck v-else :size="14" />
                  </template>
                  {{ u.role === 'admin' ? 'Jadikan Viewer' : 'Jadikan Admin' }}
                </BaseButton>
                <span v-else class="table__cell-muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmDialog
      :open="!!pending"
      :title="targetRole === 'admin' ? 'Jadikan Admin?' : 'Cabut Akses Admin?'"
      :message="
        pending
          ? targetRole === 'admin'
            ? `${pending.email} akan mendapat akses penuh ke panel admin.`
            : `${pending.email} tidak akan bisa lagi mengakses panel admin.`
          : ''
      "
      :confirm-label="targetRole === 'admin' ? 'Jadikan Admin' : 'Cabut Akses'"
      :danger="targetRole === 'viewer'"
      :loading="saving"
      @confirm="handleConfirm"
      @cancel="pending = null"
    />

    <p v-if="actionError" class="page__error">{{ actionError }}</p>
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

.page__hint {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink-700);
}

.page__error {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--danger);
}

.table-card {
  background: var(--surface-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-admin);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-card__filters {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--blue-200);
  flex-wrap: wrap;
}

.table-card__scroll {
  overflow-x: auto;
  flex: 1;
}

.table {
  width: 100%;
  min-width: 680px;
  table-layout: fixed;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 9px 14px;
  font-size: 11px;
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
  color: var(--ink-700);
}

.table td {
  padding: 8px 14px;
  border-top: 1px solid var(--blue-200);
  font-size: 13px;
  overflow-wrap: break-word;
}

.table__col-actions {
  text-align: right;
  white-space: nowrap;
}

.table__cell-muted {
  color: var(--ink-700);
}

.table__self {
  font-size: 11px;
  color: var(--gray-500);
  margin-left: 4px;
}

.table tbody tr:hover {
  background: var(--blue-50);
}

.table-card__skeleton {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
}

.table-card__skeleton-row {
  height: 18px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--blue-100) 25%, var(--blue-150) 37%, var(--blue-100) 63%);
  background-size: 400% 100%;
  animation: table-shimmer 1.4s ease infinite;
}

@keyframes table-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.table-card__empty {
  padding: 32px 24px;
  margin: 0;
  text-align: center;
  color: var(--text-muted);
}
</style>
