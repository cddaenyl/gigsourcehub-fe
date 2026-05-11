import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import {
  createRequestApi,
  getAdminMyRequestsApi,
  getAdminPendingRequestsApi,
  getRequestDetail,
  getAdminRequestsApi,
  getRequestsApi,
  rejectAdminRequestApi,
  validateAdminRequestApi,
} from '@/services/request.service'
import type {
  CreateRequestPayload,
  RequestDecisionPayload,
  RequestQueryParams,
} from '@/models/Request'

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

export function useAdminRequests(params: MaybeRefOrGetter<RequestQueryParams> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['admin-requests', toValue(params)]),
    queryFn: () => getAdminRequestsApi(toValue(params)),
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

export function useAdminRequestsByTab(
  params: MaybeRefOrGetter<RequestQueryParams> = {},
  tab: MaybeRefOrGetter<'semua' | 'menunggu validasi' | 'tugas saya'> = 'semua',
) {
  const query = useQuery({
    queryKey: computed(() => ['admin-requests', toValue(tab), toValue(params)]),
    queryFn: async () => {
      const currentTab = toValue(tab)
      const currentParams = toValue(params)

      if (currentTab === 'menunggu validasi') {
        return getAdminPendingRequestsApi(currentParams)
      }

      if (currentTab === 'tugas saya') {
        return getAdminMyRequestsApi(currentParams)
      }

      return getAdminRequestsApi(currentParams)
    },
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

export function useAdminRequest(id: MaybeRefOrGetter<string>) {
  const query = useQuery({
    queryKey: computed(() => ['admin-request', toValue(id)]),
    queryFn: () => getRequestDetail(toValue(id)),
    enabled: computed(() => Boolean(toValue(id))),
  })

  const request = computed(() => query.data.value?.data || null)

  return {
    ...query,
    request,
  }
}

export function useRejectAdminRequest() {
  return useMutation({
    mutationFn: async (variables: { id: string; payload: RequestDecisionPayload }) => {
      return rejectAdminRequestApi(variables.id, variables.payload)
    },
  })
}

export function useValidateAdminRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      return validateAdminRequestApi(id)
    },
  })
}
