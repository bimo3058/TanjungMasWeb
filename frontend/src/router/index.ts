import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { supabase } from '../utils/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../components/layout/PublicLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
        {
          path: 'wisata',
          name: 'wisata',
          component: () => import('../views/WisataListView.vue'),
          meta: { navTitle: 'Wisata' },
        },
        {
          path: 'wisata/:slug',
          name: 'wisata-detail',
          component: () => import('../views/WisataDetailView.vue'),
          meta: { navTitle: 'Wisata' },
        },
        {
          path: 'umkm',
          name: 'umkm',
          component: () => import('../views/UmkmListView.vue'),
          meta: { navTitle: 'UMKM' },
        },
        {
          path: 'umkm/:slug',
          name: 'umkm-detail',
          component: () => import('../views/UmkmDetailView.vue'),
          meta: { navTitle: 'UMKM' },
        },
        {
          path: 'berita',
          name: 'berita',
          component: () => import('../views/BeritaListView.vue'),
          meta: { navTitle: 'Berita' },
        },
        {
          path: 'berita/:slug',
          name: 'berita-detail',
          component: () => import('../views/BeritaDetailView.vue'),
          meta: { navTitle: 'Berita' },
        },
        {
          path: 'tentang',
          name: 'tentang',
          component: () => import('../views/TentangView.vue'),
          meta: { navTitle: 'Tentang' },
        },
        {
          path: 'kontak',
          name: 'kontak',
          component: () => import('../views/KontakView.vue'),
          meta: { navTitle: 'Hubungi Kami' },
        },
      ],
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/AdminLoginView.vue'),
      meta: { navTitle: 'Masuk' },
    },
    {
      path: '/admin',
      component: () => import('../components/layout/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'aktivitas',
          name: 'admin-aktivitas',
          component: () => import('@/views/admin/AdminAktivitasView.vue'),
          meta: { navTitle: 'Semua Aktivitas' }
        },
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/AdminDashboardView.vue'),
          meta: { navTitle: 'Dashboard' },
        },
        {
          path: 'wisata',
          name: 'admin-wisata',
          component: () => import('../views/admin/AdminWisataListView.vue'),
          meta: { navTitle: 'Manajemen Wisata' },
        },
        {
          path: 'wisata/baru',
          name: 'admin-wisata-baru',
          component: () => import('../views/admin/AdminWisataFormView.vue'),
          meta: { navTitle: 'Tambah Wisata' },
        },
        {
          path: 'wisata/:id',
          name: 'admin-wisata-edit',
          component: () => import('../views/admin/AdminWisataFormView.vue'),
          meta: { navTitle: 'Edit Wisata' },
        },
        {
          path: 'umkm',
          name: 'admin-umkm',
          component: () => import('../views/admin/AdminUmkmListView.vue'),
          meta: { navTitle: 'Manajemen UMKM' },
        },
        {
          path: 'umkm/baru',
          name: 'admin-umkm-baru',
          component: () => import('../views/admin/AdminUmkmFormView.vue'),
          meta: { navTitle: 'Tambah UMKM' },
        },
        {
          path: 'umkm/:id',
          name: 'admin-umkm-edit',
          component: () => import('../views/admin/AdminUmkmFormView.vue'),
          meta: { navTitle: 'Edit UMKM' },
        },
        {
          path: 'berita',
          name: 'admin-berita',
          component: () => import('../views/admin/AdminBeritaListView.vue'),
          meta: { navTitle: 'Manajemen Berita' },
        },
        {
          path: 'berita/baru',
          name: 'admin-berita-baru',
          component: () => import('../views/admin/AdminBeritaFormView.vue'),
          meta: { navTitle: 'Tambah Berita' },
        },
        {
          path: 'berita/:id',
          name: 'admin-berita-edit',
          component: () => import('../views/admin/AdminBeritaFormView.vue'),
          meta: { navTitle: 'Edit Berita' },
        },
        {
          path: 'profil',
          name: 'admin-profil',
          component: () => import('../views/admin/AdminProfilDesaView.vue'),
          meta: { navTitle: 'Profil Desa' },
        },
        {
          path: 'pengguna',
          name: 'admin-pengguna',
          component: () => import('../views/admin/AdminPenggunaView.vue'),
          meta: { navTitle: 'Kelola Pengguna' },
        },
        {
          path: 'akun',
          name: 'admin-akun',
          component: () => import('../views/admin/AdminAkunView.vue'),
          meta: { navTitle: 'Akun Saya' },
        },
      ],
    },
  ],
})

async function isAdminUser(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return !error && data?.role === 'admin'
}

router.beforeEach(async (to: RouteLocationNormalized) => {
  if (!to.meta.requiresAuth && to.name !== 'admin-login') return true

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (to.meta.requiresAuth) {
    if (!session) {
      return { name: 'admin-login' }
    }
    // Session saja tidak cukup — hanya role 'admin' yang boleh masuk panel.
    if (!(await isAdminUser(session.user.id))) {
      await supabase.auth.signOut()
      return { name: 'admin-login', query: { denied: '1' } }
    }
  }

  if (to.name === 'admin-login' && session && (await isAdminUser(session.user.id))) {
    return { name: 'admin-dashboard' }
  }

  return true
})

// ---------------------------------------------------------------------------
// Judul tab per halaman. Sumbernya `meta.navTitle` yang sudah dipakai top bar
// admin, jadi judul tab tidak bisa melenceng dari judul yang tampil di layar.
// ---------------------------------------------------------------------------
const SITE_NAME = 'Desa Wisata Tanjung Mas'
const HOME_TITLE = 'Desa Wisata Kampung Nelayan Bahari Tambaklorok'

router.afterEach((to) => {
  const section = to.meta.navTitle as string | undefined

  // Beranda tidak punya navTitle — pakai nama lengkap desa.
  if (!section) {
    document.title = HOME_TITLE
    return
  }

  const scope = to.path.startsWith('/admin') ? 'Admin Tanjung Mas' : SITE_NAME
  document.title = `${section} · ${scope}`
})

export default router
