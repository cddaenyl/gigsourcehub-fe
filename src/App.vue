<script setup lang="ts">
import { NMessageProvider, NDialogProvider } from 'naive-ui'
import GlobalWSListener from '@/components/GlobalWSListener.vue'
</script>

<template>
  <n-message-provider placement="top-right">
    <n-dialog-provider>
      <div class="font-family-sans">
        <router-view />
        <GlobalWSListener />
      </div>
    </n-dialog-provider>
  </n-message-provider>
</template>

<style scoped></style>
