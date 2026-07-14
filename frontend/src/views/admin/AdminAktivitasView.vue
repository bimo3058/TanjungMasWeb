<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Waves, Newspaper, Store, Pencil, ArrowLeft } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { formatRelativeIndonesia } from '@/utils/formatDate'
import { supabase } from '@/utils/supabase'

const router = useRouter()

const activity = ref<any[]>([])
const loading = ref(true)

// Helper untuk ikon berdasarkan tipe
const getActivityIcon = (source: string) => {
  const type = source.toLowerCase()
  if (type === 'berita') return Newspaper
  if (type === 'umkm') return Store
  return Waves
}

const getStatusVariant = (status: string | boolean) => {
  const s = String(status).toLowerCase()
  if (s === 'true' || s === 'published' || s === 'terpublikasi') return 'green'
  if (s === 'deleted') return 'red'
  return 'gray' 
}

const handleEdit = (item: any) => {
  const type = item.source.toLowerCase()
  let routePrefix = ''
  
  if (type === 'berita') {
    routePrefix = 'berita'
  } else if (type === 'umkm') {
    routePrefix = 'umkm'
  } else {
    routePrefix = 'wisata'
  }
  
  router.push(`/admin/${routePrefix}/${item.id}`)
}

const fetchAllActivities = async () => {
  loading.value = true
  try {
    const [beritaRes, umkmRes, wisataRes] = await Promise.all([
      supabase.from('berita').select('*'),
      supabase.from('umkm').select('*'),
      supabase.from('wisata').select('*')
    ])

    if (beritaRes.error) console.error('Error fetch Berita:', beritaRes.error)
    if (umkmRes.error) console.error('Error fetch UMKM:', umkmRes.error)
    if (wisataRes.error) console.error('Error fetch Wisata:', wisataRes.error)

    const combinedData: any[] = []

    if (beritaRes.data) {
      beritaRes.data.forEach((item: any) => {
        const rawStatus = item.status ?? item.is_published ?? item.published ?? 'Draft'
        const statusLabel = (String(rawStatus).toLowerCase() === 'true' || rawStatus === 'Published') ? 'Terpublikasi' : 'Draft'

        combinedData.push({
          id: item.id,
          source: 'Berita',
          title: item.judul || item.title || 'Tanpa Judul',
          status: statusLabel, 
          statusVariant: getStatusVariant(rawStatus),
          updatedAt: item.updated_at || item.created_at || new Date().toISOString()
        })
      })
    }

    if (umkmRes.data) {
      umkmRes.data.forEach((item: any) => {
        const rawStatus = item.status ?? item.is_published ?? item.published ?? 'Draft'
        const statusLabel = (String(rawStatus).toLowerCase() === 'true' || rawStatus === 'Published') ? 'Terpublikasi' : 'Draft'

        combinedData.push({
          id: item.id,
          source: 'UMKM',
          title: item.nama || item.nama_usaha || item.title || 'Tanpa Nama',
          status: statusLabel,
          statusVariant: getStatusVariant(rawStatus),
          updatedAt: item.updated_at || item.created_at || new Date().toISOString()
        })
      })
    }

    if (wisataRes.data) {
      wisataRes.data.forEach((item: any) => {
        const rawStatus = item.status ?? item.is_published ?? item.published ?? 'Draft'
        const statusLabel = (String(rawStatus).toLowerCase() === 'true' || rawStatus === 'Published') ? 'Terpublikasi' : 'Draft'

        combinedData.push({
          id: item.id,
          source: 'Destinasi',
          title: item.nama || item.nama_wisata || item.title || 'Tanpa Nama',
          status: statusLabel,
          statusVariant: getStatusVariant(rawStatus),
          updatedAt: item.updated_at || item.created_at || new Date().toISOString()
        })
      })
    }
    combinedData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    activity.value = combinedData
  } catch (error) {
    console.error('Gagal memproses data aktivitas:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAllActivities()
})
</script>

<template>
  <div class="aktivitas-page">
    
    <!-- HEADER HALAMAN -->
    <div class="page-header">
      <button class="back-btn" @click="router.push('/admin')">
        <ArrowLeft :size="18" /> Kembali ke Dashboard
      </button>
      <h1 class="page-title">Semua Aktivitas</h1>
      <p class="page-subtitle">Riwayat seluruh penambahan dan pembaruan data di sistem.</p>
    </div>

    <!-- KONTEN TABEL -->
    <div class="activity-container">
      <div v-if="loading" class="activity__skeleton">
        <div v-for="n in 8" :key="n" class="activity__skeleton-row" />
      </div>
      <p v-else-if="activity.length === 0" class="activity__empty">Belum ada aktivitas yang terekam.</p>
      
      <div v-else class="activity__scroll">
        <table class="activity__table">
          <thead>
            <tr>
              <th>Tipe</th>
              <th>Judul / Item</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in activity" :key="`${item.source}-${item.id}`">
              
              <!-- Kolom Tipe -->
              <td>
                <div class="activity__cell-type">
                  <div class="type-icon-wrapper">
                    <component :is="getActivityIcon(item.source)" :size="14" class="type-icon" />
                  </div>
                  {{ item.source }}
                </div>
              </td>
              
              <!-- Kolom Judul -->
              <td class="activity__cell-title">{{ item.title }}</td>
              
              <!-- Kolom Status -->
              <td>
                <BaseBadge :variant="item.statusVariant" class="custom-badge">
                  {{ item.status }}
                </BaseBadge>
              </td>
              
              <!-- Kolom Tanggal -->
              <td class="activity__cell-time">{{ formatRelativeIndonesia(item.updatedAt) }}</td>
              
              <!-- Kolom Aksi -->
              <td>
                <button class="action-btn" title="Edit" @click="handleEdit(item)">
                  <Pencil :size="16" />
                </button>
              </td>
              
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.aktivitas-page {
  /* Tumbuh mengisi area gulir, tapi tak pernah dimampatkan saat konten panjang. */
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 32px;
  font-family: 'Poppins', sans-serif;
  background-color: #F8F9FF;
}

/* HEADER STYLES */
.page-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #3b508f;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 8px;
  width: max-content;
}

