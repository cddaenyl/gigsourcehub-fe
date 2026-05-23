<script setup lang="ts">
import { NMessageProvider, NDialogProvider } from 'naive-ui'
</script>

<template>
  <n-message-provider placement="top-right">
    <n-dialog-provider>
      <div class="font-family-sans">
        <router-view />
      </div>
    </n-dialog-provider>
  </n-message-provider>
</template>

<style scoped></style>
