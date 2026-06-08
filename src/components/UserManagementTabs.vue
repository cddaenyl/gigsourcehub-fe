<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'

const activeTab = defineModel<string>({ default: 'Admin' })
</script>

<template>
  <n-tabs v-model:value="activeTab" type="line">
    <n-tab-pane name="Admin" tab="Admin" />
    <n-tab-pane name="Employee" tab="Pegawai" />
    <n-tab-pane name="Candidate" tab="Kandidat" />
    <n-tab-pane name="Unverified" tab="Unverified" />
  </n-tabs>
</template>
