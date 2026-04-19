import { useQuery } from '@tanstack/vue-query'
import { getJobRolesPaginatedApi } from '@/services/job-role.service'
import { computed, type Ref } from 'vue'

export function useJobRoles(params: Ref<any>) {
  const { 
    data, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['job-roles', params],
    queryFn: () => getJobRolesPaginatedApi(params.value),
  })

  return {
    jobRoles: computed(() => data.value?.data.list || []),
    pageCount: computed(() => Math.ceil((data.value?.data.total || 0) / (params.value.limit || 10))),
    total: computed(() => data.value?.data.total || 0),
    isLoading,
    refetch,
  }
}
