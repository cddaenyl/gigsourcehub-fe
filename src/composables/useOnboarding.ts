import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import {
  getActiveTeamOnboardingApi,
  getOnboardingHistoryApi,
  getOnboardingHistoryByCandidateApi,
} from '@/services/onboarding.service'
import type { OnboardingQueryParams } from '@/models/Onboarding'

export function useCandidateOnboardingHistory(id: MaybeRefOrGetter<string>) {
  const query = useQuery({
    queryKey: computed(() => ['onboarding-history', toValue(id)]),
    queryFn: () => getOnboardingHistoryByCandidateApi(toValue(id)),
    enabled: computed(() => !!toValue(id)),
  })

  const history = computed(() => query.data.value?.data.list || [])
  const pagination = computed(() => ({
    page: query.data.value?.data.page || 1,
    limit: query.data.value?.data.limit || 10,
    total: query.data.value?.data.total || 0,
  }))
  const pageCount = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  return {
    ...query,
    history,
    pagination,
    pageCount,
  }
}

export function useActiveTeamOnboarding(
  params: MaybeRefOrGetter<OnboardingQueryParams> = {},
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  const query = useQuery({
    queryKey: computed(() => ['onboarding-active-team', toValue(params)]),
    queryFn: () => getActiveTeamOnboardingApi(toValue(params)),
    enabled: computed(() => toValue(enabled)),
  })

  const items = computed(() => query.data.value?.data.list || [])
  const pagination = computed(() => ({
    page: query.data.value?.data.page || 1,
    limit: query.data.value?.data.limit || 10,
    total: query.data.value?.data.total || 0,
  }))
  const pageCount = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  return {
    ...query,
    items,
    pagination,
    pageCount,
  }
}

export function useOnboardingHistoryList(
  params: MaybeRefOrGetter<OnboardingQueryParams> = {},
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  const query = useQuery({
    queryKey: computed(() => ['onboarding-history-list', toValue(params)]),
    queryFn: () => getOnboardingHistoryApi(toValue(params)),
    enabled: computed(() => toValue(enabled)),
  })

  const items = computed(() => query.data.value?.data.list || [])
  const pagination = computed(() => ({
    page: query.data.value?.data.page || 1,
    limit: query.data.value?.data.limit || 10,
    total: query.data.value?.data.total || 0,
  }))
  const pageCount = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  return {
    ...query,
    items,
    pagination,
    pageCount,
  }
}
