<script setup lang="ts">
import { NInput, NSelect, NIcon } from 'naive-ui'
import { User, Activity, AlertCircle } from '@vicons/tabler'

const props = defineProps<{
  filters: {
    status?: string
    urgency?: string
    proposed_by?: string
    admin_name?: string
  }
}>()

const emit = defineEmits(['update:filters', 'clear'])

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Menunggu Validasi (Pending)', value: 'PENDING' },
  { label: 'Disetujui', value: 'ACCEPTED' },
  { label: 'Ditolak', value: 'REJECTED' },
  { label: 'Diproses', value: 'PROCESSING' },
  { label: 'Selesai', value: 'DONE' },
]

const urgencyOptions = [
  { label: 'Semua Urgensi', value: '' },
  { label: 'Rendah (Low)', value: 'LOW' },
  { label: 'Menengah (Middle)', value: 'MIDDLE' },
  { label: 'Tinggi (High)', value: 'HIGH' },
]

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
      <button
        class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        @click="handleClear"
      >
        Clear All
      </button>
    </div>

    <div class="space-y-6">
      <!-- Status -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Activity" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Status</span>
        </div>
        <n-select
          :value="filters.status"
          :options="statusOptions"
          placeholder="Semua Status"
          clearable
          @update:value="(val) => updateFilter('status', val)"
        />
      </div>

      <!-- Urgency -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="AlertCircle" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Tingkat Urgensi</span>
        </div>
        <n-select
          :value="filters.urgency"
          :options="urgencyOptions"
          placeholder="Semua Urgensi"
          clearable
          @update:value="(val) => updateFilter('urgency', val)"
        />
      </div>

      <!-- Proposed By -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="User" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">Diajukan Oleh</span>
        </div>
        <n-input
          :value="filters.proposed_by"
          placeholder="Cari nama pengaju..."
          clearable
          @update:value="(val) => updateFilter('proposed_by', val)"
        />
      </div>

      <!-- Admin Name (PIC HR) -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="User" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider">PIC HR</span>
        </div>
        <n-input
          :value="filters.admin_name"
          placeholder="Cari PIC HR..."
          clearable
          @update:value="(val) => updateFilter('admin_name', val)"
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
