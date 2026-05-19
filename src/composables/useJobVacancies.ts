import { useQuery } from '@tanstack/vue-query'
import { getJobVacanciesApi } from '@/services/job-vacancy.service'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useJobVacancies(params: MaybeRefOrGetter<Record<string, unknown>> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['job-vacancies', toValue(params)]),
    queryFn: () => getJobVacanciesApi(toValue(params)),
  })

  const jobVacancies = computed(() => query.data.value?.data.list ?? [])
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
    jobVacancies,
    pagination,
    pageCount,
  }
}
