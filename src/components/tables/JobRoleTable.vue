<script setup lang="ts">
import { h } from 'vue'
import { NDataTable, NIcon } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { Edit, Trash } from '@vicons/tabler'
import type { JobRole } from '@/models/JobRole'

interface Props {
  data: JobRole[]
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  action: [action: string, role: JobRole]
}>()

const columns: DataTableColumns<JobRole> = [
  {
    title: 'No',
    key: 'no',
    width: 60,
    render: (_, index) => index + 1
  },
  {
    title: 'Nama Posisi',
    key: 'name',
    render: (row) => h('span', { class: 'text-slate-700 font-medium' }, row.name)
  },
  {
    title: 'Nama Bidang',
    key: 'sector',
    render: (row) => h('span', { class: 'text-slate-600' }, row.sector?.name || '-')
  },
  {
    title: 'Actions',
    key: 'action',
    width: 100,
    render: (row) => {
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
            class: 'p-1.5 rounded-md hover:bg-slate-100 text-red-600 transition-colors',
            onClick: () => emit('action', 'delete', row),
          },
          [h(NIcon, { component: Trash })],
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
