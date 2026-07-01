<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NConfigProvider,
  NButton,
  NIcon,
  NTabs,
  NTab,
  useMessage,
} from 'naive-ui'
import { Plus, Filter } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import JobVacancyTable from '@/components/tables/JobVacancyTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import JobVacancyFilters from '@/components/JobVacancyFilters.vue'
import { useJobVacancies } from '@/composables/useJobVacancies'
import { deleteJobVacancyApi, archiveJobVacancyApi } from '@/services/job-vacancy.service'
import type { JobVacancy, JobVacancyStatus } from '@/models/JobVacancy'

const router = useRouter()
const message = useMessage()

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const activeTab = ref<'all' | JobVacancyStatus>('all')

const showFilters = ref(false)

const filters = ref({
  published_at_range: null as [number, number] | null,
  sort: 'desc' as 'asc' | 'desc',
})

watch(
  filters,
  () => {
    currentPage.value = 1
  },
  { deep: true }
)

const queryParams = computed(() => {
  const params: Record<string, unknown> = {
    page: currentPage.value,
    limit: pageSize.value,
    search: searchQuery.value || undefined,
    status: activeTab.value === 'all' ? undefined : activeTab.value,
    sort: filters.value.sort,
  }
  if (filters.value.published_at_range) {
    const [from, to] = filters.value.published_at_range
    params.published_at_from = new Date(from).toISOString().substring(0, 10)
    params.published_at_to = new Date(to).toISOString().substring(0, 10)
  }
  return params
})

const { jobVacancies, pageCount, isLoading, refetch } = useJobVacancies(queryParams)

const handleSearch = (val: string) => {
  searchQuery.value = val
  currentPage.value = 1
}

const handleTabChange = (key: string) => {
  activeTab.value = key as 'all' | JobVacancyStatus
  currentPage.value = 1
}

const handleClearFilters = () => {
  filters.value = {
    published_at_range: null,
    sort: 'desc',
  }
}

const handleAdd = () => {
  router.push('/admin/lowongan/create')
}

const handleAction = async (action: 'view' | 'edit' | 'delete' | 'archive', vacancy: JobVacancy) => {
  if (action === 'view') {
    router.push(`/admin/lowongan/view/${vacancy.id}`)
  } else if (action === 'edit') {
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
  } else if (action === 'archive') {
    if (confirm(`Yakin ingin mengarsipkan lowongan "${vacancy.name}"?`)) {
      try {
        await archiveJobVacancyApi(vacancy.id)
        message.success('Lowongan berhasil diarsipkan')
        refetch()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal mengarsipkan lowongan'
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
          <div>
            <h1 class="text-2xl font-bold text-gray-700">Konten Lowongan</h1>
          </div>
          <div class="flex items-center gap-2">
            <n-button 
              :secondary="!showFilters" 
              :type="showFilters ? 'primary' : 'default'"
              :color="showFilters ? '#0014B2' : undefined"
              @click="showFilters = !showFilters"
            >
              <template #icon>
                <n-icon :component="Filter" />
              </template>
              Filter
            </n-button>
            <n-button type="primary" color="#0014B2" @click="handleAdd">
              <template #icon>
                <n-icon :component="Plus" />
              </template>
              Tambah Lowongan
            </n-button>
          </div>
        </div>

        <div class="flex gap-6 items-start relative">
          <!-- Filter Sidebar - Only shown if toggled -->
          <transition name="slide-fade">
            <div v-if="showFilters" class="w-72 shrink-0 sticky top-6">
              <JobVacancyFilters v-model:filters="filters" @clear="handleClearFilters" />
            </div>
          </transition>

          <!-- Content Area -->
          <div class="flex-1 min-w-0 bg-white rounded-lg shadow-sm p-6 space-y-4 border border-gray-100">
            <!-- Search bar & Tabs row -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-2">
              <n-tabs
                :value="activeTab"
                type="line"
                @update:value="handleTabChange"
                class="flex-1"
              >
                <n-tab name="all">Semua</n-tab>
                <n-tab name="PUBLISHED">Published</n-tab>
                <n-tab name="DRAFT">Draft</n-tab>
                <n-tab name="ARCHIVED">Archive</n-tab>
              </n-tabs>
              
              <div class="max-w-xs w-full">
                <SearchInput
                  :model-value="searchQuery"
                  placeholder="Search"
                  @update:model-value="handleSearch"
                />
              </div>
            </div>

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

