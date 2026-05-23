import { useQuery } from '@tanstack/vue-query'
import { getCompanyProfileApi } from '@/services/company-profile.service'
import { computed } from 'vue'

export function useCompanyProfile() {
  const query = useQuery({
    queryKey: ['company-profile'],
    queryFn: () => getCompanyProfileApi(),
  })

  const profile = computed(() => query.data.value?.data)

  return {
    ...query,
    profile,
  }
}
