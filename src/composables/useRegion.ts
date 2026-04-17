import { useQuery } from '@tanstack/vue-query'
import { getProvinsi, getKabupaten } from '@/services/region.service'
import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export function useProvinsi() {
    return useQuery({
        queryKey: ['provinsi'],
        queryFn: () => getProvinsi(),
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}

export function useKabupaten(provinsiId: MaybeRefOrGetter<string | null | undefined>) {
    return useQuery({
        queryKey: ['kabupaten', provinsiId],
        queryFn: () => getKabupaten(toValue(provinsiId) as string),
        enabled: () => !!toValue(provinsiId), // Only fetch if we have a valid province ID
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}
