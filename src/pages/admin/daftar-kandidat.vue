<script setup lang="ts">
import { ref, h } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import {
  NInput,
  NButton,
  NTabs,
  NTabPane,
  NDataTable,
  NDropdown,
  NPagination,
  NConfigProvider,
  NSelect,
  NIcon
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { Search, ApiApp, DotsVertical } from '@vicons/tabler'

// Define table data type
interface Candidate {
  no: number
  nama: string
  bidang: string
  appliedRole: string
  level: string
  status: string
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
    thColorHover: '#F8FAFC'
  },
Tabs: {
    tabColorHover: '#F8FAFC',
    tabColorActive: '#FFFFFF',
    tabColorActiveHover: '#F1F5F9',
    tabTextColor: '#64748B',
    tabTextColorHover: '#64748B',
    tabTextColorActive: '#07229E',
    tabTextColorActiveHover: '#07229E'
  }
}
// Sample data
const tableData = ref<Candidate[]>([
  {
    no: 1,
    nama: 'John Doe',
    bidang: 'IT',
    appliedRole: 'Frontend Developer',
    level: 'Senior',
    status: 'Aktif'
  },
  {
    no: 2,
    nama: 'Jane Smith',
    bidang: 'IT',
    appliedRole: 'Backend Developer',
    level: 'Mid',
    status: 'Interview'
  },
  {
    no: 3,
    nama: 'Bob Wilson',
    bidang: 'Design',
    appliedRole: 'UI/UX Designer',
    level: 'Junior',
    status: 'On-Boarding'
  },
  {
    no: 3,
    nama: 'Bob Wilson',
    bidang: 'Design',
    appliedRole: 'UI/UX Designer',
    level: 'Junior',
    status: 'On-Boarding'
  },
  {
    no: 3,
    nama: 'Bob Wilson',
    bidang: 'Design',
    appliedRole: 'UI/UX Designer',
    level: 'Junior',
    status: 'On-Boarding'
  },
  {
    no: 3,
    nama: 'Bob Wilson',
    bidang: 'Design',
    appliedRole: 'UI/UX Designer',
    level: 'Junior',
    status: 'On-Boarding'
  },
  {
    no: 3,
    nama: 'Bob Wilson',
    bidang: 'Design',
    appliedRole: 'UI/UX Designer',
    level: 'Junior',
    status: 'On-Boarding'
  }
])

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizeOptions = ref([
  { label: '10 / page', value: 10 },
  { label: '20 / page', value: 20 },
  { label: '50 / page', value: 50 }
])

// Search
const searchValue = ref('')

// Tabs
const activeTab = ref('semua')

// Action menu options
const createActionOptions = (row: Candidate) => [
  {
    label: 'Lihat Detail',
    key: 'detail',
    props: {
      onClick: () => handleAction('detail', row)
    }
  },
  {
    label: 'Rekrut Kandidat',
    key: 'recruit',
    props: {
      onClick: () => handleAction('recruit', row)
    }
  },
  {
    label: 'Chat',
    key: 'chat',
    props: {
      onClick: () => handleAction('chat', row)
    }
  }
]

// Table columns
const columns: DataTableColumns<Candidate> = [
  {
    title: 'No',
    key: 'no',
    width: 60
  },
  {
    title: 'Nama Kandidat',
    key: 'nama'
  },
  {
    title: 'Bidang',
    key: 'bidang'
  },
  {
    title: 'Applied Role',
    key: 'appliedRole'
  },
  {
    title: 'Level',
    key: 'level'
  },
  {
    title: 'Status',
    key: 'status'
  },
  {
    title: 'Action',
    key: 'action',
    width: 80,
    render: (row) => {
      return h(
        NDropdown,
        {
          options: createActionOptions(row),
          trigger: 'click'
        },
        {
          default: () =>
            h(
              NButton,
              {
                text: true,
                size: 'small'
              },
              {
                icon: () => h(NIcon, null, { default: () => h(DotsVertical) })
              }
            )
        }
      )
    }
  }
]

// Handlers
const handleAction = (action: string, row: Candidate) => {
  console.log(`Action: ${action}`, row)
}

const handleAIAssistant = () => {
  console.log('AI Assistant clicked')
}

const handleSearch = () => {
  console.log('Search:', searchValue.value)
}
</script>

<template>
  <AdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <!-- Top Section -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Daftar Kandidat</h1>

          <div class="flex items-center gap-3">
            <!-- Search Bar -->
            <n-input
              v-model:value="searchValue"
              placeholder="Cari kandidat"
              class="w-80"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <n-icon :component="Search" />
              </template>
            </n-input>

            <!-- AI Assistant Button -->
            <n-button type="primary" @click="handleAIAssistant">
              <template #icon>
                <n-icon :component="ApiApp" />
              </template>
              AI Assistant
            </n-button>
          </div>
        </div>

        <!-- Main Content -->
        <div class=" rounded-lg p-2 py-3 space-y-4">
          <!-- Tabs -->
          <n-tabs v-model:value="activeTab" type="line">
            <n-tab-pane name="semua" tab="Semua" />
            <n-tab-pane name="rekrutmen" tab="Rekrutmen" />
            <n-tab-pane name="on-boarding" tab="On-Boarding" />
            <n-tab-pane name="disimpan" tab="Disimpan" />
          </n-tabs>

          <!-- Data Table -->
          <n-data-table
            :columns="columns"
            :data="tableData"
            :bordered="false"
            single-column
            single-row

          />

          <!-- Table Controls -->
          <div class="flex items-center justify-between">
            <n-pagination
              v-model:page="currentPage"
              :page-count="3"
            />

            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Show:</span>
              <n-select
                v-model:value="pageSize"
                :options="pageSizeOptions"
                class="w-32"
              />
            </div>
          </div>
        </div>
      </div>
    </n-config-provider>
  </AdminLayout>
</template>

