<script setup lang="ts">
import { ref, watch } from 'vue'
import { 
  NSpace, 
  NDatePicker, 
  NSelect, 
  NText, 
  NButton,
  NIcon
} from 'naive-ui'
import { Calendar, User, Shield, Box, Activity, Check } from '@vicons/tabler'

const props = defineProps<{
  filters: {
    start_date: number | null
    end_date: number | null
    role: string | null
    module: string | null
    action: string | null
    status: string | null
  }
}>()

const emit = defineEmits(['update:filters', 'clear'])

// Internal date range for picker
const dateRange = ref<[number, number] | null>(null)

// Sync internal date range with props
watch(dateRange, (val) => {
  if (val) {
    emit('update:filters', { ...props.filters, start_date: val[0], end_date: val[1] })
  } else {
    emit('update:filters', { ...props.filters, start_date: null, end_date: null })
  }
})

// Options
const roleOptions = [
  { label: 'Superadmin', value: 'Superadmin' },
  { label: 'Admin (HR)', value: 'Admin' },
  { label: 'Employee', value: 'Employee' },
  { label: 'Candidate', value: 'Candidate' }
]

const moduleOptions = [
  { label: 'Auth', value: 'Auth' },
  { label: 'User Management', value: 'User Management' },
  { label: 'Job Title', value: 'Job Title' },
  { label: 'Job Role', value: 'Job Role' },
  { label: 'Sector', value: 'Sector' },
  { label: 'Recruitment Status', value: 'Recruitment Status' },
  { label: 'Candidate', value: 'Candidate' },
  { label: 'Request', value: 'Request' },
  { label: 'Chat', value: 'Chat' }
]

const actionOptions = [
  { label: 'Login', value: 'Login' },
  { label: 'Create', value: 'Create' },
  { label: 'Update', value: 'Update' },
  { label: 'Delete', value: 'Delete' },
  { label: 'Assign', value: 'Assign' },
  { label: 'Block', value: 'Block' },
  { label: 'Activate', value: 'Activate' }
]

const statusOptions = [
  { label: 'Success', value: 'success' },
  { label: 'Failed', value: 'failed' }
]

const handleClear = () => {
  dateRange.value = null
  emit('clear')
}
</script>

<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-6">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-lg font-bold text-gray-800">Filters</h2>
      <button 
        class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        @click="handleClear"
      >
        Clear All
      </button>
    </div>

    <div class="space-y-6">
      <!-- Date Range -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Calendar" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Rentang Tanggal</span>
        </div>
        <n-date-picker
          v-model:value="dateRange"
          type="daterange"
          clearable
          placeholder="Pilih Tanggal"
          class="w-full"
        />
      </div>

      <!-- Role -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Shield" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Role</span>
        </div>
        <n-select
          :value="filters.role"
          :options="roleOptions"
          placeholder="Semua Role"
          clearable
          @update:value="(val) => emit('update:filters', { ...filters, role: val })"
        />
      </div>

      <!-- Module -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Box" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Module</span>
        </div>
        <n-select
          :value="filters.module"
          :options="moduleOptions"
          placeholder="Semua Module"
          clearable
          @update:value="(val) => emit('update:filters', { ...filters, module: val })"
        />
      </div>

      <!-- Action Type -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Activity" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Jenis Aksi</span>
        </div>
        <n-select
          :value="filters.action"
          :options="actionOptions"
          placeholder="Semua Aksi"
          clearable
          @update:value="(val) => emit('update:filters', { ...filters, action: val })"
        />
      </div>

      <!-- Status -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Check" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Status</span>
        </div>
        <n-select
          :value="filters.status"
          :options="statusOptions"
          placeholder="Semua Status"
          clearable
          @update:value="(val) => emit('update:filters', { ...filters, status: val })"
        />
      </div>
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
