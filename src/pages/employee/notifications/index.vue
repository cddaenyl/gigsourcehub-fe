<script setup lang="ts">
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'
import NotificationList from '@/components/notifications/NotificationList.vue'
</script>

<template>
  <EmployeeLayout>
    <div class="h-[calc(100vh-64px)] w-full bg-[#f8fafc]">
      <NotificationList />
    </div>
  </EmployeeLayout>
</template>
