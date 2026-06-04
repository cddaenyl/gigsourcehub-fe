<script setup lang="ts">
import AdminLayout from '@/layouts/AdminLayout.vue'
import NotificationList from '@/components/notifications/NotificationList.vue'
</script>

<template>
  <AdminLayout>
    <div class="h-[calc(100vh-64px)] w-full bg-[#f8fafc]">
      <NotificationList />
    </div>
  </AdminLayout>
</template>
