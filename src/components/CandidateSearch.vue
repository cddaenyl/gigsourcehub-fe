<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NButton, NIcon, NDrawer, NDrawerContent } from 'naive-ui'
import type { DrawerPlacement } from 'naive-ui'
import { Search, ApiApp, Send } from '@vicons/tabler'

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
          <!-- Search Bar -->
            <n-input
              placeholder="Masukkan pertanyaan atau perintah anda"
              round
              type="textarea"
              size="large"
              style="border-radius: 2rem;"
              class="py-1"
              :autosize="{
                minRows: 1,
                maxRows: 3,
              }"
            >
              <template #suffix>
                <n-button circle type="primary" @click="handleSearch">
                  <template #icon>
                    <n-icon :component="Send" />
                  </template>
                </n-button>
              </template>
            </n-input>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>
