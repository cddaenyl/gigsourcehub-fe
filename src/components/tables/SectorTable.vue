<script setup lang="ts">
import { h } from 'vue'
import { NDataTable, NTag, NIcon } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { Edit, X, CircleCheck } from '@vicons/tabler'
import type { Sector } from '@/models/Sector'

interface Props {
  data: Sector[]
  loading?: boolean
}

defineProps<Props>()
// const themeOverride = NDataTable.themeOverrides
// themeOverride('DataTable', {
//   borderColor: '#E5E7EB',
//   headerColor: '#F9FAFB',
//   headerTextColor: '#374151',
//   rowHoverColor: '#F3F4F6',
// })
const emit = defineEmits<{
  action: [action: string, sector: Sector]
}>()

const columns: DataTableColumns<Sector> = [
  {
    title: 'No',
    key: 'no',
    width: 60,
    render: (_, index) => index + 1,
  },
  {
    title: 'Nama Bidang',
    key: 'name',
    render: (row) => h('span', { class: 'text-slate-700' }, row.name),
  },
  {
    title: 'Hex Code',
    key: 'hex_code',
    render: (row) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h('div', {
          style: {
            backgroundColor: row.hex_code,
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
          },
        }),
        h('span', { class: 'font-mono text-slate-500' }, row.hex_code),
      ]),
  },
  {
    title: 'Status Bidang',
    key: 'is_active',
    render: (row) => {
      const type = row.is_active ? 'success' : 'error'
      return h(
        NTag,
        {
          type: type,
          round: true,
          bordered: false,
          style: { minWidth: '80px', textAlign: 'center' },
          color: row.is_active
            ? { color: '#DCFCE7', textColor: '#166534' }
            : { color: '#FEE2E2', textColor: '#991B1B' },
        },
        { default: () => (row.is_active ? 'Active' : 'Inactive') },
      )
    },
  },
  {
    title: 'Actions',
    key: 'action',
    width: 100,
    className: 'action-column',
    render: (row) => {
      const actionIcon = row.is_active ? X : CircleCheck
      const actionClass = row.is_active
        ? 'p-1.5 rounded-md hover:bg-slate-100 text-red-600 transition-colors'
        : 'p-1.5 rounded-md hover:bg-slate-100 text-green-600 transition-colors'

      return h('div', { class: 'flex items-center gap-2' }, [
        h(
          'button',
          {
            class: 'p-1.5 rounded-md hover:bg-slate-100 text-yellow-600 transition-colors',
            onClick: () => emit('action', 'edit', row),
          },
          [h(NIcon, { component: Edit })],
        ),
        h(
          'button',
          {
            class: actionClass,
            onClick: () => emit('action', 'toggle-status', row),
          },
          [h(NIcon, { component: actionIcon })],
        ),
      ])
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
  border-left: 1px solid #e2e8f0;
}
</style>
