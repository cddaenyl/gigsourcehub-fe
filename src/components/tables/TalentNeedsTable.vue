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
  loading?: boolean
  actions?: Array<'detail' | 'edit' | 'delete' | 'validate'>
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

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
        actions: props.actions,
        onAction: handleAction,
      })
    },
  },
]
</script>

<template>
  <div>
    <div v-if="props.loading && (!props.data || props.data.length === 0)" class="space-y-3">
      <!-- Skeleton Header -->
      <div class="h-10 bg-slate-100/80 rounded-md animate-pulse w-full"></div>
      <!-- Skeleton Rows -->
      <div v-for="i in 5" :key="i" class="h-12 bg-slate-50/50 border border-slate-100/80 rounded-md animate-pulse w-full"></div>
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
