<script setup lang="ts">
import { h } from 'vue'
import { NDataTable, NTag, NDropdown, NIcon, NButton } from 'naive-ui'
import type { DataTableColumns, DropdownOption } from 'naive-ui'
import { DotsVertical } from '@vicons/tabler'
import type { JobVacancy, JobVacancyStatus } from '@/models/JobVacancy'

interface Props {
  data: JobVacancy[]
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  action: [action: 'view' | 'edit' | 'delete', vacancy: JobVacancy]
}>()

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' • ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function getStatusColor(status: JobVacancyStatus | null): { color: string; textColor: string } {
  switch (status) {
    case 'PUBLISHED':
      return { color: '#DCFCE7', textColor: '#166534' }
    case 'DRAFT':
      return { color: '#F1F5F9', textColor: '#475569' }
    case 'ARCHIVED':
      return { color: '#1E293B', textColor: '#F1F5F9' }
    default:
      return { color: '#F1F5F9', textColor: '#475569' }
  }
}

function getStatusLabel(status: JobVacancyStatus | null): string {
  switch (status) {
    case 'PUBLISHED': return 'Published'
    case 'DRAFT': return 'Draft'
    case 'ARCHIVED': return 'Archived'
    default: return '—'
  }
}

const columns: DataTableColumns<JobVacancy> = [
  {
    title: 'No',
    key: 'no',
    width: 56,
    render: (_, index) => h('span', { class: 'text-slate-500 text-sm' }, String(index + 1)),
  },
  {
    title: 'Judul',
    key: 'name',
    render: (row) =>
      h('span', { class: 'text-slate-700 font-medium text-sm' }, row.name),
  },
  {
    title: 'Posisi',
    key: 'position',
    render: (row) =>
      h('span', { class: 'text-slate-600 text-sm' }, row.subrequest?.job_role ?? '—'),
  },
  {
    title: 'Project / Kegiatan',
    key: 'project',
    ellipsis: { tooltip: true },
    render: (row) => {
      const text = row.subrequest?.overview ?? row.subrequest?.notes ?? '—'
      return h('span', { class: 'text-slate-500 text-sm' }, text)
    },
  },
  {
    title: 'Published At',
    key: 'created_at',
    width: 180,
    render: (row) =>
      h('span', { class: 'text-slate-500 text-sm' }, formatDate(row.created_at)),
  },
  {
    title: 'Expiry',
    key: 'takedown_date',
    width: 160,
    render: (row) =>
      h('span', { class: 'text-slate-500 text-sm' }, formatDate(row.takedown_date)),
  },
  {
    title: 'Status',
    key: 'status',
    width: 120,
    render: (row) => {
      const { color, textColor } = getStatusColor(row.status)
      return h(
        NTag,
        {
          round: true,
          bordered: false,
          color: { color, textColor },
          style: { minWidth: '80px', textAlign: 'center', fontWeight: '500' },
        },
        { default: () => getStatusLabel(row.status) },
      )
    },
  },
  {
    title: '',
    key: 'actions',
    width: 56,
    className: 'action-column',
    render: (row) => {
      const options: DropdownOption[] = [
        { label: 'Lihat Detail', key: 'view' },
        { label: 'Edit', key: 'edit' },
        { label: 'Hapus', key: 'delete', props: { style: { color: '#EF4444' } } },
      ]

      return h(
        NDropdown,
        {
          options,
          trigger: 'click',
          onSelect: (key: string) => {
            if (key === 'view' || key === 'edit' || key === 'delete') {
              emit('action', key, row)
            }
          },
        },
        {
          default: () =>
            h(
              NButton,
              { text: true, size: 'small', class: 'text-slate-400 hover:text-slate-600' },
              { default: () => h(NIcon, { component: DotsVertical, size: 18 }) },
            ),
        },
      )
    },
  },
]
</script>

<template>
  <n-data-table
    :columns="columns"
    :data="data"
    :bordered="false"
    :loading="loading"
    single-column
    single-row
  />
</template>

<style scoped>
:deep(.n-data-table-th.action-column),
:deep(.n-data-table-td.action-column) {
  border-left: 1px solid #f1f5f9;
}
</style>
