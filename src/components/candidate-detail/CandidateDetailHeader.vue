<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { ChevronLeft } from '@vicons/tabler'

defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  (event: 'back'): void
}>()

const handleBack = () => {
  emit('back')
}
</script>

<template>
  <div class="flex items-center justify-between h-12">
    <div class="flex items-center gap-4">
      <div class="flex items-center bg-primary rounded-full p-1">
        <n-button text @click="handleBack">
          <template #icon>
            <n-icon :component="ChevronLeft" :size="16" color="#FFFFFF" />
          </template>
        </n-button>
      </div>

      <h1 class="text-xl font-semibold text-gray-700">{{ title || 'Detail Kandidat' }}</h1>
    </div>
  </div>
</template>
