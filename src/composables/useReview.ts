import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import {
  getReviewQuestionsApi,
  createReviewApi,
  getReviewDetailApi,
} from '@/services/review.service'
import type { ReviewCreatePayload } from '@/models/Review'

export function useReviewQuestions() {
  const query = useQuery({
    queryKey: ['review-questions'],
    queryFn: getReviewQuestionsApi,
  })

  const questions = computed(() => query.data.value?.data || [])

  return {
    ...query,
    questions,
  }
}

export function useReviewDetail(id: MaybeRefOrGetter<string>) {
  const query = useQuery({
    queryKey: computed(() => ['review-detail', toValue(id)]),
    queryFn: () => getReviewDetailApi(toValue(id)),
    enabled: computed(() => !!toValue(id)),
  })

  const review = computed(() => query.data.value?.data)

  return {
    ...query,
    review,
  }
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReviewCreatePayload) => createReviewApi(payload),
    onSuccess: () => {
      // Invalidate onboarding query to refresh status
      queryClient.invalidateQueries({ queryKey: ['onboarding-history'] })
      queryClient.invalidateQueries({ queryKey: ['onboarding-history-list'] })
      queryClient.invalidateQueries({ queryKey: ['onboarding-active-team'] })
    },
  })
}
