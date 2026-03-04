<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NButton, NIcon, NDrawer, NDrawerContent } from 'naive-ui'
import type { DrawerPlacement } from 'naive-ui'
import { Search, ApiApp } from '@vicons/tabler'

const searchValue = ref('')
const active = ref(false)
const placement = ref<DrawerPlacement>('right')

const emit = defineEmits<{
  search: [value: string]
}>()

const handleSearch = () => {
  emit('search', searchValue.value)
}

const activate = (place: DrawerPlacement) => {
  active.value = true
  placement.value = place
}
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Search Bar -->
    <n-input
      v-model:value="searchValue"
      placeholder="Cari kandidat"
      class="w-80"
      @keyup.enter="handleSearch"
    >
      <template #prefix>
        <n-icon :component="Search" />
      </template>
    </n-input>

    <!-- AI Assistant Button -->
    <n-button type="primary" @click="activate('right')">
      <template #icon>
        <n-icon :component="ApiApp" />
      </template>
      AI Assistant
    </n-button>
    <n-drawer v-model:show="active" :width="502">
      <n-drawer-content closable>
        <template #header >
          <div class="flex space-x-4">
            <img src="../assets/AI.svg" alt="AI logo">
            <h3 class="text-lg font-semibold">AI Assistant</h3>
          </div>
        </template>
        <template #footer>
          <n-button>Footer</n-button>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>
