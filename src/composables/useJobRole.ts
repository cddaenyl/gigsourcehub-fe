import { useQuery } from '@tanstack/vue-query'
import { getSectorsApi, getJobRolesApi } from '@/services/job-role.service'

export function useJobRole() {
  const { data: sectors, isLoading: isLoadingSectors } = useQuery({
    queryKey: ['sectors'],
    queryFn: getSectorsApi
  })

  // We can also provide a helper to fetch roles for a specific sector if needed,
  // but usually for a grouped select we want all roles.
  const { data: allRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['job-roles'],
    queryFn: () => getJobRolesApi()
  })

  return {
    sectors,
    allRoles,
    isLoading: isLoadingSectors || isLoadingRoles
  }
}
