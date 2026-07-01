<script setup lang="ts">
import { computed, h } from 'vue'
import { NDataTable, NTag, NButton, NIcon } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import CandidateTableActions from './CandidateTableActions.vue'
import CandidateBookmark from '../CandidateBookmark.vue'
import CandidateLevelChip from '../CandidateLevelChip.vue'
import CandidateStatusChip from '../CandidateStatusChip.vue'
import UserStatusChip from '../chip/UserStatusChip.vue'
import { Eye } from '@vicons/tabler'
import type { AllCandidates } from '@/models/Table'

type CandidateTableVariant = 'all' | 'recruitment' | 'bookmarked' | 'onboarding' | 'archive'

interface Props {
  data: AllCandidates[]
  variant?: CandidateTableVariant
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'all',
  loading: false,
})

const emit = defineEmits<{
  action: [action: string, candidate: AllCandidates]
}>()

const handleAction = (action: string, candidate: AllCandidates) => {
  emit('action', action, candidate)
}

const formatDate = (value: string | null | undefined): string => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const allCandidateColumns = (): DataTableColumns<AllCandidates> => [
  {
    title: '',
    key: 'bookmark',
    width: 30,
    render: (row) =>
      h(CandidateBookmark, {
        userId: row.id,
      }),
  },
  {
    title: 'No',
    key: 'no',
  },
  {
    title: 'Nama Kandidat',
    key: 'nama',
  },
  {
    title: 'Bidang',
    key: 'bidang',
  },
  {
    title: 'Applied Role',
    key: 'appliedRole',
    render: (row) => {
      if (!row.appliedRole || row.appliedRole.length === 0) {
        return '-'
      }
      const visibleRoles = row.appliedRole.slice(0, 2)
      const hiddenCount = row.appliedRole.length - visibleRoles.length
      return h(
        'div',
        {
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
          },
        },
        [
          ...visibleRoles.map((role) =>
            h(
              NTag,
              {
                size: 'small',
                bordered: false,
              },
              { default: () => role },
            ),
          ),
          ...(hiddenCount > 0
            ? [
                h(
                  NTag,
                  {
                    size: 'small',
                    bordered: false,
                    type: 'info',
                    style: {
                      backgroundColor: '#DBEAFE',
                      color: '#3B82F6',
                    },
                  },
                  { default: () => `+${hiddenCount}` },
                ),
              ]
            : []),
        ],
      )
    },
  },
  {
    title: 'Level',
    key: 'level',
    render: (row) =>
      h(CandidateLevelChip, {
        level: row.level,
      }),
  },
  {
    title: 'Status',
    key: 'status',
    render: (row) =>
      h(UserStatusChip, {
        unavailableUntil: row.unavailableUntil,
        recruitmentStatusId: row.recruitmentStatusId,
        recruitmentStatusName: row.status,
        contractStart: row.contractStart,
      }),
  },
  {
    title: 'Action',
    key: 'action',
    render: (row) =>
      h(CandidateTableActions, {
        candidate: row,
        onAction: handleAction,
      }),
  },
]

const recruitmentColumns = (): DataTableColumns<AllCandidates> => [
  // {
  //   title: '',
  //   key: 'bookmark',
  //   width: 30,
  //   render: (row) =>
  //     h(CandidateBookmark, {
  //       userId: row.id,
  //     }),
  // },
  {
    title: 'No',
    key: 'no',
  },
  {
    title: 'Nama Kandidat',
    key: 'nama',
  },
  {
    title: 'Posisi',
    key: 'jobRoleName',
    render: (row) => row.jobRoleName || '-',
  },
  {
    title: 'Project',
    key: 'projectName',
    render: (row) => row.projectName || '-',
  },
  {
    title: 'Status Rekrutmen',
    key: 'statusRecruitment',
    render: (row) =>
      h(CandidateStatusChip, {
        status: row.status,
        hexCode: row.statusHexCode,
      }),
  },
  {
    title: 'Level',
    key: 'level',
    render: (row) =>
      h(CandidateLevelChip, {
        level: row.level,
      }),
  },
  {
    title: 'Status Kandidat',
    key: 'status',
    render: (row) =>
      h(UserStatusChip, {
        unavailableUntil: row.unavailableUntil,
        recruitmentStatusId: row.recruitmentStatusId,
        recruitmentStatusName: row.status,
        contractStart: row.contractStart,
      }),
  },
  {
    title: 'Action',
    key: 'action',
    render: (row) =>
      h(CandidateTableActions, {
        candidate: row,
        onAction: handleAction,
      }),
  },
]

