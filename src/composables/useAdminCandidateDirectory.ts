import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import type { UsersQueryParams, PaginatedListResponse, CandidateDirectoryUser } from '@/models/User'
import type {
  OnboardingItem,
  OnboardingSnapshot,
  OnboardingListResponse,
} from '@/models/Onboarding'
import type { AllCandidates } from '@/models/Table'
import {
  getUsersApi,
  getCandidateRecruitmentApi,
  getCandidateBookmarkedApi,
} from '@/services/user.service'
import { getActiveOnboardingApi, getArchiveOnboardingApi } from '@/services/onboarding.service'

export type AdminCandidateTab = 'semua' | 'rekrutmen' | 'onboarding' | 'archive' | 'disimpan'

type AdminCandidateResponse = PaginatedListResponse<CandidateDirectoryUser> | OnboardingListResponse

const parseSnapshot = (value: string | null | undefined): OnboardingSnapshot | null => {
  if (!value) return null
  try {
    return JSON.parse(value) as OnboardingSnapshot
  } catch {
    return null
  }
}

const formatRowNumber = (page: number, limit: number, index: number) =>
  (page - 1) * limit + index + 1

const mapUserRow = (user: CandidateDirectoryUser, no: number): AllCandidates => ({
  id: user.id,
  no,
  nama: user.name,
  bidang: user.bidang || '-',
  appliedRole: user.job_roles?.map((role) => role.name) || [],
  level: user.candidate_level || 'Un-Reviewed',
  status: user.recruitment_status_name || 'Un-Reviewed',
  statusHexCode: user.recruitment_status_hex_code || null,
  recruitmentStatusId: user.recruitment_status_id,
  unavailableUntil: user.unavailable_until,
  jobRoleName: user.job_role_name || '-',
  projectName: user.project_name || '-',
  is_bookmark: user.is_bookmark,
})

const mapOnboardingRow = (item: OnboardingItem, no: number): AllCandidates => {
  const snapshot = parseSnapshot(item.snapshot)
  const candidate = item.candidate_user

  return {
    id: item.id,
    candidate_id: candidate?.id || '',
    no,
    nama: candidate?.name || '-',
    bidang: candidate?.bidang || '-',
    appliedRole: [],
    level: candidate?.candidate_level || 'Un-Reviewed',
    status: candidate?.recruitment_status_name || 'Accepted',
    statusHexCode: candidate?.recruitment_status_hex_code || null,
    recruitmentStatusId: candidate?.recruitment_status_id,
    unavailableUntil: candidate?.unavailable_until || null,
    jobRoleName: item.job_role_name || snapshot?.job_role_name || '-',
    projectName: item.project_name || snapshot?.project_name || '-',
    contractStart: item.start_date,
    contractEnd: item.end_date,
  }
}

export function useAdminCandidateDirectory(
  params: MaybeRefOrGetter<UsersQueryParams>,
  activeTab: MaybeRefOrGetter<AdminCandidateTab>,
) {
  const query = useQuery({
    queryKey: computed(() => ['admin-candidate-directory', toValue(activeTab), toValue(params)]),
    queryFn: async (): Promise<AdminCandidateResponse> => {
      const currentTab = toValue(activeTab)
      const currentParams = toValue(params)

      switch (currentTab) {
        case 'rekrutmen':
          return getCandidateRecruitmentApi(currentParams)
        case 'disimpan':
          return getCandidateBookmarkedApi(currentParams)
        case 'onboarding':
          return getActiveOnboardingApi(currentParams)
        case 'archive':
          return getArchiveOnboardingApi(currentParams)
        case 'semua':
        default:
          return getUsersApi(currentParams)
      }
    },
  })

  const rows = computed<AllCandidates[]>(() => {
    const currentTab = toValue(activeTab)
    const response = query.data.value
    if (!response) return []

    const page = response.data.page || 1
    const limit = response.data.limit || 10
    const list = response.data.list ?? []

    if (currentTab === 'onboarding' || currentTab === 'archive') {
      return list.map((item, index) =>
        mapOnboardingRow(item as OnboardingItem, formatRowNumber(page, limit, index)),
      )
    }

    return list.map((user, index) =>
      mapUserRow(user as CandidateDirectoryUser, formatRowNumber(page, limit, index)),
    )
  })

  const pagination = computed(() => {
    const response = query.data.value
    return {
      page: response?.data.page || 1,
      limit: response?.data.limit || 10,
      total: response?.data.total || 0,
    }
  })

  const pageCount = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

  return {
    ...query,
    rows,
    pagination,
    pageCount,
  }
}
