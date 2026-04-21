<script setup lang="ts">
import { h } from 'vue'
import { NDataTable, NTag, NIcon } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { Edit, X, CircleCheck } from '@vicons/tabler'

interface UserManagementData {
  id: string
  no: number
  nama: string
  email: string
  bidang: string | null
  status: string | null
  system_role_name: string | null
}

interface Props {
  data: UserManagementData[]
}

defineProps<Props>()

const emit = defineEmits<{
  action: [action: string, user: UserManagementData]
}>()

const handleAction = (action: string, user: UserManagementData) => {
  emit('action', action, user)
}

const columns: DataTableColumns<UserManagementData> = [
  {
    title: 'No',
    key: 'no',
    width: 60,
  },
  {
    title: 'Nama Lengkap',
    key: 'nama',
  },
  {
    title: 'Email',
    key: 'email',
    render: (row) => {
      return h(
        'a',
        {
          href: `mailto:${row.email}`,
          class: 'text-blue-600 hover:text-blue-800 underline decoration-slate-300',
        },
        row.email,
      )
    },
  },
  {
    title: 'Bidang',
    key: 'bidang',
    render: (row) => {
      return h('span', { class: 'text-slate-600' }, row.bidang || '-')
    },
  },
  {
    title: 'Status',
    key: 'status',
    className: 'border-r border-slate-100',
    render: (row) => {
      const type =
        row.status === 'Active'
          ? 'success'
          : row.status === 'Inactive'
            ? 'error'
            : row.status === 'Blocked'
              ? 'error'
              : 'default'
      return h(
        NTag,
        {
          type: type,
          round: true,
          bordered: false,
          style: { minWidth: '80px', textAlign: 'center' },
          color:
            row.status === 'Active'
              ? { color: '#DCFCE7', textColor: '#166534' }
              : row.status === 'Inactive' || row.status === 'Blocked'
                ? { color: '#FEE2E2', textColor: '#991B1B' }
                : { color: '#F1F5F9', textColor: '#475569' },
        },
        { default: () => row.status || '-' },
      )
    },
  },
  {
    title: 'Actions',
    key: 'action',
    className: 'action-column',
    render: (row) => {
      const isBlocked = row.status === 'Blocked' || row.status === 'Inactive'
      const actionIcon = isBlocked ? CircleCheck : X
      const actionClass = isBlocked
        ? 'p-1.5 rounded-md hover:bg-slate-100 text-green-600 transition-colors'
        : 'p-1.5 rounded-md hover:bg-slate-100 text-red-600 transition-colors'

      // For Active users: Candidates get 'block', others get 'disable'
      // For Blocked/Inactive users: Both get 'activate'
      const actionType = !isBlocked
        ? row.system_role_name === 'Candidate'
          ? 'block'
          : 'disable'
        : 'activate'

      return h('div', { class: 'flex items-center gap-2' }, [
        h(
          'button',
          {
            class: 'p-1.5 rounded-md hover:bg-slate-100 text-yellow-600 transition-colors',
            onClick: () => handleAction('edit', row),
          },
          [h(NIcon, { component: Edit })],
        ),
        h(
          'button',
          {
            class: actionClass,
            onClick: () => handleAction(actionType, row),
          },
          [h(NIcon, { component: actionIcon })],
        ),
      ])
    },
  },
]
</script>

<template>
  <n-data-table :columns="columns" :data="data" :bordered="false" single-column single-row />
</template>

<style scoped>
:deep(.n-data-table-th.action-column),
:deep(.n-data-table-td.action-column) {
  border-left: 1px solid #e2e8f0;
}
</style>
