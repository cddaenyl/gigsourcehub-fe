<script setup lang="ts">
import { NDropdown, NIcon } from 'naive-ui'
import { DotsVertical, Eye, Edit, Trash } from '@vicons/tabler'
import { h } from 'vue'
import type { Component } from 'vue'
import type { TalentNeed } from '@/models/Table'

defineProps<{
  item: TalentNeed
}>()

const emit = defineEmits<{
  action: [action: string, item: TalentNeed]
}>()

function renderIcon(icon: Component) {
  return () => h(NIcon, { size: 18, class: 'text-gray-700 opacity-80' }, { default: () => h(icon) })
}

const handleAction = (action: string, row: TalentNeed) => {
  emit('action', action, row)
}

const createActionOptions = (row: TalentNeed) => [
  {
    label: 'Lihat Detail',
    key: 'detail',
    icon: renderIcon(Eye),
    props: {
      onClick: () => handleAction('detail', row),
    },
  },
  {
    label: 'Edit',
    key: 'edit',
    icon: renderIcon(Edit),
    props: {
      onClick: () => handleAction('edit', row),
    },
  },
  {
    label: 'Hapus',
    key: 'delete',
    icon: renderIcon(Trash),
    props: {
      onClick: () => handleAction('delete', row),
    },
  },
]
</script>

<template>
  <n-dropdown :options="createActionOptions(item)" trigger="click">
    <n-icon
      :component="DotsVertical"
      class="cursor-pointer hover:text-primary-600 transition-colors"
      :size="20"
    />
  </n-dropdown>
</template>
