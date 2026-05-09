<script setup lang="ts">
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { NEmpty, NIcon } from 'naive-ui'
import { Bell } from '@vicons/tabler'
</script>

<template>
  <CandidateLayout>
    <div class="p-12 flex flex-col items-center justify-center min-h-[500px]">
      <n-empty description="Fitur Notifikasi sedang dalam pengembangan">
        <template #extra>
          <div class="text-gray-400 text-sm text-center max-w-md">
            Anda akan segera bisa melihat semua notifikasi penting di sini.
          </div>
        </template>
        <template #icon>
          <n-icon size="64" class="text-primary/20">
            <Bell />
          </n-icon>
        </template>
      </n-empty>
    </div>
  </CandidateLayout>
</template>
