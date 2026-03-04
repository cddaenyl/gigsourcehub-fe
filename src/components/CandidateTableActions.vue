<script setup lang="ts">
import { NDropdown, NIcon } from 'naive-ui'
import { DotsVertical, Eye, UserSearch, MessageCircle2 } from '@vicons/tabler'
import { h } from 'vue'
import type { Component } from 'vue'

interface Candidate {
  no: number
  nama: string
  bidang: string
  appliedRole: string
  level: string
  status: string
}

defineProps<{
  candidate: Candidate
}>()

function renderIcon(icon: Component) {
  return () => h(NIcon, { size: 24, class: 'text-gray-700 opacity-80' }, { default: () => h(icon) })
}

const emit = defineEmits<{
  action: [action: string, candidate: Candidate]
}>()

const createActionOptions = (row: Candidate) => [
  {
    label: 'Lihat Detail',
    key: 'detail',
    icon: renderIcon(Eye),
    props: {
      onClick: () => handleAction('detail', row)
    }
  },
  {
    label: 'Rekrut Kandidat',
    key: 'recruit',
    icon: renderIcon(UserSearch),
    props: {
      onClick: () => handleAction('recruit', row)
    }
  },
  {
    label: 'Chat',
    key: 'chat',
    icon: renderIcon(MessageCircle2),
    props: {
      onClick: () => handleAction('chat', row)
    }
  }
]

const handleAction = (action: string, row: Candidate) => {
  emit('action', action, row)
}
</script>

<template>
  <n-dropdown :options="createActionOptions(candidate)" trigger="click">
    <n-icon
      :component="DotsVertical"
      class="cursor-pointer hover:text-primary-600 transition-colors"
      :size="20"
    />
  </n-dropdown>
</template>
