<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'

const activeTab = defineModel<string>({ default: 'semua' })
</script>

<template>
  <n-tabs v-model:value="activeTab" type="line">
    <n-tab-pane name="semua" tab="Semua" />
    <n-tab-pane name="menunggu validasi" tab="Menunggu Validasi" />
    <n-tab-pane name="tugas saya" tab="Tugas Saya" />
  </n-tabs>
</template>
