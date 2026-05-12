<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NIcon, NInput, NModal, NTag, NSpin, NSpace, useMessage } from 'naive-ui'
import { ChevronLeft, Check, CircleX, CalendarEvent } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import {
  useAdminRequest,
  useRejectAdminRequest,
  useValidateAdminRequest,
} from '@/composables/useRequest'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const requestId = computed(() => {
  const params = route.params as Record<string, string | string[]>
  const id = params['id']

  if (Array.isArray(id)) {
    return id[0] || ''
  }

  return id || ''
})

const { request, isLoading, isError, error, refetch } = useAdminRequest(requestId)
const { mutateAsync: validateRequest, isPending: isValidating } = useValidateAdminRequest()
const { mutateAsync: rejectRequest, isPending: isRejecting } = useRejectAdminRequest()

const requestStatus = computed(() => request.value?.status?.toLowerCase() || '')

const showValidateModal = ref(false)
const showRejectModal = ref(false)
const rejectedReason = ref('')

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

// const formatStatusLabel = (status: RequestItem['status']) => {
//   const normalizedStatus = status.toUpperCase()

//   const statusMap: Record<string, string> = {
//     PENDING: 'Menunggu Validasi',
//     ACCEPTED: 'Disetujui',
//     REJECTED: 'Ditolak',
//     PROCESSING: 'Diproses',
//     DONE: 'Selesai',
//   }

//   return statusMap[normalizedStatus] || normalizedStatus
// }

// const formatUrgencyLabel = (urgency: RequestItem['urgency']) => {
//   const urgencyMap: Record<RequestItem['urgency'], string> = {
//     LOW: 'Low',
//     MIDDLE: 'Middle',
//     HIGH: 'High',
//   }

//   return urgencyMap[urgency]
// }

const getTechStackTags = (
  techStack: string | string[] | Record<string, string> | null | undefined,
): string[] => {
  if (!techStack) {
    return []
  }

  try {
    // If it's a string, parse it as JSON
    if (typeof techStack === 'string') {
      const parsed = JSON.parse(techStack)
      // Handle both array and object formats
      if (Array.isArray(parsed)) {
        return parsed
      } else if (typeof parsed === 'object') {
        // If it's an object, extract values
        return Object.values(parsed).filter((v): v is string => typeof v === 'string')
      }
    }
    // If it's already an array
    if (Array.isArray(techStack)) {
      return techStack
    }
    // If it's an object, extract values
    if (typeof techStack === 'object') {
      return Object.values(techStack).filter((v): v is string => typeof v === 'string')
    }
  } catch (err) {
    console.error('Error parsing tech stack:', err)
  }

  return []
}

const handleBack = () => {
  router.push('/admin/talent-needs')
}

const handleValidateClick = () => {
  showValidateModal.value = true
}

const handleRejectClick = () => {
  rejectedReason.value = request.value?.rejected_reason || ''
  showRejectModal.value = true
}

const handleValidate = async () => {
  if (!requestId.value) {
    return
  }

  try {
    await validateRequest(requestId.value)
    message.success('Permintaan berhasil divalidasi.')
    showValidateModal.value = false
    await refetch()
  } catch (err) {
    message.error(err instanceof Error ? err.message : 'Gagal memvalidasi permintaan.')
  }
}

const handleReject = async () => {
  if (!requestId.value) {
    return
  }

  const reason = rejectedReason.value.trim()

  if (!reason) {
    message.warning('Alasan penolakan wajib diisi.')
    return
  }

  try {
    await rejectRequest({
      id: requestId.value,
      payload: { rejected_reason: reason },
    })
    message.success('Permintaan berhasil ditolak.')
    showRejectModal.value = false
    await refetch()
  } catch (err) {
    message.error(err instanceof Error ? err.message : 'Gagal menolak permintaan.')
  }
}
</script>

