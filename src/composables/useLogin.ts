import { useMutation } from "@tanstack/vue-query"
import { loginApi } from "@/services/auth.service"
import type { LoginPayload } from "@/models/Auth"
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
