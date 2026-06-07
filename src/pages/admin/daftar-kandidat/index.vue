<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidateSearch from '@/components/CandidateSearch.vue'
import CandidateTabs from '@/components/CandidateTabs.vue'
import CandidateTable from '@/components/tables/CandidateTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import { NConfigProvider } from 'naive-ui'
import { useBookmarkStore } from '@/stores/bookmark.store'
import type { AllCandidates } from '@/models/Table'
import { fetchAiModeStatus } from '@/services/system-setting'
import { useAdminCandidateDirectory } from '@/composables/useAdminCandidateDirectory'

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

// Search
const searchQuery = ref('')

// Fetch users with query params
const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  search: searchQuery.value,
  tab: activeTab.value === 'semua' ? undefined : activeTab.value,
}))

const { rows, pageCount, isLoading } = useAdminCandidateDirectory(queryParams, activeTab)
const bookmarkStore = useBookmarkStore()

// Initialize bookmarks when users data changes
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
</script>

<template>
  <AdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <!-- Top Section -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Daftar Kandidat</h1>
          <CandidateSearch @search="handleSearch" :is-ai-enabled="isAiEnabled" />
        </div>

        <!-- Main Content -->
        <div class="rounded-lg p-2 py-3 space-y-4">
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
    </n-config-provider>
  </AdminLayout>
</template>
