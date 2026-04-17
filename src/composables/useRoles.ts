import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { RolesQueryParams } from '@/models/Role'
import { getRolesApi } from '@/services/role.service'

export function useRoles(params: MaybeRefOrGetter<RolesQueryParams> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['roles', toValue(params)]),
    queryFn: () => getRolesApi(toValue(params)),
  })

  const roles = computed(() => query.data.value?.data.list || [])
  const pagination = computed(() => ({
    page: query.data.value?.data.page || 1,
    limit: query.data.value?.data.limit || 10,
    total: query.data.value?.data.total || 0,
  }))
  const pageCount = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  return {
    ...query,
    roles,
    pagination,
    pageCount,
  }
}