const onboardingColumns = (): DataTableColumns<AllCandidates> => [
  {
    title: 'No',
    key: 'no',
  },
  {
    title: 'Nama Kandidat',
    key: 'nama',
  },
  {
    title: 'Pengaju',
    key: 'pengaju',
    render: (row) => row.pengaju || '-',
  },
  {
    title: 'Posisi',
    key: 'jobRoleName',
    render: (row) => row.jobRoleName || '-',
  },
  {
    title: 'Project',
    key: 'projectName',
    render: (row) => row.projectName || '-',
  },
  {
    title: 'Kontrak Mulai',
    key: 'contractStart',
    render: (row) => formatDate(row.contractStart),
  },
  {
    title: 'Batas Kontrak',
    key: 'contractEnd',
    render: (row) => formatDate(row.contractEnd),
  },
  {
    title: 'Status Kandidat',
    key: 'status',
    render: (row) =>
      h(UserStatusChip, {
        unavailableUntil: row.unavailableUntil,
        recruitmentStatusId: row.recruitmentStatusId,
        recruitmentStatusName: row.status,
        contractStart: row.contractStart,
      }),
  },
  {
    title: 'Action',
    key: 'action',
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          secondary: true,
          onClick: () => handleAction('view', row),
        },
        {
          icon: () => h(NIcon, { size: 16 }, { default: () => h(Eye) }),
        },
      ),
  },
]

const archiveColumns = (): DataTableColumns<AllCandidates> => [
  {
    title: 'No',
    key: 'no',
  },
  {
    title: 'Nama Kandidat',
    key: 'nama',
  },
  {
    title: 'Pengaju',
    key: 'pengaju',
    render: (row) => row.pengaju || '-',
  },
  {
    title: 'Posisi',
    key: 'jobRoleName',
    render: (row) => row.jobRoleName || '-',
  },
  {
    title: 'Project',
    key: 'projectName',
    render: (row) => row.projectName || '-',
  },
  {
    title: 'Kontrak Mulai',
    key: 'contractStart',
    render: (row) => formatDate(row.contractStart),
  },
  {
    title: 'Batas Kontrak',
    key: 'contractEnd',
    render: (row) => formatDate(row.contractEnd),
  },
  {
    title: 'Action',
    key: 'action',
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          secondary: true,
          onClick: () => handleAction('view', row),
        },
        {
          icon: () => h(NIcon, { size: 16 }, { default: () => h(Eye) }),
        },
      ),
  },
]

const columns = computed<DataTableColumns<AllCandidates>>(() => {
  switch (props.variant) {
    case 'recruitment':
      return recruitmentColumns()
    case 'onboarding':
      return onboardingColumns()
    case 'archive':
      return archiveColumns()
    case 'bookmarked':
    case 'all':
    default:
      return allCandidateColumns()
  }
})
</script>

<template>
  <div>
    <div v-if="props.loading && (!props.data || props.data.length === 0)" class="space-y-3">
      <!-- Skeleton Header -->
      <div class="h-10 bg-slate-100/80 rounded-md animate-pulse w-full"></div>
      <!-- Skeleton Rows -->
      <div
        v-for="i in 5"
        :key="i"
        class="h-12 bg-slate-50/50 border border-slate-100/80 rounded-md animate-pulse w-full"
      ></div>
    </div>
    <n-data-table
      v-else
      :columns="columns"
      :data="data"
      :loading="loading"
      :bordered="false"
      single-column
      single-row
    />
  </div>
</template>

<style scoped>
:deep(.n-tag) {
  background-color: transparent;
  border: 1px solid #e5e7eb;
}
</style>
