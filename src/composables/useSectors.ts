import { useQuery } from '@tanstack/vue-query'
import { getSectorsApi } from '@/services/sector.service'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useSectors(params: MaybeRefOrGetter<any> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['sectors', toValue(params)]),
    queryFn: () => getSectorsApi(toValue(params)),
  })

  const sectors = computed(() => query.data.value?.data.list || [])
  const pagination = computed(() => ({
    page: query.data.value?.data.page || 1,
    limit: query.data.value?.data.limit || 10,
    total: query.data.value?.data.total || 0,
  }))
  const pageCount = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  return {
    ...query,
    sectors,
    pagination,
    pageCount,
  }
}
