<script setup lang="ts">
import { h } from 'vue'
import { NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import CandidateTableActions from './CandidateTableActions.vue'
import CandidateBookmark from './CandidateBookmark.vue'

interface Candidate {
  no: number
  nama: string
  bidang: string
  appliedRole: string
  level: string
  status: string
}

interface Props {
  data: Candidate[]
  bookmarkedCandidates?: number[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  action: [action: string, candidate: Candidate]
  bookmarkToggle: [candidate: Candidate, isBookmarked: boolean]
}>()

const handleAction = (action: string, candidate: Candidate) => {
  emit('action', action, candidate)
}

const handleBookmarkToggle = (candidate: Candidate, isBookmarked: boolean) => {
  emit('bookmarkToggle', candidate, isBookmarked)
}

const columns: DataTableColumns<Candidate> = [
  {
    title: '',
    key: 'bookmark',
    width: 30,
    render: (row) => {
      const isBookmarked = props.bookmarkedCandidates?.includes(row.no) || false
      return h(CandidateBookmark, {
        candidate: row,
        isBookmarked: isBookmarked,
        onToggle: handleBookmarkToggle
      })
    }
  },
  {
    title: 'No',
    key: 'no',
  },
  {
    title: 'Nama Kandidat',
    key: 'nama'
  },
  {
    title: 'Bidang',
    key: 'bidang'
  },
  {
    title: 'Applied Role',
    key: 'appliedRole'
  },
  {
    title: 'Level',
    key: 'level'
  },
  {
    title: 'Status',
    key: 'status'
  },
  {
    title: 'Action',
    key: 'action',
    render: (row) => {
      return h(CandidateTableActions, {
        candidate: row,
        onAction: handleAction
      })
    }
  }
]
</script>

<template>
  <n-data-table
    :columns="columns"
    :data="data"
    :bordered="false"
    single-column
    single-row
  />
</template>
