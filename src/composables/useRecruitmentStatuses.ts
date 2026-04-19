import { useQuery } from '@tanstack/vue-query'
import { getRecruitmentStatusesApi } from '@/services/recruitment-status.service'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useRecruitmentStatuses(params: MaybeRefOrGetter<any> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['recruitment-statuses', toValue(params)]),
    queryFn: () => getRecruitmentStatusesApi(toValue(params)),
  })

  const recruitmentStatuses = computed(() => query.data.value?.data.list || [])
  const pagination = computed(() => ({
    page: query.data.value?.data.page || 1,
    limit: query.data.value?.data.limit || 10,
    total: query.data.value?.data.total || 0,
  }))
  const pageCount = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  return {
    ...query,
    recruitmentStatuses,
    pagination,
    pageCount,
  }
}
