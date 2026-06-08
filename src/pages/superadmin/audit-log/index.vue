<script setup lang="ts">
import { ref, watch } from 'vue'
import { 
  NButton, 
  NIcon, 
  NDataTable, 
  NTag, 
  NModal, 
  NCard, 
  NDropdown,
  useMessage 
} from 'naive-ui'
import { Filter, Eye, Download } from '@vicons/tabler'
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import AuditLogFilters from '@/components/AuditLogFilters.vue'
import { getActivityLogsApi, downloadActivityLogsApi } from '@/services/activity-log.service'
import type { ActivityLog } from '@/models/ActivityLog'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { id } from 'date-fns/locale'

const message = useMessage()

// State
const logs = ref<ActivityLog[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const searchQuery = ref('')

// Filters
const filters = ref({
  start_date: null as number | null,
  end_date: null as number | null,
  role: null as string | null,
  module: null as string | null,
  action: null as string | null,
  status: null as string | null
})

// Detail Modal
const showModal = ref(false)
const selectedLog = ref<ActivityLog | null>(null)
const showFilters = ref(false)

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      limit: limit.value,
      search: searchQuery.value,
      role: filters.value.role,
      module: filters.value.module,
      action_type: filters.value.action,
      status: filters.value.status
    }

    if (filters.value.start_date) {
      params.start_date = new Date(filters.value.start_date).toISOString()
    }
    if (filters.value.end_date) {
      params.end_date = new Date(filters.value.end_date).toISOString()
    }

    const res = await getActivityLogsApi(params)
    logs.value = res.data.list
    total.value = res.data.total || 0
  } catch (err: any) {
    message.error(err.message || 'Gagal mengambil data log')
  } finally {
    loading.value = false
  }
}

// Initial fetch
fetchData()

// Watch filters
watch(filters, () => {
  page.value = 1
  fetchData()
}, { deep: true })

// Handlers
const handleSearch = (val: string) => {
  searchQuery.value = val
  page.value = 1
  fetchData()
}

const handlePageChange = (p: number) => {
  page.value = p
  fetchData()
}

const handleClearFilters = () => {
  filters.value = {
    start_date: null,
    end_date: null,
    role: null,
    module: null,
    action: null,
    status: null
  }
}

const handleViewDetail = (log: ActivityLog) => {
  selectedLog.value = log
  showModal.value = true
}

// Export Logic
const exportOptions = [
  {
    label: 'Export to PDF (.pdf)',
    key: 'pdf',
    children: [
      { label: 'Hari Ini', key: 'pdf:today' },
      { label: '7 Hari Terakhir', key: 'pdf:7days' },
      { label: '30 Hari Terakhir', key: 'pdf:30days' },
      { label: 'Custom Range (Current Filters)', key: 'pdf:custom' }
    ]
  },
  {
    label: 'Export to Excel (.xlsx)',
    key: 'xlsx',
    children: [
      { label: 'Hari Ini', key: 'xlsx:today' },
      { label: '7 Hari Terakhir', key: 'xlsx:7days' },
      { label: '30 Hari Terakhir', key: 'xlsx:30days' },
      { label: 'Custom Range (Current Filters)', key: 'xlsx:custom' }
    ]
  },
  {
    label: 'Export to CSV (.csv)',
    key: 'csv',
    children: [
      { label: 'Hari Ini', key: 'csv:today' },
      { label: '7 Hari Terakhir', key: 'csv:7days' },
      { label: '30 Hari Terakhir', key: 'csv:30days' },
      { label: 'Custom Range (Current Filters)', key: 'csv:custom' }
    ]
  }
]

