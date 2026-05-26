import { defineStore } from 'pinia'
import type { User } from '@/models/User'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') as string | null,
    refreshToken: localStorage.getItem('refresh_token') as string | null,
    user: (localStorage.getItem('user') && localStorage.getItem('user') !== 'undefined') ? (JSON.parse(localStorage.getItem('user')!) as User) : null,
    isAuthenticated: !!localStorage.getItem('token'),
  }),

  actions: {
    setAuth(token: string, user?: User, refreshToken?: string) {
      this.token = token
      this.isAuthenticated = true
      localStorage.setItem('token', token)
      
      if (refreshToken) {
        this.refreshToken = refreshToken
        localStorage.setItem('refresh_token', refreshToken)
      }
      
      if (user) {
        this.user = user
        localStorage.setItem('user', JSON.stringify(user))
      }
    },

    logout() {
      this.token = null
      this.refreshToken = null
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    },
  },
})
