<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NConfigProvider, NIcon, NInput, NModal, NDropdown, useMessage } from 'naive-ui'
import { Check, Filter, Search, Download } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import TalentNeedsTable from '@/components/tables/TalentNeedsTable.vue'
import TalentNeedsTabs from '@/components/TalentNeedsTabs.vue'
import TalentNeedsFilters from '@/components/TalentNeedsFilters.vue'
import type { TalentNeed } from '@/models/Table'
import type { RequestItem, RequestQueryParams } from '@/models/Request'
import { useAdminRequestsByTab, useValidateAdminRequest } from '@/composables/useRequest'
import { exportAdminRequestsApi } from '@/services/request.service'
import { format } from 'date-fns'

const themeOverride = {
  DataTable: {
    thColor: '#F1F5F9',
    thTextColor: '#64748B',
    thFontWeight: '600',
    fontSizeMedium: '12px',
    tdColor: '#FFFFFF',
    tdColorHover: '#F1F5F9',
    tdColorStriped: '#F8FAFC',
    borderColor: '#F1F5F9',
    thColorHover: '#F8FAFC',
  },
}

const router = useRouter()
const message = useMessage()
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const activeTab = ref<'semua' | 'menunggu validasi' | 'tugas saya'>('semua')
const selectedRequest = ref<TalentNeed | null>(null)
const showValidateModal = ref(false)
const showFilters = ref(false)
const filters = ref({
  status: undefined as string | undefined,
  urgency: undefined as string | undefined,
  proposed_by: undefined as string | undefined,
  admin_name: undefined as string | undefined,
})

const queryParams = computed<RequestQueryParams>(() => {
  const baseParams: any = {
    page: currentPage.value,
    limit: pageSize.value,
    search: searchQuery.value.trim() || undefined,
  }

  if (filters.value.status) baseParams.status = filters.value.status
  if (filters.value.urgency) baseParams.urgency = filters.value.urgency
  if (filters.value.proposed_by) baseParams.proposed_by = filters.value.proposed_by
  if (filters.value.admin_name) baseParams.admin_name = filters.value.admin_name

  return baseParams
})

const { requests, pageCount, isLoading, refetch } = useAdminRequestsByTab(queryParams, activeTab)
const { mutateAsync: validateRequest, isPending: isValidating } = useValidateAdminRequest()

watch(activeTab, () => {
  currentPage.value = 1
})

watch(
  filters,
  () => {
    currentPage.value = 1
  },
  { deep: true },
)

const handleClearFilters = () => {
  filters.value = {
    status: undefined,
    urgency: undefined,
    proposed_by: undefined,
    admin_name: undefined,
  }
}

