<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'

const activeTab = defineModel<string>({ default: 'semua' })
</script>

<template>
  <n-tabs v-model:value="activeTab" type="line">
    <n-tab-pane name="semua" tab="Semua" />
    <n-tab-pane name="rekrutmen" tab="Rekrutmen" />
    <n-tab-pane name="on-boarding" tab="On-Boarding" />
    <n-tab-pane name="disimpan" tab="Disimpan" />
  </n-tabs>
</template>
