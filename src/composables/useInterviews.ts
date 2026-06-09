import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import {
  createInterviewApi,
  getInterviewByIdApi,
  getInterviewsApi,
  getScheduledInterviewsApi,
  updateInterviewApi,
} from '@/services/interview.service'
import type {
  CreateInterviewPayload,
  InterviewScheduleQueryParams,
  InterviewScheduleTab,
} from '@/models/InterviewSchedule'

export function useInterviewsByTab(
  params: MaybeRefOrGetter<InterviewScheduleQueryParams> = {},
  tab: MaybeRefOrGetter<InterviewScheduleTab> = 'semua',
) {
  const query = useQuery({
    queryKey: computed(() => ['interviews', toValue(tab), toValue(params)]),
    queryFn: async () => {
      const currentTab = toValue(tab)
      const currentParams = toValue(params)

      if (currentTab === 'scheduled') {
        return getScheduledInterviewsApi(currentParams)
      }

      return getInterviewsApi(currentParams)
    },
  })

  const interviews = computed(() => query.data.value?.data.list || [])
  const pagination = computed(() => ({
    page: query.data.value?.data.page || 1,
    limit: query.data.value?.data.limit || 10,
    total: query.data.value?.data.total || 0,
  }))
  const pageCount = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  return {
    ...query,
    interviews,
    pagination,
    pageCount,
  }
}

export function useCreateInterview() {
  return useMutation({
    mutationFn: async (payload: CreateInterviewPayload) => {
      return createInterviewApi(payload)
    },
  })
}

export function useInterviewById(id: MaybeRefOrGetter<string | null>) {
  const query = useQuery({
    queryKey: computed(() => ['interview', toValue(id)]),
    queryFn: () => getInterviewByIdApi(toValue(id) as string),
    enabled: computed(() => Boolean(toValue(id))),
  })

  const interview = computed(() => query.data.value?.data || null)

  return {
    ...query,
    interview,
  }
}

export function useUpdateInterview() {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<{ scheduled_at: string }>
    }) => {
      return updateInterviewApi(id, payload)
    },
  })
}
