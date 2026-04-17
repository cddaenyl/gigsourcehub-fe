<script setup lang="ts">
import { NMessageProvider } from 'naive-ui'
</script>

<template>
  <n-message-provider placement="top-right">
    <div class="font-family-sans">
      <router-view />
    </div>
  </n-message-provider>
</template>

<style scoped></style>