const handleExportSelect = async (key: string) => {
  const parts = key.split(':')
  if (parts.length < 2) return
  
  const formatType = parts[0]
  const range = parts[1]
  
  if (!formatType || !range) return

  const params: any = { ...filters.value, search: searchQuery.value, format: formatType }
  const now = new Date()

  if (range === 'today') {
    params.start_date = startOfDay(now).toISOString()
    params.end_date = endOfDay(now).toISOString()
  } else if (range === '7days') {
    params.start_date = startOfDay(subDays(now, 7)).toISOString()
    params.end_date = endOfDay(now).toISOString()
  } else if (range === '30days') {
    params.start_date = startOfDay(subDays(now, 30)).toISOString()
    params.end_date = endOfDay(now).toISOString()
  } else if (range === 'custom') {
    if (params.start_date) params.start_date = new Date(params.start_date).toISOString()
    if (params.end_date) params.end_date = new Date(params.end_date).toISOString()
  }

  // authenticated download
  const msg = message.loading(`Generating ${formatType.toUpperCase()} export...`, { duration: 0 })
  try {
    const blob = await downloadActivityLogsApi(params)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss')
    link.setAttribute('download', `audit_log_${timestamp}.${formatType}`)
    
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    message.success('Download started')
  } catch (err: any) {
    message.error(err.message || 'Gagal export data')
  } finally {
    msg.destroy()
  }
}

// Helpers
const parseDescription = (desc: string | null) => {
  if (!desc) return { target: '-', description: '-' }
  const parts = desc.split(': ')
  if (parts.length > 1) {
    return {
      description: parts[0],
      target: parts.slice(1).join(': ')
    }
  }
  return { description: desc, target: '-' }
}

const getActionTagType = (action: string) => {
  const a = action.toUpperCase()
  if (a.includes('CREATE')) return 'success'
  if (a.includes('UPDATE')) return 'info'
  if (a.includes('DELETE')) return 'error'
  if (a.includes('LOGIN')) return 'default'
  if (a.includes('ASSIGN')) return 'warning'
  return 'default'
}

// Table Columns
const columns = [
  {
    title: 'Timestamp',
    key: 'created_at',
    width: 160,
    render(row: ActivityLog) {
      return format(new Date(row.created_at), 'yyyy-MM-dd HH:mm:ss', { locale: id })
    }
  },
  {
    title: 'User Name',
    key: 'actor_name',
    width: 150
  },
  {
    title: 'Role',
    key: 'actor_role',
    width: 120,
    render(row: ActivityLog) {
      return h(
        NTag,
        {
          size: 'small',
          style: { fontWeight: '500' }
        },
        { default: () => row.actor_role }
      )
    }
  },
  {
    title: 'Action',
    key: 'action_type',
    width: 100,
    render(row: ActivityLog) {
      return h(
        NTag,
        {
          type: getActionTagType(row.action_type),
          round: true,
          size: 'small',
          style: { fontWeight: 'bold' }
        },
        { default: () => row.action_type.toUpperCase() }
      )
    }
  },
  {
    title: 'Module',
    key: 'module',
    width: 120
  },
  {
    title: 'Target Data',
    key: 'target_data',
    width: 200,
    render(row: ActivityLog) {
      const { target } = parseDescription(row.description)
      return target
    }
  },
  {
    title: 'Description',
    key: 'description_clean',
    width: 250,
    render(row: ActivityLog) {
      const { description } = parseDescription(row.description)
      return description
    }
  },
  {
    title: 'IP Address',
    key: 'ip_address',
    width: 130,
    render(row: ActivityLog) {
      return row.ip_address || '-'
    }
  },
  {
    title: 'Status',
    key: 'is_success',
    width: 100,
    render(row: ActivityLog) {
      return h(
        NTag,
        {
          type: row.is_success ? 'success' : 'error',
          size: 'small'
        },
        { default: () => (row.is_success ? 'Success' : 'Failed') }
      )
    }
  },
  {
    title: 'Detail',
    key: 'actions',
    width: 70,
    render(row: ActivityLog) {
      return h(
        NButton,
        {
          size: 'tiny',
          quaternary: true,
          circle: true,
          onClick: () => handleViewDetail(row)
        },
        {
          icon: () => h(NIcon, { component: Eye })
        }
      )
    }
  }
]

// Row attributes for color-coding failed logs
const rowProps = (row: ActivityLog) => {
  if (!row.is_success) {
    return {
      style: 'background-color: #FEF2F2;' // Subtle red for failures
    }
  }
  return {}
}
</script>

<script lang="ts">
import { h } from 'vue'
</script>

