<script setup lang="ts">
import { h } from 'vue'
import { NButton, NDataTable, NIcon } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { Eye } from '@vicons/tabler'
import type { OnboardingTeamRow } from '@/models/Onboarding'

interface Props {
  data: OnboardingTeamRow[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  action: [action: string, row: OnboardingTeamRow]
}>()

const handleAction = (action: string, row: OnboardingTeamRow) => {
  emit('action', action, row)
}

const columns: DataTableColumns<OnboardingTeamRow> = [
  {
    title: 'No',
    key: 'no',
    width: 60,
  },
  {
    title: 'Nama Kandidat',
    key: 'nama',
  },
  {
    title: 'Posisi',
    key: 'posisi',
  },
  {
    title: 'Project',
    key: 'project',
  },
  {
    title: 'Kontrak Mulai',
    key: 'kontrakMulai',
  },
  {
    title: 'Kontrak Berakhir',
    key: 'kontrakBerakhir',
  },
  {
    title: 'Action',
    key: 'action',
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          secondary: true,
          onClick: () => handleAction('view', row),
        },
        {
          icon: () => h(NIcon, { size: 16 }, { default: () => h(Eye) }),
        },
      ),
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
