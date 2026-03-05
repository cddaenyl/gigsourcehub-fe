import { useMutation } from "@tanstack/vue-query"
import { loginApi, registerApi } from "@/services/auth.service"
import type { LoginPayload, RegisterPayload } from "@/models/Auth"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter } from "vue-router"


export function useLogin() {
  const authStore = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      return loginApi(payload)
    },

    onSuccess: (response) => {
      authStore.setAuth(
        response.data.token,
        response.data.user
      )
      router.push('/admin')
    }
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
      authStore.setAuth(
        response.data.token,
        response.data.user
      )
      router.push('/admin')
    }
  })
}
