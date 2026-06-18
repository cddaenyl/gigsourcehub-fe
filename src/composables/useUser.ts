import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  getUserByIdApi,
  updateUserRecruitmentStatusApi,
  cancelRecruitmentApi,
  confirmDeclineConfirmationApi,
  stopOnboardingApi,
  finalizeRecruitmentApi,
} from '@/services/user.service'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { FinalizeRecruitmentPayload, UserRecruitmentStatusPayload, StopOnboardingPayload } from '@/models/User'

export function useUser(id: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: computed(() => ['user', toValue(id)]),
    queryFn: () => getUserByIdApi(toValue(id)),
    enabled: computed(() => !!toValue(id)),
  })

  const updateRecruitmentStatusMutation = useMutation({
    mutationFn: (payload: UserRecruitmentStatusPayload) =>
      updateUserRecruitmentStatusApi(toValue(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', toValue(id)] })
    },
  })

  const cancelRecruitmentMutation = useMutation({
    mutationFn: () => cancelRecruitmentApi(toValue(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', toValue(id)] })
    },
  })

  const confirmDeclineMutation = useMutation({
    mutationFn: () => confirmDeclineConfirmationApi(toValue(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', toValue(id)] })
    },
  })

  const stopOnboardingMutation = useMutation({
    mutationFn: (payload: StopOnboardingPayload) => stopOnboardingApi(toValue(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', toValue(id)] })
      queryClient.invalidateQueries({ queryKey: ['active-subrequest', toValue(id)] })
      queryClient.invalidateQueries({ queryKey: ['onboarding-history', toValue(id)] })
    },
  })

  const finalizeRecruitmentMutation = useMutation({
    mutationFn: (payload: FinalizeRecruitmentPayload) => finalizeRecruitmentApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', toValue(id)] })
      queryClient.invalidateQueries({ queryKey: ['active-subrequest', toValue(id)] })
    },
  })

  const user = computed(() => query.data.value?.data)

  return {
    ...query,
    user,
    updateRecruitmentStatus: updateRecruitmentStatusMutation.mutateAsync,
    isUpdatingRecruitmentStatus: updateRecruitmentStatusMutation.isPending,
    cancelRecruitment: cancelRecruitmentMutation.mutateAsync,
    isCancellingRecruitment: cancelRecruitmentMutation.isPending,
    confirmDecline: confirmDeclineMutation.mutateAsync,
    isConfirmingDecline: confirmDeclineMutation.isPending,
    stopOnboarding: stopOnboardingMutation.mutateAsync,
    isStoppingOnboarding: stopOnboardingMutation.isPending,
    finalizeRecruitment: finalizeRecruitmentMutation.mutateAsync,
    isFinalizingRecruitment: finalizeRecruitmentMutation.isPending,
  }
}
