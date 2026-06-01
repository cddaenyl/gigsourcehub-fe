import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { uploadCV, getParsedCV, confirmCV, getCVDownloadLinkApi } from '@/services/cv.service'

export function useUploadCV() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, skipParsing }: { file: File; skipParsing?: boolean }) => uploadCV(file, skipParsing),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parsedCV'] })
    }
  })
}

export function useParsedCV() {
    return useQuery({
        queryKey: ['parsedCV'],
        queryFn: () => getParsedCV(),
        retry: false,
        refetchInterval: (query) => {
            // Refetch every 2s if CV exists but parsed_data is not yet available
            const data = query.state.data as any;
            if (data?.data && (data.data.status === 'UPLOADED' || data.data.status === 'PARSING') && data.data.parsed_data === null) {
                return 2000;
            }
            return false;
        }
    })
}

export function useConfirmCV() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (editedData: Record<string, any>) => confirmCV(editedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parsedCV'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}

export function useCVDownloadLink() {
    return useQuery({
        queryKey: ['cvDownloadLink'],
        queryFn: () => getCVDownloadLinkApi(),
        enabled: true,
        staleTime: 1000 * 60 * 50 // 50 minutes (presigned link lasts 1 hour)
    })
}
