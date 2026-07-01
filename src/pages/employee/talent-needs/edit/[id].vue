<script setup lang="ts">
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'
import { NIcon, NButton, NSpace } from 'naive-ui'
import { ChevronLeft } from '@vicons/tabler'
import { useRouter, useRoute } from 'vue-router'
import RequestForm from '@/components/talent-needs/RequestForm.vue'

const router = useRouter()
const route = useRoute()
const id = String((route.params as { id?: string }).id || '')

const handleBack = () => router.push('/employee/talent-needs')
</script>

<template>
  <EmployeeLayout class="bg-[#F8FAFC]">
    <n-space vertical size="large" class="m-4">
      <n-space align="center" size="medium">
        <div class="flex items-center rounded-full bg-primary p-1">
          <n-button text @click="handleBack">
            <template #icon>
              <n-icon :component="ChevronLeft" :size="16" color="#FFFFFF" />
            </template>
          </n-button>
        </div>
        <h1 class="text-xl font-semibold text-gray-700">Edit Kebutuhan Talenta</h1>
      </n-space>

      <RequestForm mode="edit" :requestId="id" />
    </n-space>
  </EmployeeLayout>
</template>
