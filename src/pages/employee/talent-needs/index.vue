<script setup lang="ts">
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'
</script>

<template>
  <EmployeeLayout>
    <div class="space-y-6">
      <h1 class="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
      <p class="text-gray-600">Welcome to GigSource Hub Admin Panel</p>

      <!-- Add your dashboard content here -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Dashboard widgets will go here -->
      </div>
    </div>
  </EmployeeLayout>
</template>
