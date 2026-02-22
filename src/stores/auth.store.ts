import { defineStore } from "pinia"
import type { User } from "@/models/Auth"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
    user: null as User | null,
    isAuthenticated: false
  }),

  actions: {
    setAuth(token: string, user: User) {
      this.token = token
      this.user = user
      this.isAuthenticated = true
    },

    logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
    }
  }
})
