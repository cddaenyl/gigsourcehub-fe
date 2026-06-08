<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidateSearch from '@/components/CandidateSearch.vue'
import CandidateTabs from '@/components/CandidateTabs.vue'
import CandidateTable from '@/components/tables/CandidateTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import CandidateDirectoryFilters from '@/components/CandidateDirectoryFilters.vue'
import { NConfigProvider, NDropdown, NButton, NIcon, useMessage } from 'naive-ui'
import { Download } from '@vicons/tabler'
import { useBookmarkStore } from '@/stores/bookmark.store'
import type { AllCandidates } from '@/models/Table'
import { fetchAiModeStatus } from '@/services/system-setting'
import {
  useAdminCandidateDirectory
} from '@/composables/useAdminCandidateDirectory'
import {
  exportCandidatesApi,
  exportCandidateRecruitmentApi,
  exportCandidateBookmarkedApi,
} from '@/services/user.service'
import {
  exportActiveOnboardingApi,
  exportArchiveOnboardingApi,
} from '@/services/onboarding.service'
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
      // console.log('Recruit candidate:', candidate)
      // TODO: Implement recruit logic
      break
    case 'chat':
      // console.log('Chat with candidate:', candidate)
      // TODO: Implement chat logic
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
