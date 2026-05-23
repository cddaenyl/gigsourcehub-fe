import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { getInterviewsApi, getScheduledInterviewsApi } from '@/services/interview.service'
import type { InterviewScheduleQueryParams, InterviewScheduleTab } from '@/models/InterviewSchedule'

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
