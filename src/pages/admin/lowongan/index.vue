<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NConfigProvider,
  NButton,
  NIcon,
  NTabs,
  NTab,
  useMessage,
} from 'naive-ui'
import { Plus } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import JobVacancyTable from '@/components/tables/JobVacancyTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import { useJobVacancies } from '@/composables/useJobVacancies'
import { deleteJobVacancyApi } from '@/services/job-vacancy.service'
import type { JobVacancy, JobVacancyStatus } from '@/models/JobVacancy'

const router = useRouter()
const message = useMessage()

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const activeTab = ref<'all' | JobVacancyStatus>('all')

const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  search: searchQuery.value || undefined,
  status: activeTab.value === 'all' ? undefined : activeTab.value,
}))

const { jobVacancies, pageCount, isLoading, refetch } = useJobVacancies(queryParams)

const handleSearch = (val: string) => {
  searchQuery.value = val
  currentPage.value = 1
}

const handleTabChange = (key: string) => {
  activeTab.value = key as 'all' | JobVacancyStatus
  currentPage.value = 1
}

const handleAdd = () => {
  router.push('/admin/lowongan/create')
}

const handleAction = async (action: 'edit' | 'delete', vacancy: JobVacancy) => {
  if (action === 'edit') {
    router.push(`/admin/lowongan/edit/${vacancy.id}`)
  } else if (action === 'delete') {
    if (confirm(`Yakin ingin menghapus lowongan "${vacancy.name}"?`)) {
      try {
        await deleteJobVacancyApi(vacancy.id)
        message.success('Lowongan berhasil dihapus')
        refetch()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal menghapus lowongan'
        message.error(msg)
      }
    }
  }
}

const themeOverride = {
  DataTable: {
    thColor: '#F1F5F9',
    thTextColor: '#64748B',
    thFontWeight: '600',
    tdColor: '#FFFFFF',
    tdColorHover: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  Tabs: {
    tabTextColor: '#64748B',
    tabTextColorActive: '#07229E',
    tabTextColorActiveHover: '#07229E',
  },
}
</script>

<template>
  <AdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-5">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Konten Lowongan</h1>
          <div class="flex items-center gap-3">
            <SearchInput
              :model-value="searchQuery"
              placeholder="Search"
              @update:model-value="handleSearch"
            />
            <n-button type="primary" color="#0014B2" @click="handleAdd">
              <template #icon>
                <n-icon :component="Plus" />
              </template>
              Tambah Lowongan
            </n-button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="bg-white rounded-lg shadow-sm p-2 py-3 space-y-4">
          <!-- Tabs -->
          <n-tabs
            :value="activeTab"
            type="line"
            @update:value="handleTabChange"
          >
            <n-tab name="all">Semua</n-tab>
            <n-tab name="PUBLISHED">Published</n-tab>
            <n-tab name="DRAFT">Draft</n-tab>
            <n-tab name="ARCHIVED">Archive</n-tab>
          </n-tabs>

          <!-- Table -->
          <JobVacancyTable
            :data="jobVacancies"
            :loading="isLoading"
            @action="handleAction"
          />

          <!-- Pagination -->
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
