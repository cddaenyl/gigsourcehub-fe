import { useQuery } from '@tanstack/vue-query'
import { getCareerDepartmentsApi } from '@/services/career-department.service'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useCareerDepartments(params: MaybeRefOrGetter<Record<string, unknown>> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['career-departments', toValue(params)]),
    queryFn: () => getCareerDepartmentsApi(toValue(params)),
  })

  const careerDepartments = computed(() => query.data.value?.data.list ?? [])
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
    careerDepartments,
    pagination,
    pageCount,
  }
}
