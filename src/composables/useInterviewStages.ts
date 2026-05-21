import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { getInterviewStagesApi } from '@/services/interview-stage.service'

export function useInterviewStages(params: MaybeRefOrGetter<any> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['interview-stages', toValue(params)]),
    queryFn: () => getInterviewStagesApi(toValue(params)),
  })

  const interviewStages = computed(() => query.data.value?.data.list || [])
  const pagination = computed(() => ({
    page: query.data.value?.data.page || 1,
    limit: query.data.value?.data.limit || 10,
    total: query.data.value?.data.total || 0,
  }))
  const pageCount = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  return {
    ...query,
    interviewStages,
    pagination,
    pageCount,
  }
}
