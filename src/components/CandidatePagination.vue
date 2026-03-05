<script setup lang="ts">
import { ref } from 'vue'
import { NPagination, NSelect } from 'naive-ui'

const currentPage = defineModel<number>('page', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 10 })

interface Props {
  pageCount: number
}

defineProps<Props>()

const pageSizeOptions = ref([
  { label: '10 / page', value: 10 },
  { label: '20 / page', value: 20 },
  { label: '50 / page', value: 50 }
])
</script>

<template>
  <div class="flex items-center justify-between">
    <n-pagination
      v-model:page="currentPage"
      :page-count="pageCount"
    />

    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">Show:</span>
      <n-select
        v-model:value="pageSize"
        :options="pageSizeOptions"
        class="w-32"
      />
    </div>
  </div>
</template>
