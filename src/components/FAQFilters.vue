<script setup lang="ts">
import { ref, watch } from 'vue'
import { NDatePicker, NSelect, NInput, NIcon } from 'naive-ui'
import { Calendar, Check, User } from '@vicons/tabler'

const props = defineProps<{
  filters: {
    published_at_range: [number, number] | null
    status: string
    author: string
  }
}>()

const emit = defineEmits(['update:filters', 'clear'])

// Internal date range for picker
const dateRange = ref<[number, number] | null>(props.filters.published_at_range)

// Watch internal date range to emit updates
watch(dateRange, (val) => {
  if (val) {
    emit('update:filters', { ...props.filters, published_at_range: val })
  } else {
    emit('update:filters', { ...props.filters, published_at_range: null })
  }
})

// Sync internal date range if props changes from outside (e.g. on clear)
watch(
  () => props.filters.published_at_range,
  (val) => {
    dateRange.value = val
  }
)

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Rejected', value: 'REJECTED' },
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
          <span class="text-sm font-semibold uppercase tracking-wider text-slate-500">Rentang Tanggal</span>
        </div>
        <n-date-picker
          v-model:value="dateRange"
          type="daterange"
          clearable
          placeholder="Pilih Tanggal"
          class="w-full"
        />
      </div>

      <!-- Status -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="Check" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider text-slate-500">Status</span>
        </div>
        <n-select
          :value="props.filters.status"
          :options="statusOptions"
          placeholder="Semua Status"
          clearable
          @update:value="(val) => emit('update:filters', { ...props.filters, status: val || '' })"
        />
      </div>

      <!-- Author -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-gray-500 mb-1">
          <n-icon :component="User" size="18" />
          <span class="text-sm font-semibold uppercase tracking-wider text-slate-500">Author</span>
        </div>
        <n-input
          :value="props.filters.author"
          placeholder="Cari author..."
          clearable
          @update:value="(val) => emit('update:filters', { ...props.filters, author: val || '' })"
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
