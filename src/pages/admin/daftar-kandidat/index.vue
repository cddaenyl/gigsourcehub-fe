<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidateSearch from '@/components/CandidateSearch.vue'
import CandidateTabs from '@/components/CandidateTabs.vue'
import CandidateTable from '@/components/tables/CandidateTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import CandidateDirectoryFilters from '@/components/CandidateDirectoryFilters.vue'
import {
  NConfigProvider,
  NDropdown,
  NButton,
  NIcon,
  NModal,
  NSelect,
  NSpace,
  useMessage,
  type SelectOption,
} from 'naive-ui'
import { Download } from '@vicons/tabler'
import { useBookmarkStore } from '@/stores/bookmark.store'
import type { AllCandidates } from '@/models/Table'
import { fetchAiModeStatus } from '@/services/system-setting'

import { useAdminCandidateDirectory } from '@/composables/useAdminCandidateDirectory'
import { useUser } from '@/composables/useUser'
import {
  exportCandidatesApi,
  exportCandidateRecruitmentApi,
  exportCandidateBookmarkedApi,
} from '@/services/user.service'
import {
  exportActiveOnboardingApi,
  exportArchiveOnboardingApi,
} from '@/services/onboarding.service'
import { useActiveAdminMyRequests, useAssignCandidateToSubrequest } from '@/composables/useRequest'
import { useActiveSubrequest } from '@/composables/useActiveSubrequest'
import { useStartChat } from '@/composables/useChat'
import type { RequestQueryParams } from '@/models/Request'
import { format } from 'date-fns'

const router = useRouter()
const isAiEnabled = ref(true)

onMounted(async () => {
  try {
    const data = await fetchAiModeStatus()
    isAiEnabled.value = data.is_ai_mode_enabled
  } catch (err) {
    console.error('Failed to fetch AI mode status', err)
  }
})

const themeOverride = {
  DataTable: {
    thColor: '#F1F5F9',
    thTextColor: '#64748B',
    thFontWeight: '600',
    tdColor: '#FFFFFF',
    tdColorHover: '#F1F5F9',
    tdColorStriped: '#F8FAFC',
    borderColor: '#F1F5F9',
    thColorHover: '#F8FAFC',
  },
  Tabs: {
    tabColorHover: '#F8FAFC',
    tabColorActive: '#FFFFFF',
    tabColorActiveHover: '#F1F5F9',
    tabTextColor: '#64748B',
    tabTextColorHover: '#64748B',
    tabTextColorActive: '#07229E',
    tabTextColorActiveHover: '#07229E',
  },
}
const chatModalVisible = ref(false)
const recruitModalVisible = ref(false)
const selectedCandidateId = ref<string>('')
const selectedSubrequestId = ref<string | null>(null)
const selectedRequestId = ref<string | null>(null)
const assignedPairKeys = ref<string[]>([])
const myRequestsParams = computed<RequestQueryParams>(() => ({
  page: 1,
  limit: 100,
}))
const { user, refetch: refetchUser } = useUser(selectedCandidateId)
const {
  requests: myRequests,
  isLoading: isMyRequestsLoading,
  refetch: refetchMyRequests,
} = useActiveAdminMyRequests(myRequestsParams)
const { mutateAsync: assignCandidateToSubrequest, isPending: isAssigningCandidate } =
  useAssignCandidateToSubrequest()
const {
  activeSubrequest,
  isLoading: isActiveSubrequestLoading,
  refetch: refetchActiveSubrequest,
} = useActiveSubrequest(selectedCandidateId)
const { mutateAsync: startChat, isPending: isStartingChat } = useStartChat()
const requestOptions = computed<SelectOption[]>(() =>
  myRequests.value.map((request) => ({
    label: request.project_name,
    value: request.id,
  })),
)

const selectedRequest = computed(
  () => myRequests.value.find((request) => request.id === selectedRequestId.value) || null,
)

