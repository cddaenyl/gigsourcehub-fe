import { useMutation } from '@tanstack/vue-query'
import { createRequestApi } from '@/services/request.service'
import type { CreateRequestPayload } from '@/models/Request'

export function useCreateRequest() {
  return useMutation({
    mutationFn: async (payload: CreateRequestPayload) => {
      return createRequestApi(payload)
    },
  })
}
