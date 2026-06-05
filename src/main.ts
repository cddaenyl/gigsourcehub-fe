import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import axios, { AxiosError } from 'axios'
import { useAuthStore } from './stores/auth.store'
import { canAccessPath, getDefaultRouteForUser, getUserRole, isAuthPage } from './utils/auth'
import { refreshTokenApi } from './services/auth.service'

// Configure axios baseURL
axios.defaults.baseURL = import.meta.env.VITE_BASE_API_URL

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return { top: 0 }
  },
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

// Flag to track refresh status and queue for failed requests
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token)
    } else {
      prom.reject(error)
    }
  })
  failedQueue = []
}

// Handle global error responses (401, 403) with silent refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()
    const originalRequest = error.config

    if (error instanceof AxiosError) {
      const isAuthPath = originalRequest?.url?.includes('/auth/refresh') || originalRequest?.url?.includes('/auth/login')

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthPath) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(axios(originalRequest))
              },
              reject: (err: any) => {
                reject(err)
              }
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        const currentRefreshToken = authStore.refreshToken
        if (currentRefreshToken) {
          try {
            const refreshRes = await refreshTokenApi({ refresh_token: currentRefreshToken })
            const newToken = refreshRes.data.token
            const newRefreshToken = refreshRes.data.refresh_token

            authStore.setAuth(newToken, undefined, newRefreshToken)

            processQueue(null, newToken)

            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return axios(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError, null)
            authStore.logout()
            router.push('/login')
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        } else {
          authStore.logout()
          router.push('/login')
        }
      } else if ((error.response?.status === 401 || error.response?.status === 403) && isAuthPath) {
        authStore.logout()
        router.push('/login')
      }
    } else if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      authStore.logout()
      router.push('/login')
    }

    return Promise.reject(error)
  }
)

app.use(VueQueryPlugin)
app.use(router)

app.mount('#app')
