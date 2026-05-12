<script setup lang="ts">
import { NDropdown, NIcon } from 'naive-ui'
import { DotsVertical, Eye, Edit, Trash, Check } from '@vicons/tabler'
import { h } from 'vue'
import type { Component } from 'vue'
import type { TalentNeed } from '@/models/Table'

type TalentNeedActionKey = 'detail' | 'edit' | 'delete' | 'validate'

const props = withDefaults(
  defineProps<{
    item: TalentNeed
    actions?: TalentNeedActionKey[]
  }>(),
  {
    actions: () => ['detail', 'edit', 'delete'],
  },
)

const emit = defineEmits<{
  action: [action: string, item: TalentNeed]
}>()

function renderIcon(icon: Component) {
  return () => h(NIcon, { size: 18, class: 'text-gray-700 opacity-80' }, { default: () => h(icon) })
}

const handleAction = (action: string, row: TalentNeed) => {
  emit('action', action, row)
}

const actionOptionMap: Record<TalentNeedActionKey, { label: string; icon: Component }> = {
  detail: {
    label: 'Lihat Detail',
    icon: Eye,
  },
  edit: {
    label: 'Edit',
    icon: Edit,
  },
  delete: {
    label: 'Hapus',
    icon: Trash,
  },
  validate: {
    label: 'Validasi',
    icon: Check,
  },
}

const createActionOptions = (row: TalentNeed) => {
  return props.actions
    .filter((action) => action in actionOptionMap)
    .map((action) => ({
      label: actionOptionMap[action].label,
      key: action,
      icon: renderIcon(actionOptionMap[action].icon),
      props: {
        onClick: () => handleAction(action, row),
      },
    }))
}
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
