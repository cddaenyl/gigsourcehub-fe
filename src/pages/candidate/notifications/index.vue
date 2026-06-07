<script setup lang="ts">
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import NotificationList from '@/components/notifications/NotificationList.vue'
</script>

<template>
  <CandidateLayout>
    <div class="p-8 pb-32">
      <NotificationList :is-candidate="true" title="Notifications" />
    </div>
  </CandidateLayout>
</template>