.back-btn:hover {
  text-decoration: underline;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #0b1134;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #7b8293;
  margin: 0;
}

/* CONTAINER & TABLE STYLES */
.activity-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  border: 1px solid #eef0f6;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.activity__scroll {
  width: 100%;
  overflow-x: auto;
}

.activity__table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.activity__table th {
  background-color: #f6f8fb;
  color: #5e6678;
  font-size: 12px;
  font-weight: 700;
  padding: 14px 24px;
}

.activity__table td {
  padding: 16px 24px;
  border-bottom: 1px solid #eef0f6;
  font-size: 14px;
  color: #3b4256;
}

.activity__table tbody tr:last-child td {
  border-bottom: none;
}

.activity__cell-type {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #5e6678;
  font-weight: 500;
}

.type-icon-wrapper {
  background-color: #e8ecf8;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b508f;
}

.activity__cell-title {
  font-weight: 500;
  color: #0b1134;
}

.activity__cell-time {
  color: #7b8293;
}

.custom-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.action-btn {
  background: transparent;
  border: none;
  color: #7b8293;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: color 0.2s ease;
}

.action-btn:hover {
  color: #1a1b5c;
}

.activity__skeleton {
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 12px;
}

.activity__skeleton-row {
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e1e4e8 37%, #f0f2f5 63%);
  background-size: 400% 100%;
  animation: dashboard-shimmer 1.4s ease infinite;
}

@keyframes dashboard-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.activity__empty {
  padding: 32px;
  text-align: center;
  color: #7b8293;
}

@media (max-width: 768px) {
  .aktivitas-page {
    padding: 16px;
  }
  .activity__table th, .activity__table td {
    padding: 12px 16px;
  }
}
</style>