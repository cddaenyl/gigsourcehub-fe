import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { createRequestApi, getRequestsApi } from '@/services/request.service'
import type { CreateRequestPayload, RequestQueryParams } from '@/models/Request'

export function useCreateRequest() {
  return useMutation({
    mutationFn: async (payload: CreateRequestPayload) => {
      return createRequestApi(payload)
    },
  })
}

export function useRequests(params: MaybeRefOrGetter<RequestQueryParams> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['requests', toValue(params)]),
    queryFn: () => getRequestsApi(toValue(params)),
  })

  const requests = computed(() => query.data.value?.data.list || [])
  const pagination = computed(() => ({
    page: query.data.value?.data.page || 1,
    limit: query.data.value?.data.limit || 10,
    total: query.data.value?.data.total || 0,
  }))
  const pageCount = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  return {
    ...query,
    requests,
    pagination,
    pageCount,
  }
}
