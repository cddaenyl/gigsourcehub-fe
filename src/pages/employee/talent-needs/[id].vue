<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NIcon, NTag, NSpin, NSpace } from 'naive-ui'
import { ChevronLeft, CalendarEvent } from '@vicons/tabler'
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'
import { useAdminRequest } from '@/composables/useRequest'

const route = useRoute()
const router = useRouter()

const requestId = computed(() => {
  const params = route.params as Record<string, string | string[]>
  const id = params['id']

  if (Array.isArray(id)) {
    return id[0] || ''
  }

  return id || ''
})

const { request, isLoading, isError, error } = useAdminRequest(requestId)

const formatDate = (value: string | null) => {
  if (!value) {
    return '-'
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate)
}

const getTechStackTags = (
  techStack: string | string[] | Record<string, string> | null | undefined,
): string[] => {
  if (!techStack) {
    return []
  }

  try {
    if (typeof techStack === 'string') {
      const parsed = JSON.parse(techStack)
      if (Array.isArray(parsed)) {
        return parsed
      }
      if (typeof parsed === 'object') {
        return Object.values(parsed).filter((v): v is string => typeof v === 'string')
      }
    }

    if (Array.isArray(techStack)) {
      return techStack
    }

    if (typeof techStack === 'object') {
      return Object.values(techStack).filter((v): v is string => typeof v === 'string')
    }
  } catch (err) {
    console.error('Error parsing tech stack:', err)
  }

  return []
}

const handleBack = () => {
  router.push('/employee/talent-needs')
}
</script>