const subrequestOptions = computed<SelectOption[]>(() => {
  if (!selectedRequest.value) {
    return []
  }

  const totalPerJobRole = new Map<string, number>()
  const seenPerJobRole = new Map<string, number>()

  for (const subrequest of selectedRequest.value.subrequests) {
    totalPerJobRole.set(
      subrequest.job_role_id,
      (totalPerJobRole.get(subrequest.job_role_id) || 0) + 1,
    )
  }

  return selectedRequest.value.subrequests.map((subrequest) => {
    const currentIndex = (seenPerJobRole.get(subrequest.job_role_id) || 0) + 1
    seenPerJobRole.set(subrequest.job_role_id, currentIndex)

    const hasDuplicateJobRole = (totalPerJobRole.get(subrequest.job_role_id) || 0) > 1
    const suffix = hasDuplicateJobRole ? ` #${currentIndex}` : ''

    return {
      label: `${subrequest.job_role}${suffix}`,
      value: subrequest.id,
    }
  })
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Tabs
const activeTab = ref<'semua' | 'rekrutmen' | 'onboarding' | 'archive' | 'disimpan'>('semua')

// Search & Filters
const searchQuery = ref('')
const showFilters = ref(false)
const filters = ref({
  bidang: undefined as string | undefined,
  job_roles: undefined as string | undefined,
  candidate_level: undefined as string | undefined,
  job_role_name: undefined as string | undefined,
  project_name: undefined as string | undefined,
  employee_user: undefined as string | undefined,
})

// Fetch users with query params
const queryParams = computed(() => {
  const baseParams: any = {
    page: currentPage.value,
    limit: pageSize.value,
    search: searchQuery.value || undefined,
  }

  if (activeTab.value !== 'semua') {
    baseParams.tab = activeTab.value
  }

  // Add active filters based on tab
  if (['semua', 'disimpan'].includes(activeTab.value)) {
    if (filters.value.bidang) baseParams.bidang = filters.value.bidang
    if (filters.value.job_roles) baseParams.job_roles = filters.value.job_roles
    if (filters.value.candidate_level) baseParams.candidate_level = filters.value.candidate_level
  } else if (activeTab.value === 'rekrutmen') {
    if (filters.value.job_role_name) baseParams.job_role_name = filters.value.job_role_name
    if (filters.value.project_name) baseParams.project_name = filters.value.project_name
    if (filters.value.candidate_level) baseParams.candidate_level = filters.value.candidate_level
  } else if (['onboarding', 'archive'].includes(activeTab.value)) {
    if (filters.value.job_role_name) baseParams.job_role_name = filters.value.job_role_name
    if (filters.value.project_name) baseParams.project_name = filters.value.project_name
    if (filters.value.employee_user) baseParams.employee_user = filters.value.employee_user
  }

  return baseParams
})

const { rows, pageCount, isLoading } = useAdminCandidateDirectory(queryParams, activeTab)
const bookmarkStore = useBookmarkStore()

// Watch filters and tabs
watch(
  [rows, activeTab],
  ([newRows, tab]) => {
    if (tab === 'onboarding' || tab === 'archive') return
    if (newRows.length > 0) {
      bookmarkStore.initializeBookmarks(newRows)
    }
  },
  { immediate: true },
)

watch(activeTab, () => {
  currentPage.value = 1
})

watch(
  filters,
  () => {
    currentPage.value = 1
  },
  { deep: true },
)

const handleClearFilters = () => {
  filters.value = {
    bidang: undefined,
    job_roles: undefined,
    candidate_level: undefined,
    job_role_name: undefined,
    project_name: undefined,
    employee_user: undefined,
  }
}

// Transform API data to table data format
const tableData = computed<AllCandidates[]>(() => {
  return rows.value
})

const tableVariant = computed(() => {
  switch (activeTab.value) {
    case 'rekrutmen':
      return 'recruitment'
    case 'onboarding':
      return 'onboarding'
    case 'archive':
      return 'archive'
    case 'disimpan':
      return 'bookmarked'
    case 'semua':
    default:
      return 'all'
  }
})

// Handlers
const handleAction = (action: string, candidate: AllCandidates) => {
  switch (action) {
    case 'detail':
      router.push(`/admin/daftar-kandidat/${candidate.id}`)
      break

    case 'view':
      router.push(`/admin/daftar-kandidat/${candidate.candidate_id}`)
      break
    case 'recruit':
      selectedCandidateId.value = candidate.id
      recruitModalVisible.value = true
      break
    case 'chat':
      router.push(`/admin/candidate-chat?conversation_id=${candidate.id}`)
      break

    default:
    // console.log(`Action: ${action}`, candidate)
  }
}

const handleSearch = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
}

// Export logic
const message = useMessage()
const exportOptions = [
  { label: 'Export to PDF (.pdf)', key: 'pdf' },
  { label: 'Export to Excel (.xlsx)', key: 'xlsx' },
  { label: 'Export to CSV (.csv)', key: 'csv' },
]

const handleExportSelect = async (formatType: string) => {
  const exportParams = { ...queryParams.value, format: formatType }
  delete exportParams.page
  delete exportParams.limit

  const msg = message.loading(`Generating ${formatType.toUpperCase()} export...`, { duration: 0 })
  try {
    let blob: Blob
    switch (activeTab.value) {
      case 'rekrutmen':
        blob = await exportCandidateRecruitmentApi(exportParams)
        break
      case 'disimpan':
        blob = await exportCandidateBookmarkedApi(exportParams)
        break
      case 'onboarding':
        blob = await exportActiveOnboardingApi(exportParams)
        break
      case 'archive':
        blob = await exportArchiveOnboardingApi(exportParams)
        break
      case 'semua':
      default:
        blob = await exportCandidatesApi(exportParams)
        break
    }

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss')
    link.setAttribute('download', `daftar_kandidat_${activeTab.value}_${timestamp}.${formatType}`)

    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    message.success('Download started')
  } catch (err: any) {
    message.error(err.message || 'Gagal export data')
  } finally {
    msg.destroy()
  }
}
const buildAssignmentPairKey = (
  candidateId: string,
  requestId: string,
  subrequestId: string,
): string => `${candidateId}:${requestId}:${subrequestId}`

const isDuplicateAssignment = computed((): boolean => {
  if (!user.value?.id || !selectedRequestId.value || !selectedSubrequestId.value) {
    return false
  }

  const pairKey = buildAssignmentPairKey(
    user.value.id,
    selectedRequestId.value,
    selectedSubrequestId.value,
  )

  return assignedPairKeys.value.includes(pairKey)
})

const closeRecruitModal = (): void => {
  recruitModalVisible.value = false
  selectedRequestId.value = null
  selectedSubrequestId.value = null
  selectedCandidateId.value = ''
}
const canSubmitAssignment = computed(
  (): boolean =>
    Boolean(selectedRequestId.value && selectedSubrequestId.value) &&
    !isDuplicateAssignment.value &&
    !isAssigningCandidate.value,
)

const handleAssignCandidate = async (): Promise<void> => {
  if (!user.value?.id || !selectedRequestId.value || !selectedSubrequestId.value) {
    return
  }

  if (isDuplicateAssignment.value) {
    message.warning('Kandidat sudah pernah di-assign ke subrequest ini pada sesi saat ini.')
    return
  }

  try {
    await assignCandidateToSubrequest({
      requestId: selectedRequestId.value,
      subrequestId: selectedSubrequestId.value,
      payload: { candidate_user_id: user.value.id },
    })

    const pairKey = buildAssignmentPairKey(
      user.value.id,
      selectedRequestId.value,
      selectedSubrequestId.value,
    )

    if (!assignedPairKeys.value.includes(pairKey)) {
      assignedPairKeys.value = [...assignedPairKeys.value, pairKey]
    }

    // Close recruit modal and show chat modal
    recruitModalVisible.value = false
    message.success('Kandidat berhasil di-assign ke permintaan.')
    await Promise.all([refetchUser(), refetchMyRequests()])
    chatModalVisible.value = true
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal meng-assign kandidat.'
    message.error(messageText, { duration: 3000 })
  }
}

const closeChatModal = (): void => {
  chatModalVisible.value = false
  selectedCandidateId.value = ''
  void Promise.all([refetchUser(), refetchMyRequests(), refetchActiveSubrequest()])
}

const handleStartChatConfirm = async (): Promise<void> => {
  if (!user.value?.id) {
    return
  }

  const latestActiveSubrequest = await refetchActiveSubrequest()
  const activeSubrequestId =
    latestActiveSubrequest.data?.data?.subrequest_id ?? activeSubrequest.value?.subrequest_id

  if (!activeSubrequestId) {
    message.error('Subrequest aktif belum tersedia. Pastikan kandidat sudah di-assign.', {
      duration: 3000,
    })
    return
  }

  try {
    const result = await startChat({
      candidate_user_id: user.value.id,
      subrequest_id: activeSubrequestId,
    })

    chatModalVisible.value = false
    router.push({ path: '/admin/candidate-chat', query: { conversation_id: result.data.id } })
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal memulai chat dengan kandidat.'
    message.error(messageText, { duration: 3000 })
  }
}
</script>

<template>
  <AdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <!-- Top Section -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-700">Daftar Kandidat</h1>
          </div>
          <div class="flex items-center gap-2">
            <CandidateSearch
              @search="handleSearch"
              @toggle-filter="showFilters = !showFilters"
              :is-ai-enabled="isAiEnabled"
            />

            <n-dropdown trigger="click" :options="exportOptions" @select="handleExportSelect">
              <n-button type="primary" color="#0014B2">
                <template #icon>
                  <n-icon :component="Download" />
                </template>
                Export
              </n-button>
            </n-dropdown>
          </div>
        </div>

        <!-- Main Content Layout -->
        <div class="flex gap-6 items-start relative">
          <!-- Filter Sidebar -->
          <transition name="slide-fade">
            <div v-if="showFilters" class="w-72 shrink-0 sticky top-6">
              <CandidateDirectoryFilters
                v-model:filters="filters"
                :active-tab="activeTab"
                @clear="handleClearFilters"
              />
            </div>
          </transition>

          <!-- Main Content Data -->
          <div class="flex-1 min-w-0 rounded-lg space-y-4">
            <!-- Tabs -->
            <CandidateTabs v-model="activeTab" />

            <!-- Data Table -->
            <CandidateTable :data="tableData" :variant="tableVariant" @action="handleAction" />

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-8">
              <p class="text-gray-500">Loading...</p>
            </div>

            <!-- Table Controls -->
            <CandidatePagination
              v-model:page="currentPage"
              v-model:page-size="pageSize"
              :page-count="pageCount"
            />
          </div>
        </div>
      </div>

      <n-modal
        v-model:show="recruitModalVisible"
        preset="card"
        :bordered="false"
        style="width: 40rem"
      >
        <div class="">
          <div>
            <h2 class="text-lg font-semibold text-gray-800 -mt-8">Assign Kandidat ke Permintaan</h2>
            <p class="text-sm text-slate-500">Tentukan permintaan rekrutmen untuk kandidat ini.</p>
          </div>

          <n-space vertical :size="16" class="my-6">
            <div class="space-y-1">
              <h3 class="text-xs font-semibold text-slate-500">Permintaan</h3>
              <n-select
                v-model:value="selectedRequestId"
                placeholder="Pilih permintaan"
                :options="requestOptions"
                :loading="isMyRequestsLoading"
                filterable
                clearable
              />
            </div>

            <div class="space-y-1">
              <h3 class="text-xs font-semibold text-slate-500">Posisi</h3>
              <n-select
                v-model:value="selectedSubrequestId"
                placeholder="Pilih posisi"
                :options="subrequestOptions"
                :disabled="!selectedRequestId"
                filterable
                clearable
              />
            </div>
          </n-space>

          <div class="-mx-6 -mb-6 bg-slate-100 px-6 py-5">
            <div class="flex justify-center gap-3">
              <n-button secondary @click="closeRecruitModal">Batal</n-button>
              <n-button
                type="primary"
                :loading="isAssigningCandidate"
                :disabled="!canSubmitAssignment"
                @click="handleAssignCandidate"
              >
                Simpan
              </n-button>
            </div>
          </div>
        </div>
      </n-modal>

      <n-modal
        v-model:show="chatModalVisible"
        preset="card"
        :bordered="false"
        :close-on-esc="false"
        :mask-closable="false"
        style="width: 30rem"
      >
        <div class="flex flex-col">
          <div class="flex justify-center items-center">
            <h2 class="text-lg font-semibold text-gray-800 -mt-8">Kandidat Berhasil di-Assign</h2>
          </div>

          <div class="flex flex-col text-center mb-6 rounded-md px-4 py-3 text-sm text-slate-600">
            <p class="text-sm text-slate-600">Kandidat telah dihubungkan ke permintaan</p>
            <p v-if="isActiveSubrequestLoading">Memuat subrequest aktif...</p>
            <div v-else-if="activeSubrequest" class="font-medium text-primary">
              {{ activeSubrequest.project_name }} - {{ activeSubrequest.job_role }} <br />
              <br />
              <h2 class="font-normal text-sm text-slate-600">
                Silahkan hubungi kandidat untuk memulai proses rekrutmen kandidat melalui fitur
                chat.
              </h2>
            </div>
            <p v-else class="text-amber-600">
              Subrequest aktif belum ditemukan untuk kandidat ini.
            </p>
          </div>

          <div class="-mx-6 -mb-6 bg-slate-100 px-6 py-5">
            <div class="flex justify-center gap-3">
              <n-button secondary @click="closeChatModal">Batal</n-button>
              <n-button
                type="primary"
                :loading="isStartingChat || isActiveSubrequestLoading"
                :disabled="!activeSubrequest && !isActiveSubrequestLoading"
                @click="handleStartChatConfirm"
              >
                Mulai Chat
              </n-button>
            </div>
          </div>
        </div>
      </n-modal>
    </n-config-provider>
  </AdminLayout>
</template>

<style scoped>
/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