const formatDate = (value: string | null) => {
  if (!value) {
    return '-'
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

const formatStatusLabel = (status: RequestItem['status']) => {
  const normalizedStatus = status.toUpperCase()

  const statusMap: Record<string, string> = {
    PENDING: 'Menunggu Validasi',
    ACCEPTED: 'Disetujui',
    REJECTED: 'Ditolak',
    PROCESSING: 'Diproses',
    DONE: 'Selesai',
  }

  return statusMap[normalizedStatus] || normalizedStatus
}

const formatUrgencyLabel = (urgency: RequestItem['urgency']): TalentNeed['urgensi'] => {
  const urgencyMap: Record<RequestItem['urgency'], TalentNeed['urgensi']> = {
    LOW: 'Low',
    MIDDLE: 'Middle',
    HIGH: 'High',
  }

  return urgencyMap[urgency]
}

const paginatedTalentNeeds = computed<TalentNeed[]>(() => {
  return requests.value.map((request, index) => ({
    id: request.id,
    requestId: request.id,
    employeeUserId: request.employee_user_id,
    no: (currentPage.value - 1) * pageSize.value + index + 1,
    projectKegiatan: request.project_name,
    jumlahSdm: request.required_headcount,
    tanggalPengajuan: formatDate(request.created_at),
    batasWaktu: formatDate(request.due_date),
    picHr: request.admin_name || '-',
    status: formatStatusLabel(request.status),
    urgensi: formatUrgencyLabel(request.urgency),
  }))
})

const handleSearch = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
}

const handleAction = (action: string, item: TalentNeed) => {
  if (action === 'detail') {
    router.push(`/admin/talent-needs/${item.requestId || item.id}`)
    return
  }

  if (action === 'validate') {
    selectedRequest.value = item
    showValidateModal.value = true
  }
}

const handleValidate = async () => {
  if (!selectedRequest.value) {
    return
  }

  try {
    await validateRequest(selectedRequest.value.requestId || selectedRequest.value.id)
    message.success('Permintaan berhasil divalidasi.')
    showValidateModal.value = false
    selectedRequest.value = null
    await refetch()
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Gagal memvalidasi permintaan.')
  }
}

// Export Logic
const exportOptions = [
  { label: 'Export to PDF (.pdf)', key: 'pdf' },
  { label: 'Export to Excel (.xlsx)', key: 'xlsx' },
  { label: 'Export to CSV (.csv)', key: 'csv' },
]

const handleExportSelect = async (formatType: string) => {
  const exportParams = { ...queryParams.value, format: formatType }
  delete exportParams.page
  delete exportParams.limit

  // pass the activeTab if BE needs it, though the filters might be enough.
  // Wait, if activeTab is "menunggu validasi", maybe we need to force status="PENDING" if not already set.
  // Actually, useAdminRequestsByTab already uses the specific pending/my-requests endpoints.
  // However, export only has `/admin/requests/export`. So we should map the tab to appropriate filters manually if it's the single export endpoint.
  if (activeTab.value === 'menunggu validasi' && !exportParams.status) {
    exportParams.status = 'PENDING'
  }
  // For 'tugas saya', it usually depends on who is logged in, but we pass what we have.

  const msg = message.loading(`Generating ${formatType.toUpperCase()} export...`, { duration: 0 })
  try {
    const blob = await exportAdminRequestsApi(exportParams)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss')
    link.setAttribute(
      'download',
      `talent_needs_${activeTab.value.replace(/\s+/g, '_')}_${timestamp}.${formatType}`,
    )

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
</script>

<template>
  <AdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Kebutuhan Talenta</h1>
          <div class="flex items-center gap-2">
            <n-input
              :value="searchQuery"
              placeholder="Search by Project"
              class="max-w-sm"
              @update:value="handleSearch"
            >
              <template #prefix>
                <n-icon :component="Search" />
              </template>
            </n-input>
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

            <n-dropdown trigger="click" :options="exportOptions" @select="handleExportSelect">
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
          <!-- Filter Sidebar -->
          <transition name="slide-fade">
            <div v-if="showFilters" class="w-72 shrink-0 sticky top-6">
              <TalentNeedsFilters v-model:filters="filters" @clear="handleClearFilters" />
            </div>
          </transition>

          <div class="flex-1 min-w-0 rounded-lg space-y-4">
            <TalentNeedsTabs v-model="activeTab" />
            <TalentNeedsTable
              :data="paginatedTalentNeeds"
              :actions="['detail', 'validate']"
              @action="handleAction"
            />

            <div v-if="isLoading" class="py-8 text-center">
              <p class="text-gray-500">Loading...</p>
            </div>

            <CandidatePagination
              v-model:page="currentPage"
              v-model:page-size="pageSize"
              :page-count="pageCount"
            />
          </div>
        </div>
      </div>

      <n-modal
        v-model:show="showValidateModal"
        preset="card"
        :bordered="false"
        style="width: 440px"
      >
        <div class="space-y-5 py-2 text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <n-icon :component="Check" size="30" color="#2563EB" />
          </div>
          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-gray-800">Validasi Permintaan</h2>
            <p class="text-sm text-gray-500">Permintaan ini akan ditandai sebagai tervalidasi.</p>
          </div>
          <div class="flex justify-center gap-3 pt-2">
            <n-button secondary @click="showValidateModal = false">Batal</n-button>
            <n-button type="primary" :loading="isValidating" @click="handleValidate">
              Validasi
            </n-button>
          </div>
        </div>
      </n-modal>
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
