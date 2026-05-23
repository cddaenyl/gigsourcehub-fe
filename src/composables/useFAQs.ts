import { useQuery } from '@tanstack/vue-query'
import { getFAQsApi } from '@/services/faq.service'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useFAQs(params: MaybeRefOrGetter<Record<string, unknown>> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['faqs', toValue(params)]),
    queryFn: () => getFAQsApi(toValue(params)),
  })

  const faqs = computed(() => query.data.value?.data.list ?? [])
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
    faqs,
    pagination,
    pageCount,
  }
}
