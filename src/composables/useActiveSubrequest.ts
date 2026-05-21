import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { getActiveSubrequestApi } from '@/services/user.service'

export function useActiveSubrequest(id: MaybeRefOrGetter<string>) {
  const query = useQuery({
    queryKey: computed(() => ['active-subrequest', toValue(id)]),
    queryFn: () => getActiveSubrequestApi(toValue(id)),
    enabled: computed(() => !!toValue(id)),
  })

  const activeSubrequest = computed(() => query.data.value?.data ?? null)

  return {
    ...query,
    activeSubrequest,
  }
}