<script setup lang="ts">
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { NEmpty, NIcon } from 'naive-ui'
import { Tool } from '@vicons/tabler'
</script>

<template>
  <CandidateLayout>
    <div class="p-12 flex flex-col items-center justify-center min-h-[500px]">
      <n-empty description="Halaman ini sedang dalam pengembangan">
        <template #extra>
          <div class="text-gray-400 text-sm text-center max-w-md">
            Kami sedang bekerja keras untuk menghadirkan fitur ini. Silakan kembali lagi nanti!
          </div>
        </template>
        <template #icon>
          <n-icon size="64" class="text-primary/20">
            <Tool />
          </n-icon>
        </template>
      </n-empty>
    </div>
  </CandidateLayout>
</template>
