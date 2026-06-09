<script setup lang="ts">
import { computed, ref } from 'vue'
import { NConfigProvider, NInput, NIcon, NButton } from 'naive-ui'
import { CalendarEvent, Plus, Search } from '@vicons/tabler'
import { format } from 'date-fns'
import CandidatePagination from '@/components/CandidatePagination.vue'
import TalentNeedsTable from '@/components/tables/TalentNeedsTable.vue'
import type { TalentNeed } from '@/models/Table'
import { useRequests } from '@/composables/useRequest'
import type { RequestItem, RequestQueryParams } from '@/models/Request'
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
}

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

const queryParams = computed<RequestQueryParams>(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  search: searchQuery.value.trim() || undefined,
}))

const { requests, pageCount, isLoading } = useRequests(queryParams)

const formatDate = (value: string | null) => {
  if (!value) {
    return '-'
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return format(parsedDate, 'd MMM yyyy')
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
    no: (currentPage.value - 1) * pageSize.value + index + 1,
    projectKegiatan: request.project_name,
    jumlahSdm: request.required_headcount,
    tanggalPengajuan: formatDate(request.created_at),
    batasWaktu: formatDate(request.due_date),
    picHr: request.admin_name || '-',
    status: formatStatusLabel(request.status),
    requestStatus: request.status,
    urgensi: formatUrgencyLabel(request.urgency),
  }))
})

const handleSearch = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
}

const handleAction = (action: string, item: TalentNeed) => {
  if (action === 'detail') {
    router.push(`/employee/talent-needs/${item.id}`)
  }
  // if (action === 'edit') {
  //   router.push(`/employee/talent-needs/edit/${item.id}`)
  // }
}
const handleAjukanPermintaan = () => {
  router.push('/employee/talent-needs/ajukan-permintaan')
}
</script>

<template>
  <EmployeeLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Kebutuhan Talenta</h1>
          <div class="flex items-center gap-3">
            <n-input
              :value="searchQuery"
              placeholder="Search by Project"
              @update:value="handleSearch"
            >
              <template #prefix>
                <n-icon :component="Search" />
              </template>
            </n-input>
            <div class="border border-gray-300 rounded-xs hover:border-gray-600 transition-colors">
              <n-button color="#FFFFFF" :bordered="true">
                <template #icon>
                  <n-icon color="#64748B" :component="CalendarEvent" />
                </template>
              </n-button>
            </div>
            <n-button type="primary" @click="handleAjukanPermintaan">
              <template #icon>
                <n-icon :component="Plus" />
              </template>
              Ajukan Permintaan
            </n-button>
          </div>
        </div>

        <div class="rounded-lg p-2 py-3 space-y-4">
          <TalentNeedsTable
            :data="paginatedTalentNeeds"
            :actions="['detail']"
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
    </n-config-provider>
  </EmployeeLayout>
</template>
