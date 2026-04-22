<script setup lang="ts">
import { h } from 'vue'
import { NDataTable, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import CandidateTableActions from './CandidateTableActions.vue'
import CandidateBookmark from '../CandidateBookmark.vue'
import CandidateLevelChip from '../CandidateLevelChip.vue'
import CandidateStatusChip from '../CandidateStatusChip.vue'
import type { AllCandidates } from '@/models/Table'

interface Props {
  data: AllCandidates[]
}

defineProps<Props>()

const emit = defineEmits<{
  action: [action: string, candidate: AllCandidates]
}>()

const handleAction = (action: string, candidate: AllCandidates) => {
  emit('action', action, candidate)
}

const columns: DataTableColumns<AllCandidates> = [
  {
    title: '',
    key: 'bookmark',
    width: 30,
    render: (row) => {
      return h(CandidateBookmark, {
        userId: row.id,
      })
    },
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
    render: (row) => {
      return h(CandidateLevelChip, {
        level: row.level,
      })
    },
  },
  {
    title: 'Status',
    key: 'status',
    render: (row) => {
      return h(CandidateStatusChip, {
        status: row.status,
        hexCode: row.statusHexCode,
      })
    },
  },
  {
    title: 'Action',
    key: 'action',
    render: (row) => {
      return h(CandidateTableActions, {
        candidate: row,
        onAction: handleAction,
      })
    },
  },
]
</script>

<template>
  <n-data-table :columns="columns" :data="data" :bordered="false" single-column single-row />
</template>

<style scoped>
:deep(.n-tag) {
  background-color: transparent;
  border: 1px solid #e5e7eb;
}
</style>
