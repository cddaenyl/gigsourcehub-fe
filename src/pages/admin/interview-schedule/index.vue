<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import {
  NConfigProvider,
  NDataTable,
  NPopselect,
  NTabPane,
  NTabs,
  NTag,
  useMessage,
  type DataTableColumns,
  type SelectOption,
} from 'naive-ui'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import { useInterviewStages } from '@/composables/useInterviewStages'
import { useInterviewsByTab } from '@/composables/useInterviews'
import { patchInterviewStageApi, patchInterviewStatusApi } from '@/services/interview.service'
import type {
  InterviewScheduleItem,
  InterviewScheduleTab,
  InterviewStatus,
} from '@/models/InterviewSchedule'

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

const message = useMessage()
const currentPage = ref(1)
const pageSize = ref(10)
const activeTab = ref<InterviewScheduleTab>('semua')

const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
}))

const { interviews, pageCount, isLoading, refetch } = useInterviewsByTab(queryParams, activeTab)
const stageQueryParams = computed(() => ({
  page: 1,
  limit: 1000,
}))
const { interviewStages } = useInterviewStages(stageQueryParams)

watch(activeTab, () => {
  currentPage.value = 1
})

const stageOptions = computed<SelectOption[]>(() =>
  interviewStages.value.map((stage) => ({
    label: stage.name,
    value: stage.id,
  })),
)

const statusOptions: SelectOption[] = [
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'No Show', value: 'NO_SHOW' },
  { label: 'Completed', value: 'COMPLETED' },
]

const formatDateTime = (value: string | null | undefined) => {
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
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)
}

const getMethodColor = (method: string) => {
  if (method === 'Offline') {
    return { color: '#F97316', textColor: '#FFFFFF' }
  }

  return { color: '#3B82F6', textColor: '#FFFFFF' }
}

const getStatusColor = (status: InterviewStatus) => {
  switch (status) {
    case 'CANCELLED':
      return { color: '#F43F5E', textColor: '#FFFFFF' }
    case 'NO_SHOW':
      return { color: '#334155', textColor: '#FFFFFF' }
    case 'COMPLETED':
      return { color: '#10B981', textColor: '#FFFFFF' }
    case 'SCHEDULED':
    default:
      return { color: '#3B82F6', textColor: '#FFFFFF' }
  }
}

const formatStatusLabel = (status: InterviewStatus) => {
  switch (status) {
    case 'SCHEDULED':
      return 'Scheduled'
    case 'CANCELLED':
      return 'Cancelled'
    case 'NO_SHOW':
      return 'No Show'
    case 'COMPLETED':
      return 'Completed'
    default:
      return status
  }
}

const getStageTextColor = (hexCode: string) => {
  const normalized = hexCode.replace('#', '')
  if (normalized.length !== 6) {
    return '#FFFFFF'
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

  return luminance > 0.6 ? '#111827' : '#FFFFFF'
}

const buildChip = (label: string, color: { color: string; textColor: string }, clickable = false) =>
  h(
    NTag,
    {
      round: true,
      bordered: false,
      color,
      style: {
        cursor: clickable ? 'pointer' : 'default',
      },
    },
    { default: () => label },
  )

const handleStageChange = async (interview: InterviewScheduleItem, stageId: string | number) => {
  if (typeof stageId !== 'string' || stageId === interview.stage_id) {
    return
  }

  const selectedStage = interviewStages.value.find((stage) => stage.id === stageId)

  if (!selectedStage) {
    message.error('Jenis Interview tidak ditemukan.')
    return
  }

  try {
    await patchInterviewStageApi({
      interview_id: interview.id,
      stage_id: stageId,
      status: interview.status,
    })
    message.success(`Jenis Interview berhasil diubah ke ${selectedStage.name}.`)
    await refetch()
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Gagal mengubah Jenis Interview.')
  }
}

const handleStatusChange = async (interview: InterviewScheduleItem, status: string | number) => {
  if (typeof status !== 'string' || status === interview.status) {
    return
  }

  const selectedStatus = statusOptions.find((option) => option.value === status)

  if (!selectedStatus) {
    message.error('Status interview tidak ditemukan.')
    return
  }

  try {
    await patchInterviewStatusApi({
      interview_id: interview.id,
      stage_id: interview.stage_id,
      status,
    })
    message.success(`Status interview berhasil diubah ke ${selectedStatus.label}.`)
    await refetch()
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Gagal mengubah status interview.')
  }
}

const columns: DataTableColumns<InterviewScheduleItem> = [
  {
    title: 'No',
    key: 'no',
    width: 70,
    render: (_row, index) => (currentPage.value - 1) * pageSize.value + index + 1,
  },
  {
    title: 'Nama Kandidat',
    key: 'candidate_user_name',
    render: (row) => h('span', { class: 'font-medium text-slate-700' }, row.candidate_user_name),
  },
  {
    title: 'Posisi',
    key: 'position',
    render: (row) => h('span', { class: 'text-slate-600' }, row.subrequest.job_role || '-'),
  },
  {
    title: 'Project',
    key: 'project',
    render: (row) => h('span', { class: 'text-slate-600' }, row.subrequest.project_name || '-'),
  },
  {
    title: 'Tanggal / Waktu',
    key: 'scheduled_at',
    render: (row) => h('span', { class: 'text-slate-600' }, formatDateTime(row.scheduled_at)),
  },
  {
    title: 'Jenis Interview',
    key: 'stage',
    render: (row) =>
      h(
        NPopselect,
        {
          value: row.stage_id,
          options: stageOptions.value,
          onUpdateValue: (value: string | number | null) => {
            if (value !== null) {
              void handleStageChange(row, value)
            }
          },
        },
        {
          default: () =>
            buildChip(
              row.stage?.name || '-',
              {
                color: row.stage?.hex_code || '#E2E8F0',
                textColor: getStageTextColor(row.stage?.hex_code || '#E2E8F0'),
              },
              true,
            ),
        },
      ),
  },
  {
    title: 'Metode',
    key: 'method',
    render: (row) => buildChip(row.method || '-', getMethodColor(row.method || '-')),
  },
  {
    title: 'Status',
    key: 'status',
    render: (row) =>
      h(
        NPopselect,
        {
          value: row.status,
          options: statusOptions,
          onUpdateValue: (value: string | number | null) => {
            if (value !== null) {
              void handleStatusChange(row, value)
            }
          },
        },
        {
          default: () => buildChip(formatStatusLabel(row.status), getStatusColor(row.status), true),
        },
      ),
  },
]
</script>

<template>
  <AdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Jadwal Interview</h1>
        </div>

        <div class="rounded-lg p-2 py-3 space-y-4">
          <n-tabs v-model:value="activeTab" type="line">
            <n-tab-pane name="semua" tab="Semua" />
            <n-tab-pane name="scheduled" tab="Scheduled" />
          </n-tabs>

          <n-data-table :columns="columns" :data="interviews" :bordered="false" :loading="isLoading" single-column
            single-row />

          <div v-if="isLoading" class="py-8 text-center">
            <p class="text-gray-500">Loading...</p>
          </div>

          <CandidatePagination v-model:page="currentPage" v-model:page-size="pageSize" :page-count="pageCount" />
        </div>
      </div>
    </n-config-provider>
  </AdminLayout>
</template>
