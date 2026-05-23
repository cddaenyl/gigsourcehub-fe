import { useQuery } from '@tanstack/vue-query'
import { getFAQApprovalsApi } from '@/services/faq.service'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useFAQApprovals(params: MaybeRefOrGetter<Record<string, unknown>> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['faq-approvals', toValue(params)]),
    queryFn: () => getFAQApprovalsApi(toValue(params)),
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
