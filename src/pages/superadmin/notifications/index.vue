<script setup lang="ts">
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'
import NotificationList from '@/components/notifications/NotificationList.vue'
</script>

<template>
  <SuperAdminLayout>
    <div class="h-[calc(100vh-64px)] w-full bg-[#f8fafc]">
      <NotificationList />
    </div>
  </SuperAdminLayout>
</template>
