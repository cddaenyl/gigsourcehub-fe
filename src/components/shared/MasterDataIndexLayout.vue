<script setup lang="ts">
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import { NConfigProvider, NButton, NIcon } from 'naive-ui'
import { Plus } from '@vicons/tabler'

interface Props {
  title: string
  addButtonText?: string
  searchPlaceholder?: string
  searchQuery?: string
  showAddButton?: boolean
}

withDefaults(defineProps<Props>(), {
  addButtonText: 'Tambah Data',
  searchPlaceholder: 'Search',
  searchQuery: '',
  showAddButton: true
})

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'search': [value: string]
  'add': []
}>()

const handleSearch = (val: string) => {
  emit('update:searchQuery', val)
  emit('search', val)
}

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
</script>

<template>
  <SuperAdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <!-- Top Section -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">{{ title }}</h1>
          <div class="flex items-center gap-3">
            <slot name="top-actions-before" />
            
            <SearchInput 
              :model-value="searchQuery" 
              :placeholder="searchPlaceholder" 
              @update:model-value="handleSearch"
            />
            
            <n-button 
              v-if="showAddButton"
              type="primary" 
              color="#0014B2" 
              @click="emit('add')"
            >
              <template #icon>
                <n-icon :component="Plus" />
              </template>
              {{ addButtonText }}
            </n-button>

            <slot name="top-actions-after" />
          </div>
        </div>

        <!-- Main Content -->
        <div class="rounded-lg p-2 py-3 space-y-4">
          <!-- Tabs/Filters Slot -->
          <slot name="tabs" />

          <!-- Table Slot -->
          <slot name="table" />

          <!-- Pagination Slot -->
          <slot name="pagination" />
        </div>
      </div>
    </n-config-provider>
  </SuperAdminLayout>
</template>

<style scoped>
/* Ensure the content area feels like the previous one */
</style>
