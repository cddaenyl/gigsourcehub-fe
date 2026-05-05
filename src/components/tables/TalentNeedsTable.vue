<script setup lang="ts">
import { h } from 'vue'
import { NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import StatusChip from '@/components/chip/EmployeeStatusChip.vue'
import UrgencyChip from '@/components/chip/UrgencyChip.vue'
import TalentNeedsTableActions from './TalentNeedsTableActions.vue'
import type { TalentNeed } from '@/models/Table'

interface Props {
  data: TalentNeed[]
}

defineProps<Props>()

const emit = defineEmits<{
  action: [action: string, item: TalentNeed]
}>()

const handleAction = (action: string, item: TalentNeed) => {
  emit('action', action, item)
}

const columns: DataTableColumns<TalentNeed> = [
  {
    title: 'No',
    key: 'no',
    width: 50,
  },
  {
    title: 'Project/Kegiatan',
    key: 'projectKegiatan',
  },
  {
    title: 'Jumlah SDM',
    key: 'jumlahSdm',
    width: 120,
  },
  {
    title: 'Tanggal Pengajuan',
    key: 'tanggalPengajuan',
    minWidth: 160,
  },
  {
    title: 'Batas Waktu',
    key: 'batasWaktu',
    minWidth: 140,
  },
  {
    title: 'PIC HR',
    key: 'picHr',
    minWidth: 110,
  },
  {
    title: 'Status',
    key: 'status',
    minWidth: 100,
    render: (row) => {
      return h(StatusChip, {
        status: row.status,
      })
    },
  },
  {
    title: 'Urgensi',
    key: 'urgensi',
    minWidth: 60,
    render: (row) => {
      return h(UrgencyChip, {
        urgency: row.urgensi,
      })
    },
  },
  {
    title: '',
    key: 'action',
    width: 50,
    render: (row) => {
      return h(TalentNeedsTableActions, {
        item: row,
        onAction: handleAction,
      })
    },
  },
]
</script>

<template>
  <div>
    <n-data-table :columns="columns" :data="data" :bordered="false" single-column single-row />
  </div>
</template>
