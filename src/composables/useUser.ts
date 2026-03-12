import { useQuery } from '@tanstack/vue-query'
import { getUserByIdApi } from '@/services/user.service'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useUser(id: MaybeRefOrGetter<string>) {
  const query = useQuery({
    queryKey: computed(() => ['user', toValue(id)]),
    queryFn: () => getUserByIdApi(toValue(id)),
    enabled: computed(() => !!toValue(id)),
  })

  const user = computed(() => query.data.value?.data)

  return {
    ...query,
    user,
  }
}
