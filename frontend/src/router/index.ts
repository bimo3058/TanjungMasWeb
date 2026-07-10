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
          component: () => import('../views/ComingSoonView.vue'),
          meta: { navTitle: 'Wisata' },
        },
        {
          path: 'umkm',
          name: 'umkm',
          component: () => import('../views/ComingSoonView.vue'),
          meta: { navTitle: 'UMKM' },
        },
        {
          path: 'berita',
          name: 'berita',
          component: () => import('../views/ComingSoonView.vue'),
          meta: { navTitle: 'Berita' },
        },
        {
          path: 'tentang',
          name: 'tentang',
          component: () => import('../views/ComingSoonView.vue'),
          meta: { navTitle: 'Tentang' },
        },
      ],
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/AdminLoginView.vue'),
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/admin/AdminDashboardView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to: RouteLocationNormalized) => {
  if (!to.meta.requiresAuth && to.name !== 'admin-login') return true

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) {
    return { name: 'admin-login' }
  }

  if (to.name === 'admin-login' && session) {
    return { name: 'admin-dashboard' }
  }

  return true
})

export default router
