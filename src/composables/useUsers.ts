import { useQuery } from '@tanstack/vue-query'
import { getUsersApi } from '@/services/user.service'
import type { UsersQueryParams } from '@/models/User'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useUsers(params: MaybeRefOrGetter<UsersQueryParams> = {}) {
  const query = useQuery({
    queryKey: computed(() => ['users', toValue(params)]),
    queryFn: () => getUsersApi(toValue(params)),
  })

  const users = computed(() => query.data.value?.data.list || [])
  const pagination = computed(() => ({
    page: query.data.value?.data.page || 1,
    limit: query.data.value?.data.limit || 10,
    total: query.data.value?.data.total || 0,
  }))
  const pageCount = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  return {
    ...query,
    users,
    pagination,
    pageCount,
  }
}
