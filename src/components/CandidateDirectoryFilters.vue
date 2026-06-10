<script setup lang="ts">
import type { AdminCandidateTab } from '@/composables/useAdminCandidateDirectory'
import { useJobRole } from '@/composables/useJobRole'
import { Briefcase, Hierarchy, Download } from '@vicons/tabler'
import { NIcon, NSelect, NDropdown, NButton } from 'naive-ui'
import { computed } from 'vue'
import SearchInput from './shared/SearchInput.vue'

const props = defineProps<{
  filters: {
    bidang?: string
    job_roles?: string
    candidate_level?: string
    job_role_name?: string
    project_name?: string
    employee_user?: string
  }
  activeTab: AdminCandidateTab
}>()

const emit = defineEmits(['update:filters', 'clear', 'export'])

const candidateLevelOptions = [
  { label: 'Semua Level', value: '' },
  { label: 'Junior', value: 'Junior' },
  { label: 'Middle', value: 'Middle' },
  { label: 'Senior', value: 'Senior' },
]

const { allRoles } = useJobRole()

// const bidangOptions = computed(() => {
//   if (!sectors.value) return []
//   return sectors.value.map((s) => ({
//     label: s.name,
//     value: s.name,
//   }))
// })

const jobRolesOptions = computed(() => {
  if (!allRoles.value) return []
  return allRoles.value.map((r) => ({
    label: r.name,
    value: r.name,
  }))
})

const exportOptions = [
  { label: 'Export to PDF (.pdf)', key: 'pdf' },
  { label: 'Export to Excel (.xlsx)', key: 'xlsx' },
  { label: 'Export to CSV (.csv)', key: 'csv' },
]

const handleExportSelect = (formatType: string) => {
  emit('export', formatType)
}

// const showBidang = computed(() => ['semua', 'disimpan'].includes(props.activeTab))
const showJobRoles = computed(() => ['semua', 'disimpan'].includes(props.activeTab))
const showCandidateLevel = computed(() =>
  ['semua', 'disimpan', 'rekrutmen'].includes(props.activeTab),
)
const showJobRoleName = computed(() =>
  ['rekrutmen', 'onboarding', 'archive'].includes(props.activeTab),
)
const showProjectName = computed(() =>
  ['rekrutmen', 'onboarding', 'archive'].includes(props.activeTab),
)
// const showEmployeeUser = computed(() => ['onboarding', 'archive'].includes(props.activeTab))

const updateFilter = (key: string, value: string | null | undefined) => {
  emit('update:filters', { ...props.filters, [key]: value || undefined })
}

const handleClear = () => {
  emit('clear')
}
</script>

<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-6">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-lg font-bold text-gray-800">Filters</h2>
      <button class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors" @click="handleClear">
        Clear All
      </button>
    </div>

    <div class="space-y-6">
      <!-- Bidang -->
      <!-- <div v-if="showBidang" class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Filter" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Bidang</span>
        </div>
        <n-select
          :value="filters.bidang"
          :options="bidangOptions"
          placeholder="Semua Bidang"
          clearable
          filterable
          @update:value="(val) => updateFilter('bidang', val)"
        />
      </div> -->

      <!-- Job Roles -->
      <div v-if="showJobRoles" class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Briefcase" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Job Roles</span>
        </div>
        <n-select :value="filters.job_roles" :options="jobRolesOptions" placeholder="Semua Role" clearable filterable
          @update:value="(val) => updateFilter('job_roles', val)" />
      </div>

      <!-- Candidate Level -->
      <div v-if="showCandidateLevel" class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Hierarchy" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Level Kandidat</span>
        </div>
        <n-select :value="filters.candidate_level" :options="candidateLevelOptions" placeholder="Semua Level" clearable
          @update:value="(val) => updateFilter('candidate_level', val)" />
      </div>

      <!-- Job Role Name -->
      <div v-if="showJobRoleName" class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Briefcase" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Nama Role</span>
        </div>
        <n-select :value="filters.job_role_name" :options="jobRolesOptions" placeholder="Semua Role" clearable
          filterable @update:value="(val) => updateFilter('job_role_name', val)" />
      </div>

      <!-- Project Name -->
      <div v-if="showProjectName" class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Briefcase" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Nama Project</span>
        </div>
        <SearchInput :model-value="filters.project_name" placeholder="Cari nama project..." class="!w-full"
          @update:model-value="(val) => updateFilter('project_name', val)" />
      </div>

      <!-- Employee User -->
      <!-- <div v-if="showEmployeeUser" class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Users" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Karyawan Terkait</span>
        </div>
        <SearchInput :model-value="filters.employee_user" placeholder="Cari nama karyawan..." class="!w-full"
          @update:model-value="(val) => updateFilter('employee_user', val)" />
      </div> -->
    </div>

    <!-- Export Dropdown -->
    <div class="mt-6 pt-6 border-t border-gray-100 flex justify-center">
      <n-dropdown trigger="click" :options="exportOptions" @select="handleExportSelect">
        <n-button type="primary" color="#0014B2" class="w-full">
          <template #icon>
            <n-icon :component="Download" />
          </template>
          Export
        </n-button>
      </n-dropdown>
    </div>
  </div>
</template>

<style scoped>
:deep(.n-base-selection) {
  --n-border-radius: 8px !important;
}

:deep(.n-input) {
  --n-border-radius: 8px !important;
}
</style>
