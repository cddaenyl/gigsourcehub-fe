import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { getProfileApi, uploadProfilePictureApi, updateProfileApi, changePasswordApi, deleteAccountApi } from '@/services/user.service'
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
            queryClient.invalidateQueries({ queryKey: ['authMe'] })
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
        }
    })

    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => updateProfileApi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            queryClient.invalidateQueries({ queryKey: ['authMe'] })
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
        }
    })

    const changePasswordMutation = useMutation({
        mutationFn: (data: any) => changePasswordApi(data),
    })

    const deleteAccountMutation = useMutation({
        mutationFn: (data: { password: string }) => deleteAccountApi(data),
    })

    const profile = computed(() => query.data.value?.data)

    return {
        ...query,
        profile,
        uploadPicture: uploadPictureMutation.mutate,
        uploadPictureAsync: uploadPictureMutation.mutateAsync,
        isUploadingPicture: uploadPictureMutation.isPending,
        updateProfile: updateProfileMutation.mutate,
        updateProfileAsync: updateProfileMutation.mutateAsync,
        isUpdatingProfile: updateProfileMutation.isPending,
        changePassword: changePasswordMutation.mutate,
        changePasswordAsync: changePasswordMutation.mutateAsync,
        isChangingPassword: changePasswordMutation.isPending,
        deleteAccount: deleteAccountMutation.mutate,
        deleteAccountAsync: deleteAccountMutation.mutateAsync,
        isDeletingAccount: deleteAccountMutation.isPending
    }
}