<template>
  <SuperAdminLayout>
    <div class="space-y-6">
      <!-- Header Section Always at Top -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Audit Log</h1>
          <p class="text-gray-500">Tracking semua aktivitas sistem untuk security & investigasi</p>
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
          
          <n-dropdown 
            trigger="click" 
            :options="exportOptions" 
            @select="handleExportSelect"
          >
            <n-button type="primary" color="#0014B2">
              <template #icon>
                <n-icon :component="Download" />
              </template>
              Export
            </n-button>
          </n-dropdown>
        </div>
      </div>

      <div class="flex gap-6 items-start relative">
        <!-- Filter Sidebar - Only shown if toggled -->
        <transition name="slide-fade">
          <div v-if="showFilters" class="w-72 shrink-0 sticky top-6">
            <AuditLogFilters v-model:filters="filters" @clear="handleClearFilters" />
          </div>
        </transition>

        <div class="flex-1 min-w-0 space-y-6">
          <!-- Search & Table Area -->
          <div class="bg-white p-6 rounded-xl shadow-sm space-y-4 border border-gray-100">
            <div class="max-w-md">
              <SearchInput 
                v-model:model-value="searchQuery"
                placeholder="Search by user, description, target data..."
                @update:model-value="handleSearch"
              />
            </div>
            <div class="text-sm text-gray-400">
              Showing {{ logs.length }} of {{ total }} logs
            </div>

            <!-- Table -->
            <n-data-table
              :columns="columns"
              :data="logs"
              :loading="loading"
              :bordered="false"
              :row-key="(row) => row.id"
              :row-props="rowProps"
              size="small"
              scroll-x="1400"
            />

            <!-- Pagination -->
            <div class="flex justify-end mt-4">
              <CandidatePagination
                :page="page"
                :page-size="limit"
                :page-count="Math.ceil(total / limit)"
                @update:page="handlePageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Metadata Detail Modal -->
    <n-modal v-model:show="showModal">
      <n-card
        style="width: 900px; border-radius: 16px;"
        :title="`Log Detail - #${selectedLog?.id.slice(0, 8)}`"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        closable
        @close="showModal = false"
      >
        <div v-if="selectedLog" class="space-y-6">
          <div class="grid grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p class="text-sm text-gray-400 font-medium mb-1">Timestamp</p>
              <p class="text-gray-700 font-semibold">{{ format(new Date(selectedLog.created_at), 'yyyy-MM-dd HH:mm:ss', { locale: id }) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400 font-medium mb-1">User Name</p>
              <p class="text-gray-700 font-semibold">{{ selectedLog.actor_name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400 font-medium mb-1">Role</p>
              <n-tag size="small" :bordered="false" style="background-color: #F1F5F9; color: #475569;">
                {{ selectedLog.actor_role }}
              </n-tag>
            </div>
            <div>
              <p class="text-sm text-gray-400 font-medium mb-1">IP Address</p>
              <p class="text-gray-700 font-semibold">{{ selectedLog.ip_address || '-' }}</p>
            </div>
          </div>
          
          <div class="border-t pt-4">
            <p class="text-sm text-gray-400 font-medium mb-1">User Agent</p>
            <p class="text-gray-600 text-sm">{{ JSON.parse(selectedLog.metadata || '{}').user_agent || '-' }}</p>
          </div>

          <div class="border-t pt-4">
            <p class="text-sm text-gray-400 font-medium mb-1">Endpoint API</p>
            <p class="text-gray-700 font-mono text-sm font-semibold">{{ JSON.parse(selectedLog.metadata || '{}').endpoint || '-' }}</p>
          </div>

          <div class="border-t pt-4">
            <p class="text-sm text-gray-400 font-medium mb-1">Target Data</p>
            <p class="text-gray-700 font-semibold">{{ parseDescription(selectedLog.description).target }}</p>
          </div>

          <div class="border-t pt-4">
            <p class="text-sm text-gray-400 font-medium mb-1">Description</p>
            <p class="text-gray-700">{{ parseDescription(selectedLog.description).description }}</p>
          </div>
          
        </div>
      </n-card>
    </n-modal>
  </SuperAdminLayout>
</template>

<style scoped>
:deep(.n-data-table-th) {
  background-color: #F8FAFC !important;
  color: #64748B !important;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
:deep(.n-data-table-td) {
  font-size: 0.875rem;
}

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
