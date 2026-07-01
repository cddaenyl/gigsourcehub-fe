<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTableStateStore } from '@/stores/table-state.store'
import { NConfigProvider, NTabPane, NTabs } from 'naive-ui'
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import OnboardingTeamTable from '@/components/tables/OnboardingTeamTable.vue'
import { useActiveTeamOnboarding, useOnboardingHistoryList } from '@/composables/useOnboarding'
import type { OnboardingSnapshot, OnboardingTeamRow } from '@/models/Onboarding'

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

const router = useRouter()

const tableStateStore = useTableStateStore()
const { employeeMyTeam } = storeToRefs(tableStateStore)

const currentPage = computed({
  get: () => employeeMyTeam.value.page,
  set: (val) => tableStateStore.setEmployeeMyTeam({ page: val }),
})
const pageSize = computed({
  get: () => employeeMyTeam.value.pageSize,
  set: (val) => tableStateStore.setEmployeeMyTeam({ pageSize: val }),
})
const activeTab = computed({
  get: () => employeeMyTeam.value.tab,
  set: (val: any) => tableStateStore.setEmployeeMyTeam({ tab: val }),
})
const searchQuery = computed({
  get: () => employeeMyTeam.value.search,
  set: (val) => tableStateStore.setEmployeeMyTeam({ search: val }),
})
const searchValue = ref(employeeMyTeam.value.search)

const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  search: searchQuery.value || undefined,
}))

const activeEnabled = computed(() => activeTab.value === 'aktif')
const historyEnabled = computed(() => activeTab.value === 'history')

const activeTeamQuery = useActiveTeamOnboarding(queryParams, activeEnabled)
const historyQuery = useOnboardingHistoryList(queryParams, historyEnabled)

const onboardingItems = computed(() =>
  activeTab.value === 'aktif' ? activeTeamQuery.items.value : historyQuery.items.value,
)

const isLoading = computed(() =>
  activeTab.value === 'aktif' ? activeTeamQuery.isLoading.value : historyQuery.isLoading.value,
)

const pageCount = computed(() =>
  activeTab.value === 'aktif' ? activeTeamQuery.pageCount.value : historyQuery.pageCount.value,
)

const parseSnapshot = (value: string | null | undefined): OnboardingSnapshot | null => {
  if (!value) return null
  try {
    return JSON.parse(value) as OnboardingSnapshot
  } catch {
    return null
  }
}

const formatDate = (value: string | null | undefined): string => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const tableData = computed<OnboardingTeamRow[]>(() =>
  onboardingItems.value.map((item, index) => {
    const snapshot = parseSnapshot(item.snapshot)
    return {
      id: item.id,
      no: (currentPage.value - 1) * pageSize.value + index + 1,
      nama: item.candidate_user?.name || '-',
      posisi: snapshot?.job_role_name || '-',
      project: snapshot?.project_name || '-',
      kontrakMulai: formatDate(item.start_date),
      kontrakBerakhir: formatDate(item.end_date),
      candidateUserId: item.candidate_user_id,
    }
  }),
)

const handleSearch = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
}

const handleAction = (action: string, row: OnboardingTeamRow) => {
  if (action === 'view') {
    router.push(`/employee/candidate-list/${row.candidateUserId}`)
  }
}

watch(activeTab, () => {
  currentPage.value = 1
})
</script>

<template>
  <EmployeeLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-700">My Team</h1>
          </div>
          <div>
            <SearchInput v-model="searchValue" placeholder="Cari kandidat" @search="handleSearch" />
          </div>
        </div>

        <div class="rounded-lg p-2 py-3 space-y-4">
          <n-tabs v-model:value="activeTab" type="line">
            <n-tab-pane name="aktif" tab="Aktif" />
            <n-tab-pane name="history" tab="History" />
          </n-tabs>

          <OnboardingTeamTable
            :data="tableData"
            :loading="isLoading"
            @action="handleAction"
          />

          <CandidatePagination
            v-model:page="currentPage"
            v-model:page-size="pageSize"
            :page-count="pageCount"
          />
        </div>
      </div>
    </n-config-provider>
  </EmployeeLayout>
</template>