<template>
  <EmployeeLayout>
    <div class="mx-auto space-y-8 py-3 px-2">
      <div class="flex items-center gap-4">
        <div class="flex items-center rounded-full bg-primary p-1">
          <n-button text @click="handleBack">
            <template #icon>
              <n-icon :component="ChevronLeft" :size="16" color="#FFFFFF" />
            </template>
          </n-button>
        </div>
        <h1 class="text-2xl font-bold text-gray-700">Detail Permintaan Talenta</h1>
      </div>

      <div v-if="isLoading" class="flex justify-center py-20">
        <n-spin size="large" />
      </div>

      <div v-else-if="isError" class="py-20 text-center">
        <p class="text-red-500">{{ error?.message || 'Gagal memuat detail permintaan.' }}</p>
        <n-button type="primary" class="mt-4" @click="handleBack">Kembali</n-button>
      </div>

      <div v-else-if="request" class="space-y-6">
        <n-space vertical class="mx-8 mt-4">
          <h2 class="text-base font-semibold text-gray-600">Informasi Project</h2>
          <n-card :bordered="true" size="small">
            <n-space vertical size="large" class="mx-2 my-3 mb-5">
              <div class="space-y-5">
                <n-space vertical :size="4">
                  <h3 class="text-xs font-semibold text-gray-500">Nama Project / Kegiatan</h3>
                  <p class="text-gray-700 text-sm font-normal leading-5 px-2 py-2">
                    {{ request.project_name }}
                  </p>
                </n-space>

                <n-space vertical :size="4">
                  <h3 class="text-xs font-semibold text-gray-500">Durasi Project</h3>
                  <p class="text-gray-700 text-sm font-normal leading-5 px-2 py-2">
                    {{ request.project_duration || '-' }}
                  </p>
                </n-space>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <n-space vertical :size="4">
                    <h3 class="text-xs font-semibold text-gray-500">Tingkat Urgensi</h3>
                    <p class="text-gray-700 text-sm font-normal leading-5 px-2 py-2">
                      {{ request.urgency || '-' }}
                    </p>
                  </n-space>

                  <n-space vertical :size="4">
                    <h3 class="text-xs font-semibold text-gray-500">Target Pemenuhan</h3>
                    <div class="flex items-center">
                      <n-icon :component="CalendarEvent" :size="20" color="#64748B" />
                      <p class="text-gray-700 text-sm font-normal leading-5 px-2 py-2">
                        {{ formatDate(request.due_date) || '-' }}
                      </p>
                    </div>
                  </n-space>
                </div>

                <n-space vertical :size="4">
                  <h3 class="text-xs font-semibold text-gray-500">Status</h3>
                  <p class="text-gray-700 text-sm font-normal leading-5 px-2 py-2">
                    {{ request.status || '-' }}
                  </p>
                </n-space>
              </div>
            </n-space>
          </n-card>

          <n-space align="center" justify="space-between" class="mt-2">
            <h2 class="text-base font-semibold text-gray-600">Detail Posisi yang Dibutuhkan</h2>
          </n-space>

          <div class="space-y-4">
            <div v-if="request.subrequests.length === 0" class="text-sm text-gray-500">
              Belum ada subrequest.
            </div>
            <n-card
              v-for="(subrequest, index) in request.subrequests"
              :key="subrequest.id"
              :bordered="false"
            >
              <div class="flex flex-col space-y-5">
                <div class="flex justify-between items-center">
                  <h2 class="text-md font-bold">#{{ index + 1 }}</h2>
                </div>
                <n-space vertical :size="4">
                  <h3 class="text-xs font-semibold text-gray-500">Nama Posisi</h3>
                  <p class="text-gray-700 text-sm font-normal leading-5 px-2 py-2">
                    {{ subrequest.job_role || '-' }}
                  </p>
                </n-space>
                <n-space vertical :size="4">
                  <h3 class="text-xs font-semibold text-gray-500">Gambaran Umum Posisi</h3>
                  <p class="text-gray-700 text-sm font-normal leading-5 px-2 py-2">
                    {{ subrequest.overview || '-' }}
                  </p>
                </n-space>
                <n-space vertical :size="4">
                  <h3 class="text-xs font-semibold text-gray-500">Keahlian / Tech Stack</h3>
                  <div
                    v-if="getTechStackTags(subrequest.tech_stack).length > 0"
                    class="mt-1 flex flex-wrap gap-2"
                  >
                    <n-tag
                      v-for="tag in getTechStackTags(subrequest.tech_stack)"
                      :key="tag"
                      round
                      :color="{ color: '#C7D0F3', textColor: '#07229E' }"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                  <p v-else class="text-gray-500 text-sm">-</p>
                </n-space>
                <n-space vertical :size="4">
                  <h3 class="text-xs font-semibold text-gray-500">Level Senioritas</h3>
                  <p class="text-gray-700 text-sm font-normal leading-5 px-2 py-2">
                    {{ subrequest.level || '-' }}
                  </p>
                </n-space>
                <n-space vertical :size="4">
                  <h3 class="text-xs font-semibold text-gray-500">Status Terpenuhi</h3>
                  <p class="text-gray-700 text-sm font-normal leading-5 px-2 py-2">
                    {{ subrequest.is_filled ? 'Terpenuhi' : 'Belum Terpenuhi' }}
                  </p>
                </n-space>
                <n-space vertical :size="4">
                  <h3 class="text-xs font-semibold text-gray-500">Catatan</h3>
                  <div class="flex min-h-20">
                    <p class="text-gray-700 text-sm font-normal leading-5 px-2 py-2 min-h-6">
                      {{ subrequest.notes || '-' }}
                    </p>
                  </div>
                </n-space>
              </div>
            </n-card>
          </div>

          <n-card v-if="request.status?.toLowerCase() === 'rejected'" :bordered="true" size="small">
            <n-space justify="start" class="mx-2 my-3 mb-5 bg-slate-50 p-6">
              <div class="flex flex-col justify-start gap-3 bg-slate-50">
                <h3 class="text-xs font-semibold text-red-400">Alasan Penolakan</h3>
                <p class="text-gray-700 text-sm font-normal leading-5 px-2 py-2">
                  {{ request.rejected_reason || 'Belum ada alasan penolakan.' }}
                </p>
              </div>
            </n-space>
          </n-card>
        </n-space>
      </div>
    </div>
  </EmployeeLayout>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
