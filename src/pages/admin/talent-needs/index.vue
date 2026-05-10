<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NConfigProvider, NIcon, NInput, NModal, useMessage } from 'naive-ui'
import { Check, Search } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import TalentNeedsTable from '@/components/tables/TalentNeedsTable.vue'
import type { TalentNeed } from '@/models/Table'
import type { RequestItem, RequestQueryParams } from '@/models/Request'
import { useAdminRequests, useValidateAdminRequest } from '@/composables/useRequest'

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
const selectedRequest = ref<TalentNeed | null>(null)
const showValidateModal = ref(false)

const queryParams = computed<RequestQueryParams>(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  search: searchQuery.value.trim() || undefined,
}))

const { requests, pageCount, isLoading, refetch } = useAdminRequests(queryParams)
const { mutateAsync: validateRequest, isPending: isValidating } = useValidateAdminRequest()

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
</script>

<template>
  <AdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Kebutuhan Talenta</h1>
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
        </div>

        <div class="rounded-lg p-2 py-3 space-y-4">
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
