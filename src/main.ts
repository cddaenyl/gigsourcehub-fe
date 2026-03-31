import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import axios from 'axios'
import { useAuthStore } from './stores/auth.store'
import { canAccessPath, getDefaultRouteForUser, getUserRole, isAuthPage } from './utils/auth'

// Configure axios baseURL
axios.defaults.baseURL = import.meta.env.VITE_BASE_API_URL

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const userRole = getUserRole(authStore.user)

  if (!canAccessPath(userRole, to.path)) {
    if (!authStore.isAuthenticated) {
      return '/login'
    }

    return getDefaultRouteForUser(authStore.user)
  }

  if (authStore.isAuthenticated && isAuthPage(to.path)) {
    return getDefaultRouteForUser(authStore.user)
  }

  return true
})

// Setup axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

app.use(VueQueryPlugin)
app.use(router)

app.mount('#app')
