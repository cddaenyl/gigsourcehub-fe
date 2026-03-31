<script setup lang="ts">
import { NCard, NSpace } from 'naive-ui'
</script>

<template>
  <n-space vertical :size="8">
    <n-space vertical :size="2">
      <h4 class="font-bold text-sm text-gray-500">On Boarding History</h4>
      <p class="text-xs text-gray-400">History on boarding kandidat</p>
    </n-space>
    <n-card>
      <h4 class="font-bold text-xs text-gray-500">Belum ada Status (API NOT DEVELOPED)</h4>
    </n-card>
  </n-space>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
