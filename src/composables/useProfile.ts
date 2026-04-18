import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { getProfileApi, uploadProfilePictureApi, updateProfileApi } from '@/services/user.service'
import { computed } from 'vue'

export function useProfile() {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['profile'],
        queryFn: () => getProfileApi(),
        retry: false
    })

    const uploadPictureMutation = useMutation({
        mutationFn: (file: File) => uploadProfilePictureApi(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            // Also invalidate auth me to update header
            queryClient.invalidateQueries({ queryKey: ['authMe'] })
        }
    })

    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => updateProfileApi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            queryClient.invalidateQueries({ queryKey: ['authMe'] })
        }
    })

    const profile = computed(() => query.data.value?.data)

    return {
        ...query,
        profile,
        uploadPicture: uploadPictureMutation.mutate,
        isUploadingPicture: uploadPictureMutation.isPending,
        updateProfile: updateProfileMutation.mutate,
        isUpdatingProfile: updateProfileMutation.isPending
    }
}
