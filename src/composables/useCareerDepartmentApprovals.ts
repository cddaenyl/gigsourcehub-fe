import { useQuery } from '@tanstack/vue-query'
import { getCareerDepartmentApprovalsApi } from '@/services/career-department.service'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useCareerDepartmentApprovals(params: MaybeRefOrGetter<Record<string, unknown>> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['career-department-approvals', toValue(params)]),
    queryFn: () => getCareerDepartmentApprovalsApi(toValue(params)),
  })

  // Resolving pagination lists from API response
  const approvals = computed(() => {
    const res = query.data.value as any
    return res?.data?.list ?? []
  })

  const pagination = computed(() => {
    const res = query.data.value as any
    return {
      page: res?.data?.page ?? 1,
      limit: res?.data?.limit ?? 10,
      total: res?.data?.total ?? 0,
    }
  })

  const pageCount = computed(() =>
    Math.ceil(pagination.value.total / pagination.value.limit),
  )

  return {
    ...query,
    approvals,
    pagination,
    pageCount,
  }
}
