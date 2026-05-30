<script setup lang="ts">
import { h } from 'vue'
import { NDataTable, NTag, NButton } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { ApprovalRequest } from '@/models/Approval'

interface Props {
  data: ApprovalRequest[]
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  action: [action: 'review', request: ApprovalRequest]
}>()

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return (
    d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ' • ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  )
}

function getStatusStyle(status: string): { color: string; textColor: string } {
  switch (status) {
    case 'APPROVED':
      return { color: '#DCFCE7', textColor: '#166534' }
    case 'PENDING':
      return { color: '#FEF3C7', textColor: '#D97706' }
    case 'REJECTED':
      return { color: '#FEE2E2', textColor: '#991B1B' }
    default:
      return { color: '#F1F5F9', textColor: '#475569' }
  }
}

function getActionTypeStyle(action: string): { color: string; textColor: string } {
  switch (action) {
    case 'CREATE':
      return { color: '#E0F2FE', textColor: '#0369A1' }
    case 'UPDATE':
      return { color: '#FEF3C7', textColor: '#D97706' }
    default:
      return { color: '#F1F5F9', textColor: '#475569' }
  }
}

function parseProposed(proposedStr?: string | null): { name: string; description: string; image_path?: string } {
  if (!proposedStr) return { name: '—', description: '—' }
  try {
    const data = JSON.parse(proposedStr)
    return {
      name: data.name || '—',
      description: data.description || '—',
      image_path: data.image_path || undefined,
    }
  } catch (e) {
    return { name: '—', description: '—' }
  }
}

function getFullImageUrl(path?: string | null) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://cdn.magangslab.store/gigsourcehub-test/${path}`
}

const columns: DataTableColumns<ApprovalRequest> = [
  {
    title: 'No',
    key: 'no',
    width: 56,
    render: (_, index) => h('span', { class: 'text-slate-500 text-sm' }, String(index + 1)),
  },
  {
    title: 'Tipe Aksi',
    key: 'action',
    width: 110,
    render: (row) => {
      const { color, textColor } = getActionTypeStyle(row.action)
      return h(
        NTag,
        {
          round: true,
          bordered: false,
          color: { color, textColor },
          style: { fontWeight: '500', width: '84px', textAlign: 'center' },
        },
        { default: () => row.action }
      )
    },
  },
  {
    title: 'Gambar',
    key: 'image',
    width: 80,
    render: (row) => {
      const parsed = parseProposed(row.proposed_data)
      if (parsed.image_path) {
        return h('img', {
          src: getFullImageUrl(parsed.image_path),
          class: 'h-10 w-10 object-cover rounded-md border border-slate-200 shadow-sm',
          style: { display: 'block' },
        })
      }
      return h('span', { class: 'text-slate-400 text-xs italic' }, '—')
    },
  },
  {
    title: 'Nama Bidang (Proposed)',
    key: 'name',
    ellipsis: { tooltip: true },
    render: (row) => {
      const parsed = parseProposed(row.proposed_data)
      return h('span', { class: 'text-slate-700 font-medium text-sm' }, parsed.name)
    },
  },
  {
    title: 'Deskripsi (Proposed)',
    key: 'description',
    ellipsis: { tooltip: true },
    render: (row) => {
      const parsed = parseProposed(row.proposed_data)
      return h('span', { class: 'text-slate-600 text-sm' }, parsed.description)
    },
  },
  {
    title: 'Pemohon',
    key: 'requested_by',
    width: 140,
    render: (row) =>
      h('span', { class: 'text-slate-500 text-sm' }, row.requested_by_admin_name ?? 'Admin'),
  },
  {
    title: 'Tanggal Pengajuan',
    key: 'created_at',
    width: 180,
    render: (row) =>
      h('span', { class: 'text-slate-500 text-sm' }, formatDate(row.created_at)),
  },
  {
    title: 'Status',
    key: 'status',
    width: 120,
    render: (row) => {
      const { color, textColor } = getStatusStyle(row.status)
      return h(
        NTag,
        {
          round: true,
          bordered: false,
          color: { color, textColor },
          style: { minWidth: '84px', textAlign: 'center', fontWeight: '500' },
        },
        { default: () => row.status }
      )
    },
  },
  {
    title: '',
    key: 'actions',
    width: 90,
    className: 'action-column',
    render: (row) => {
      return h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          ghost: true,
          onClick: () => emit('action', 'review', row),
        },
        { default: () => 'Review' }
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
