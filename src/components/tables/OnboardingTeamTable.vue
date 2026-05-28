<script setup lang="ts">
import { h } from 'vue'
import { NButton, NDataTable, NIcon } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { Eye } from '@vicons/tabler'
import type { OnboardingTeamRow } from '@/models/Onboarding'

interface Props {
  data: OnboardingTeamRow[]
}

defineProps<Props>()

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
  <n-data-table :columns="columns" :data="data" :bordered="false" single-column single-row />
</template>