<template>
  <AdminLayout>
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
        <!-- <n-card :bordered="false" class="rounded-2xl">
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-4">
              <div>
                <p class="text-xs uppercase tracking-wide text-gray-400">Nama Project / Kegiatan</p>
                <h2 class="mt-1 text-xl font-semibold text-gray-800">{{ request.project_name }}</h2>
              </div>

              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-gray-400">Target Pemenuhan</p>
                  <p class="font-medium text-gray-700">{{ formatDate(request.due_date) }}</p>
                </div>
                <div>
                  <p class="text-gray-400">Urgensi</p>
                  <p class="font-medium text-gray-700">{{ formatUrgencyLabel(request.urgency) }}</p>
                </div>
                <div>
                  <p class="text-gray-400">Durasi Project</p>
                  <p class="font-medium text-gray-700">{{ request.project_duration || '-' }}</p>
                </div>
                <div>
                  <p class="text-gray-400">Status</p>
                  <p class="font-medium text-gray-700">{{ formatStatusLabel(request.status) }}</p>
                </div>
                <div>
                  <p class="text-gray-400">PIC HR</p>
                  <p class="font-medium text-gray-700">{{ request.admin_name || '-' }}</p>
                </div>
                <div>
                  <p class="text-gray-400">Jumlah SDM</p>
                  <p class="font-medium text-gray-700">{{ request.required_headcount }}</p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl bg-gray-50 p-5">
              <p class="text-xs uppercase tracking-wide text-gray-400">Alasan Penolakan</p>
              <p class="mt-2 text-sm text-gray-600">
                {{ request.rejected_reason || 'Belum ada alasan penolakan.' }}
              </p>
            </div>
          </div>
        </n-card>

        <n-card :bordered="false" class="rounded-2xl">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-700">Subrequest</h3>
            <div v-if="request.subrequests.length === 0" class="text-sm text-gray-500">
              Belum ada subrequest.
            </div>
            <div
              v-for="subrequest in request.subrequests"
              :key="subrequest.id"
              class="rounded-xl border border-gray-200 p-4"
            >
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <p class="text-xs uppercase tracking-wide text-gray-400">Role</p>
                  <p class="font-medium text-gray-700">{{ subrequest.job_role }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-gray-400">Level</p>
                  <p class="font-medium text-gray-700">{{ subrequest.level || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-gray-400">Tech Stack</p>
                  <p class="font-medium text-gray-700">{{ subrequest.tech_stack }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-gray-400">Status Pemenuhan</p>
                  <p class="font-medium text-gray-700">
                    {{ subrequest.is_filled ? 'Terpenuhi' : 'Belum Terpenuhi' }}
                  </p>
                </div>
                <div class="md:col-span-2">
                  <p class="text-xs uppercase tracking-wide text-gray-400">Notes</p>
                  <p class="font-medium text-gray-700">{{ subrequest.notes || '-' }}</p>
                </div>
                <div v-if="subrequest.overview" class="md:col-span-2">
                  <p class="text-xs uppercase tracking-wide text-gray-400">Overview</p>
                  <p class="font-medium text-gray-700">{{ subrequest.overview }}</p>
                </div>
              </div>
            </div>
          </div>
        </n-card>

        <div class="flex justify-end gap-3">
          <n-button quaternary type="error" @click="handleRejectClick">Tolak Permintaan</n-button>
          <n-button type="primary" @click="handleValidateClick">Validasi Permintaan</n-button>
        </div> -->
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
                <h2 class="text-md font-bold">#{{ index + 1 }}</h2>
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

          <n-card v-if="requestStatus === 'pending'" :bordered="true" size="small">
            <n-space justify="end" class="mx-2 my-3 mb-5 bg-slate-50 p-6">
              <div class="flex justify-end gap-3 bg-slate-50">
                <n-button type="error" @click="handleRejectClick"> Tolak Permintaan </n-button>
                <n-button type="primary" @click="handleValidateClick">Validasi Permintaan</n-button>
              </div>
            </n-space>
          </n-card>
          <n-card v-if="requestStatus === 'rejected'" :bordered="true" size="small">
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

    <n-modal v-model:show="showValidateModal" preset="card" :bordered="false" style="width: 440px">
      <div class="space-y-5 py-2 text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <n-icon :component="Check" size="30" color="#2563EB" />
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-semibold text-gray-800">Validasi Permintaan</h2>
          <p class="text-sm text-gray-500">
            Permintaan ini akan disetujui dan diproses ke tahap berikutnya.
          </p>
        </div>
        <div class="flex justify-center gap-3 pt-2">
          <n-button secondary @click="showValidateModal = false">Batal</n-button>
          <n-button type="primary" :loading="isValidating" @click="handleValidate">
            Validasi
          </n-button>
        </div>
      </div>
    </n-modal>

    <n-modal v-model:show="showRejectModal" preset="card" :bordered="false" style="width: 520px">
      <div class="space-y-5 py-2 text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <n-icon :component="CircleX" size="30" color="#DC2626" />
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-semibold text-gray-800">Tolak Permintaan</h2>
          <p class="text-sm text-gray-500">
            Masukkan alasan penolakan agar dapat diteruskan ke employee.
          </p>
        </div>
        <n-input
          v-model:value="rejectedReason"
          type="textarea"
          placeholder="Tulis alasan penolakan"
          :autosize="{ minRows: 4, maxRows: 6 }"
        />
        <div class="flex justify-center gap-3 pt-2">
          <n-button secondary @click="showRejectModal = false">Batal</n-button>
          <n-button type="error" :loading="isRejecting" @click="handleReject">Tolak</n-button>
        </div>
      </div>
    </n-modal>
  </AdminLayout>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
