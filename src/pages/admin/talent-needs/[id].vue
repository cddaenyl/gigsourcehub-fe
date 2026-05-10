<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NIcon, NInput, NModal, NSpin, useMessage } from 'naive-ui'
import { ChevronLeft, Check, CircleX } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import {
  useAdminRequest,
  useRejectAdminRequest,
  useValidateAdminRequest,
} from '@/composables/useRequest'
import type { RequestItem } from '@/models/Request'

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

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

const formatStatusLabel = (status: RequestItem['status']) => {
  const normalizedStatus = status.toUpperCase()

  const statusMap: Record<string, string> = {
    PENDING: 'Menunggu Validasi',
    ACCEPTED: 'Disetujui',
    REJECTED: 'Ditolak',
    PROCESSING: 'Diproses',
    DONE: 'Selesai',
  }

  return statusMap[normalizedStatus] || normalizedStatus
}

const formatUrgencyLabel = (urgency: RequestItem['urgency']) => {
  const urgencyMap: Record<RequestItem['urgency'], string> = {
    LOW: 'Low',
    MIDDLE: 'Middle',
    HIGH: 'High',
  }

  return urgencyMap[urgency]
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
    <div class="mx-auto space-y-6">
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
        <n-card :bordered="false" class="rounded-2xl">
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
        </div>
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
