import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { loginApi, meApi, registerApi } from '@/services/auth.service'
import type { LoginPayload, RegisterPayload } from '@/models/Auth'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { getDefaultRouteForUser } from '@/utils/auth'

const AUTH_ME_QUERY_KEY = ['auth', 'me']

export function useLogin() {
  const authStore = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      return loginApi(payload)
    },

    onSuccess: (response) => {
      authStore.setAuth(response.data.token, response.data.user)
      queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY })
      router.push(getDefaultRouteForUser(response.data.user))
    },
  })
}

export function useRegister() {
  const authStore = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      return registerApi(payload)
    },

    onSuccess: (response) => {
      authStore.setAuth(response.data.token, response.data.user)
      queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY })
      router.push(getDefaultRouteForUser(response.data.user))
    },
  })
}

export function useLogout() {
  const authStore = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const logout = () => {
    authStore.logout()
    queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY })
    router.push('/login')
  }

  return logout
}

export function useMeQuery() {
  const authStore = useAuthStore()

  return useQuery<
    Awaited<ReturnType<typeof meApi>>,
    Error,
    Awaited<ReturnType<typeof meApi>>['data']
  >({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: meApi,
    enabled: !!authStore.token,
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
