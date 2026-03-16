import { useMutation } from '@tanstack/vue-query'
import { loginApi, registerApi } from '@/services/auth.service'
import type { LoginPayload, RegisterPayload } from '@/models/Auth'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { getDefaultRouteForUser } from '@/utils/auth'

export function useLogin() {
  const authStore = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      return loginApi(payload)
    },

    onSuccess: (response) => {
      authStore.setAuth(response.data.token, response.data.user)
      router.push(getDefaultRouteForUser(response.data.user))
    },
  })
}

export function useRegister() {
  const authStore = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      return registerApi(payload)
    },

    onSuccess: (response) => {
      authStore.setAuth(response.data.token, response.data.user)
      router.push(getDefaultRouteForUser(response.data.user))
    },
  })
}

export function useLogout() {
  const authStore = useAuthStore()
  const router = useRouter()

  const logout = () => {
    authStore.logout()
    router.push('/login')
  }

  return logout
}
