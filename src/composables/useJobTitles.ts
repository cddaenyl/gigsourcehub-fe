import { useQuery } from '@tanstack/vue-query'
import { getJobTitlesApi } from '@/services/job-title.service'
import { computed, type Ref } from 'vue'

export function useJobTitles(params: Ref<any>) {
  const { 
    data, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['job-titles', params],
    queryFn: () => getJobTitlesApi(params.value),
  })

  return {
    jobTitles: computed(() => data.value?.data.list || []),
    pageCount: computed(() => Math.ceil((data.value?.data.total || 0) / (params.value.limit || 10))),
    total: computed(() => data.value?.data.total || 0),
    isLoading,
    refetch,
  }
}
