<script setup lang="ts">
import { h } from 'vue'
import { NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import CandidateTableActions from './CandidateTableActions.vue'
import CandidateBookmark from './CandidateBookmark.vue'
import CandidateLevelChip from './CandidateLevelChip.vue'
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
