import { useQuery } from '@tanstack/vue-query'
import { getCompanyProfileApprovalsApi } from '@/services/company-profile.service'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useCompanyProfileApprovals(params: MaybeRefOrGetter<Record<string, unknown>> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['company-profile-approvals', toValue(params)]),
    queryFn: () => getCompanyProfileApprovalsApi(toValue(params)),
  })

  const approvals = computed(() => query.data.value?.data.list ?? [])
  const pagination = computed(() => ({
    page: query.data.value?.data.page ?? 1,
    limit: query.data.value?.data.limit ?? 10,
    total: query.data.value?.data.total ?? 0,
  }))
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
