<script setup lang="ts">
import { computed, ref, unref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/composables/useUser'
import { useActiveSubrequest } from '@/composables/useActiveSubrequest'
import { useAdminMyRequests, useAssignCandidateToSubrequest } from '@/composables/useRequest'
import { useCandidateOnboardingHistory } from '@/composables/useOnboarding'
import { useStartChat } from '@/composables/useChat'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidateDetailHeader from '@/components/candidate-detail/CandidateDetailHeader.vue'
import CandidateProfileCard from '@/components/candidate-detail/CandidateProfileCard.vue'
import CandidateInfoCard from '@/components/candidate-detail/CandidateInfoCard.vue'
import CandidateRecruitmentPanel from '@/components/candidate-detail/CandidateRecruitmentPanel.vue'
import CandidateOnboardingHistory from '@/components/candidate-detail/CandidateOnboardingHistory.vue'
import {
  NButton,
  NSpin,
  NGrid,
  NGi,
  NModal,
  NSelect,
  NDatePicker,
  NSpace,
  NIcon,
  useMessage,
  type SelectOption,
} from 'naive-ui'
import { useRecruitmentStatuses } from '@/composables/useRecruitmentStatuses'
import { buildMasterDataOptions } from '@/utils/masterDataOptions'
import type { UserRecruitmentStatusPayload } from '@/models/User'
import type { RequestQueryParams } from '@/models/Request'
import { useCandidateNotesStore } from '@/stores/notes.store'
import { Alarm, AlertTriangle, Checkbox, CircleX, Plane } from '@vicons/tabler'
const route = useRoute()
const router = useRouter()
const message = useMessage()

const userId = computed((): string => {
  const params = route.params as Record<string, string | string[]>
  const id = params['id']
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

const levelOptions: SelectOption[] = [
  {
    label: 'Junior',
    value: 'Junior',
  },
  {
    label: 'Middle',
    value: 'Middle',
  },
  {
    label: 'Senior',
    value: 'Senior',
  },
  {
    label: 'In-Eligible',
    value: 'Ineligible',
  },
]

const { recruitmentStatuses } = useRecruitmentStatuses()
const recruitmentOptions = computed<SelectOption[]>(() =>
  buildMasterDataOptions(recruitmentStatuses.value),
)

// Fetch user data
const {
  user,
  isLoading,
  isError,
  error,
  refetch: refetchUser,
  updateRecruitmentStatus,
  isUpdatingRecruitmentStatus,
  cancelRecruitment,
  isCancellingRecruitment,
  confirmDecline,
  isConfirmingDecline,
  stopOnboarding,
  isStoppingOnboarding,
  finalizeRecruitment,
  isFinalizingRecruitment,
} = useUser(userId)
const {
  activeSubrequest,
  isLoading: isActiveSubrequestLoading,
  refetch: refetchActiveSubrequest,
} = useActiveSubrequest(userId)
const { history: onboardingHistory } = useCandidateOnboardingHistory(userId)

const recruitModalVisible = ref(false)
const chatModalVisible = ref(false)
const cancelRecruitmentModalVisible = ref(false)
const stopOnboardingModalVisible = ref(false)
const declineConfirmationModalVisible = ref(false)
const finalizeModalVisible = ref(false)
const finalizeStartDate = ref<string | null>(null)
const finalizeEndDate = ref<string | null>(null)
const finalizeFeedbackVisible = ref(false)
const finalizeFeedbackType = ref<'success' | 'error'>('success')
const finalizeFeedbackDetail = ref('')
const selectedRequestId = ref<string | null>(null)
const selectedSubrequestId = ref<string | null>(null)
const assignedPairKeys = ref<string[]>([])

const myRequestsParams = computed<RequestQueryParams>(() => ({
  page: 1,
  limit: 100,
}))

const {
  requests: myRequests,
  isLoading: isMyRequestsLoading,
  refetch: refetchMyRequests,
} = useAdminMyRequests(myRequestsParams)
const { mutateAsync: assignCandidateToSubrequest, isPending: isAssigningCandidate } =
  useAssignCandidateToSubrequest()
const { mutateAsync: startChat, isPending: isStartingChat } = useStartChat()

const notesStore = useCandidateNotesStore()
const notes = computed(() => notesStore.sortedNotes)
const isNotesLoading = computed(() => notesStore.isLoading)
const isNotesPosting = computed(() => notesStore.isPosting)
const notesError = computed(() => notesStore.error)

const optimisticLevel = ref<string | null>(null)
const optimisticStatus = ref<string | null>(null)

const displayedLevel = computed(() => optimisticLevel.value ?? user.value?.candidate_level ?? null)
const displayedStatus = computed(
  () => optimisticStatus.value ?? user.value?.recruitment_status_id ?? null,
)
const currentOnboarding = computed(() => unref(onboardingHistory)[0] ?? null)

const formatOnboardingDate = (value: string | null | undefined): string => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const requestOptions = computed<SelectOption[]>(() =>
  myRequests.value.map((request) => ({
    label: request.project_name,
    value: request.id,
  })),
)

const selectedRequest = computed(
  () => myRequests.value.find((request) => request.id === selectedRequestId.value) || null,
)

const subrequestOptions = computed<SelectOption[]>(() => {
  if (!selectedRequest.value) {
    return []
  }

  const totalPerJobRole = new Map<string, number>()
  const seenPerJobRole = new Map<string, number>()

  for (const subrequest of selectedRequest.value.subrequests) {
    totalPerJobRole.set(
      subrequest.job_role_id,
      (totalPerJobRole.get(subrequest.job_role_id) || 0) + 1,
    )
  }

  return selectedRequest.value.subrequests.map((subrequest) => {
    const currentIndex = (seenPerJobRole.get(subrequest.job_role_id) || 0) + 1
    seenPerJobRole.set(subrequest.job_role_id, currentIndex)

    const hasDuplicateJobRole = (totalPerJobRole.get(subrequest.job_role_id) || 0) > 1
    const suffix = hasDuplicateJobRole ? ` #${currentIndex}` : ''

    return {
      label: `${subrequest.job_role}${suffix}`,
      value: subrequest.id,
    }
  })
})

const buildAssignmentPairKey = (
  candidateId: string,
  requestId: string,
  subrequestId: string,
): string => `${candidateId}:${requestId}:${subrequestId}`

const isDuplicateAssignment = computed((): boolean => {
  if (!user.value?.id || !selectedRequestId.value || !selectedSubrequestId.value) {
    return false
  }

  const pairKey = buildAssignmentPairKey(
    user.value.id,
    selectedRequestId.value,
    selectedSubrequestId.value,
  )

  return assignedPairKeys.value.includes(pairKey)
})

const canSubmitAssignment = computed(
  (): boolean =>
    Boolean(selectedRequestId.value && selectedSubrequestId.value) &&
    !isDuplicateAssignment.value &&
    !isAssigningCandidate.value,
)

const startDateError = computed((): string => {
  if (!finalizeStartDate.value) return 'Tanggal mulai wajib diisi.'
  return ''
})

const endDateError = computed((): string => {
  if (!finalizeEndDate.value) return 'Tanggal berakhir wajib diisi.'
  if (finalizeStartDate.value && finalizeEndDate.value < finalizeStartDate.value) {
    return 'Tanggal berakhir harus setelah tanggal mulai.'
  }
  return ''
})

const canSubmitFinalize = computed((): boolean => {
  return (
    Boolean(user.value?.id && activeSubrequest.value?.subrequest_id) &&
    !startDateError.value &&
    !endDateError.value &&
    !isFinalizingRecruitment.value
  )
})

watch(userId, (): void => {
  optimisticLevel.value = null
  optimisticStatus.value = null
  assignedPairKeys.value = []
})

watch(selectedRequestId, (): void => {
  selectedSubrequestId.value = null
})

watch(
  userId,
  async (id: string): Promise<void> => {
    notesStore.reset()
    if (!id) return
    try {
      await notesStore.fetchNotes(id)
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Gagal memuat catatan.'
      message.error(messageText, { duration: 3000 })
    }
  },
  { immediate: true },
)

watch(
  () => ({ level: user.value?.candidate_level, status: user.value?.recruitment_status_id }),
  ({ level: nextLevel, status: nextStatus }): void => {
    if (nextLevel === optimisticLevel.value && nextStatus === optimisticStatus.value) {
      optimisticLevel.value = null
      optimisticStatus.value = null
    }
  },
)

// Handlers
const handleBack = (): void => {
  router.push('/admin/daftar-kandidat')
}

const handleRecruit = (): void => {
  selectedRequestId.value = null
  selectedSubrequestId.value = null
  recruitModalVisible.value = true
}

const handleStartChat = (): void => {
  chatModalVisible.value = true
}

const handleCancelRecruitmentClick = (): void => {
  cancelRecruitmentModalVisible.value = true
}

const handleStopOnboardingClick = (): void => {
  stopOnboardingModalVisible.value = true
}

const closeStopOnboardingModal = (): void => {
  stopOnboardingModalVisible.value = false
}

const handleConfirmStopOnboarding = async (): Promise<void> => {
  if (!user.value?.id) return

  try {
    await stopOnboarding()
    message.success('Onboarding kandidat berhasil dihentikan.', { duration: 2000 })
    stopOnboardingModalVisible.value = false
    await Promise.all([refetchUser(), refetchMyRequests(), refetchActiveSubrequest()])
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal menghentikan onboarding.'
    message.error(messageText, { duration: 3000 })
  }
}

const handleDeclineConfirmationClick = (): void => {
  declineConfirmationModalVisible.value = true
}

const closeDeclineConfirmationModal = (): void => {
  declineConfirmationModalVisible.value = false
}

const openFinalizeModal = (): void => {
  if (!activeSubrequest.value?.subrequest_id) {
    finalizeFeedbackType.value = 'error'
    finalizeFeedbackDetail.value = 'Subrequest aktif belum tersedia untuk kandidat ini.'
    finalizeFeedbackVisible.value = true
    return
  }
  finalizeModalVisible.value = true
}

const closeFinalizeModal = (): void => {
  finalizeModalVisible.value = false
  resetFinalizeForm()
}

const closeFinalizeFeedback = (): void => {
  finalizeFeedbackVisible.value = false
}

const resetFinalizeForm = (): void => {
  finalizeStartDate.value = null
  finalizeEndDate.value = null
}

const handleSaveRecruitment = async (payload: UserRecruitmentStatusPayload): Promise<void> => {
  try {
    const response = await updateRecruitmentStatus(payload)
    optimisticLevel.value = response.data.candidate_level ?? null
    optimisticStatus.value = response.data.recruitment_status_id ?? null
    message.success(response.message || 'Status rekrutmen berhasil diperbarui.', {
      duration: 2500,
    })
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal memperbarui status.'
    message.error(messageText, { duration: 3000 })
  }
}

const handleSendNote = async (payload: { text: string }): Promise<void> => {
  if (!userId.value) return
  try {
    await notesStore.createNote(userId.value, payload.text)
    message.success('Catatan berhasil ditambahkan.', { duration: 2000 })
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal menambahkan catatan.'
    message.error(messageText, { duration: 3000 })
  }
}

const closeRecruitModal = (): void => {
  recruitModalVisible.value = false
  selectedRequestId.value = null
  selectedSubrequestId.value = null
}

const closeChatModal = (): void => {
  chatModalVisible.value = false
  void Promise.all([refetchUser(), refetchMyRequests(), refetchActiveSubrequest()])
}

const closeCancelRecruitmentModal = (): void => {
  cancelRecruitmentModalVisible.value = false
}

const handleConfirmCancelRecruitment = async (): Promise<void> => {
  if (!user.value?.id) return

  try {
    await cancelRecruitment()
    message.success('Rekrutmen kandidat berhasil dibatalkan.', { duration: 2000 })
    cancelRecruitmentModalVisible.value = false
    await Promise.all([refetchUser(), refetchMyRequests(), refetchActiveSubrequest()])
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal membatalkan rekrutmen.'
    message.error(messageText, { duration: 3000 })
  }
}

const handleConfirmDecline = async (): Promise<void> => {
  if (!user.value?.id) return

  try {
    await confirmDecline()
    message.success('Konfirmasi penolakan kandidat berhasil disimpan.', { duration: 2000 })
    declineConfirmationModalVisible.value = false
    await Promise.all([refetchUser(), refetchMyRequests(), refetchActiveSubrequest()])
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal mengonfirmasi penolakan.'
    message.error(messageText, { duration: 3000 })
  }
}

const handleStartChatConfirm = async (): Promise<void> => {
  if (!user.value?.id) {
    return
  }

  const latestActiveSubrequest = await refetchActiveSubrequest()
  const activeSubrequestId =
    latestActiveSubrequest.data?.data?.subrequest_id ?? activeSubrequest.value?.subrequest_id

  if (!activeSubrequestId) {
    message.error('Subrequest aktif belum tersedia. Pastikan kandidat sudah di-assign.', {
      duration: 3000,
    })
    return
  }

  try {
    const result = await startChat({
      candidate_user_id: user.value.id,
      subrequest_id: activeSubrequestId,
    })

    chatModalVisible.value = false
    // Navigate directly to the chat room
    router.push({ path: '/admin/candidate-chat', query: { conversation_id: result.data.id } })
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal memulai chat dengan kandidat.'
    message.error(messageText, { duration: 3000 })
  }
}

const handleFinalizeRecruitment = async (): Promise<void> => {
  if (!user.value?.id || !activeSubrequest.value?.subrequest_id) {
    return
  }

  if (!canSubmitFinalize.value) {
    return
  }

  try {
    await finalizeRecruitment({
      candidate_user_id: user.value.id,
      start_date: finalizeStartDate.value as string,
      end_date: finalizeEndDate.value as string,
      subrequest_id: activeSubrequest.value.subrequest_id,
    })

    finalizeFeedbackType.value = 'success'
    finalizeFeedbackDetail.value = 'Kontrak kandidat berhasil difinalisasi.'
    finalizeFeedbackVisible.value = true
    finalizeModalVisible.value = false
    resetFinalizeForm()
    await Promise.all([refetchUser(), refetchActiveSubrequest()])
  } catch (err) {
    finalizeFeedbackType.value = 'error'
    finalizeFeedbackDetail.value =
      err instanceof Error ? err.message : 'Kontrak kandidat gagal difinalisasi.'
    finalizeFeedbackVisible.value = true
  }
}

const handleAssignCandidate = async (): Promise<void> => {
  if (!user.value?.id || !selectedRequestId.value || !selectedSubrequestId.value) {
    return
  }

  if (isDuplicateAssignment.value) {
    message.warning('Kandidat sudah pernah di-assign ke subrequest ini pada sesi saat ini.')
    return
  }

  try {
    await assignCandidateToSubrequest({
      requestId: selectedRequestId.value,
      subrequestId: selectedSubrequestId.value,
      payload: { candidate_user_id: user.value.id },
    })

    const pairKey = buildAssignmentPairKey(
      user.value.id,
      selectedRequestId.value,
      selectedSubrequestId.value,
    )

    if (!assignedPairKeys.value.includes(pairKey)) {
      assignedPairKeys.value = [...assignedPairKeys.value, pairKey]
    }

    // Close recruit modal and show chat modal
    recruitModalVisible.value = false
    message.success('Kandidat berhasil di-assign ke permintaan.')
    await Promise.all([refetchUser(), refetchMyRequests(), refetchActiveSubrequest()])
    chatModalVisible.value = true
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal meng-assign kandidat.'
    message.error(messageText, { duration: 3000 })
  }
}
</script>

<template>
  <AdminLayout>
    <div class="mx-auto space-y-6">
      <CandidateDetailHeader @back="handleBack" />

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <n-spin size="large" />
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="text-center py-20">
        <p class="text-red-500">{{ error?.message || 'Failed to load candidate data' }}</p>
        <n-button type="primary" @click="handleBack" class="mt-4">
          Kembali ke Daftar Kandidat
        </n-button>
      </div>

      <!-- Content -->
      <div v-else-if="user" class="space-y-2">
        <CandidateProfileCard
          :user="user"
          @recruit="handleRecruit"
          @start-chat="handleStartChat"
          @cancel-recruitment="handleCancelRecruitmentClick"
        />
        <div
          v-if="activeSubrequest && user.recruitment_status_name === 'Accepted'"
          class="flex text-emerald-700 border-l-3 bg-slate-200 items-center px-2 py-1.5 rounded-sm gap-1 justify-between"
        >
          <div class="flex space-x-1">
            <n-icon size="14" :component="Plane" style="font-weight: bold" />
            <h2 class="text-xs italic font-normal">
              Onboarding sebagai
              <span class="font-semibold"
                >{{ currentOnboarding?.job_role_name }} - {{ currentOnboarding?.project_name }} ({{
                  formatOnboardingDate(currentOnboarding?.start_date)
                }}
                - {{ formatOnboardingDate(currentOnboarding?.end_date) }})</span
              >
            </h2>
          </div>
          <n-button type="error" size="tiny" @click="handleStopOnboardingClick">
            Berhentikan
          </n-button>
        </div>
        <div
          v-else-if="activeSubrequest && user.recruitment_status_name === 'Decline'"
          class="flex text-red-500 border-l-3 bg-red-50 items-center px-2 py-1.5 rounded-sm gap-1 justify-between"
        >
          <div class="flex space-x-1">
            <n-icon size="14" :component="AlertTriangle" style="font-weight: bold" />
            <h2 class="text-xs italic font-normal">
              Kandidat menolak proses rekrutmen
              <span class="font-semibold"
                >{{ activeSubrequest?.job_role }} - {{ activeSubrequest?.project_name }}</span
              >
            </h2>
          </div>
          <n-button type="error" size="tiny" @click="handleDeclineConfirmationClick">
            Konfirmasi
          </n-button>
        </div>
        <div
          v-else-if="activeSubrequest"
          class="flex text-primary border-l-3 bg-slate-200 items-center px-2 py-1.5 rounded-sm gap-1"
        >
          <n-icon size="14" :component="Checkbox" style="font-weight: bold" />
          <h2 class="text-xs italic font-normal">
            Dalam Proses Rekrutmen
            <span class="font-semibold"
              >{{ activeSubrequest?.project_name }} - {{ activeSubrequest?.job_role }}</span
            >
          </h2>
        </div>
        <div
          v-else-if="!isActiveSubrequestLoading && !activeSubrequest"
          class="flex text-slate-500 border-l-3 bg-slate-200 items-center px-2 py-1.5 rounded-sm gap-1"
        >
          <n-icon size="14" :component="Alarm" style="font-weight: bold" />
          <h2 class="text-xs italic font-normal">
            Belum direkrut untuk posisi atau proyek apa pun.
          </h2>
        </div>
        <n-grid :x-gap="8" :cols="2" item-responsive>
          <n-gi>
            <CandidateInfoCard :user="user" />
          </n-gi>

          <n-gi>
            <CandidateRecruitmentPanel
              :level-options="levelOptions"
              :recruitment-options="recruitmentOptions"
              :initial-level="displayedLevel"
              :initial-status="displayedStatus"
              :is-saving="isUpdatingRecruitmentStatus"
              :is-finalizing="isFinalizingRecruitment"
              :notes="notes"
              :notes-loading="isNotesLoading"
              :notes-posting="isNotesPosting"
              :notes-error="notesError"
              :user="user"
              @save="handleSaveRecruitment"
              @send-note="handleSendNote"
              @finalize="openFinalizeModal"
              @cancel-recruitment="handleCancelRecruitmentClick"
            />
          </n-gi>
        </n-grid>
        <CandidateOnboardingHistory
          :user-id="user.id"
          review-detail-base-path="/admin/daftar-kandidat/penilaian-kandidat"
          :allow-create-review="false"
        />
      </div>
    </div>

    <n-modal
      v-model:show="recruitModalVisible"
      preset="card"
      :bordered="false"
      style="width: 40rem"
    >
      <div class="">
        <div>
          <h2 class="text-lg font-semibold text-gray-800 -mt-8">Assign Kandidat ke Permintaan</h2>
          <p class="text-sm text-slate-500">Tentukan permintaan rekrutmen untuk kandidat ini.</p>
        </div>

        <n-space vertical :size="16" class="my-6">
          <div class="space-y-1">
            <h3 class="text-xs font-semibold text-slate-500">Permintaan</h3>
            <n-select
              v-model:value="selectedRequestId"
              placeholder="Pilih permintaan"
              :options="requestOptions"
              :loading="isMyRequestsLoading"
              filterable
              clearable
            />
          </div>

          <div class="space-y-1">
            <h3 class="text-xs font-semibold text-slate-500">Posisi</h3>
            <n-select
              v-model:value="selectedSubrequestId"
              placeholder="Pilih posisi"
              :options="subrequestOptions"
              :disabled="!selectedRequestId"
              filterable
              clearable
            />
          </div>
        </n-space>

        <div class="-mx-6 -mb-6 bg-slate-100 px-6 py-5">
          <div class="flex justify-center gap-3">
            <n-button secondary @click="closeRecruitModal">Batal</n-button>
            <n-button
              type="primary"
              :loading="isAssigningCandidate"
              :disabled="!canSubmitAssignment"
              @click="handleAssignCandidate"
            >
              Simpan
            </n-button>
          </div>
        </div>
      </div>
    </n-modal>

    <n-modal
      v-model:show="stopOnboardingModalVisible"
      preset="card"
      :bordered="false"
      :closable="false"
      style="width: 28rem"
    >
      <div class="flex flex-col items-center text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <n-icon size="32" :component="CircleX" />
        </div>

        <h2 class="mt-5 text-2xl font-semibold text-slate-800">Berhentikan Kandidat</h2>
        <p class="mt-3 text-sm leading-6 text-slate-500">
          Tindakan ini akan menghentikan status onboarding kandidat dan tidak bisa dibatalkan.
        </p>

        <div class="mt-8 flex justify-center gap-3">
          <n-button secondary :disabled="isStoppingOnboarding" @click="closeStopOnboardingModal">
            Tutup
          </n-button>
          <n-button
            type="error"
            :loading="isStoppingOnboarding"
            :disabled="isStoppingOnboarding"
            @click="handleConfirmStopOnboarding"
          >
            Berhentikan
          </n-button>
        </div>
      </div>
    </n-modal>

    <n-modal
      v-model:show="declineConfirmationModalVisible"
      preset="card"
      :bordered="false"
      :closable="false"
      style="width: 28rem"
    >
      <div class="flex flex-col items-center text-center">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600"
        >
          <n-icon size="32" :component="AlertTriangle" />
        </div>

        <h2 class="mt-5 text-2xl font-semibold text-slate-800">Konfirmasi Penolakan</h2>
        <p class="mt-3 text-sm leading-6 text-slate-500">
          Apakah Anda yakin ingin mengonfirmasi penolakan kandidat ini?
        </p>

        <div class="mt-8 flex justify-center gap-3">
          <n-button
            secondary
            :disabled="isConfirmingDecline"
            @click="closeDeclineConfirmationModal"
          >
            Batal
          </n-button>
          <n-button
            type="error"
            :loading="isConfirmingDecline"
            :disabled="isConfirmingDecline"
            @click="handleConfirmDecline"
          >
            Konfirmasi
          </n-button>
        </div>
      </div>
    </n-modal>

    <n-modal
      v-model:show="chatModalVisible"
      preset="card"
      :bordered="false"
      :close-on-esc="false"
      :mask-closable="false"
      style="width: 30rem"
    >
      <div class="flex flex-col">
        <div class="flex justify-center items-center">
          <h2 class="text-lg font-semibold text-gray-800 -mt-8">Kandidat Berhasil di-Assign</h2>
        </div>

        <div class="flex flex-col text-center mb-6 rounded-md px-4 py-3 text-sm text-slate-600">
          <p class="text-sm text-slate-600">Kandidat telah dihubungkan ke permintaan</p>
          <p v-if="isActiveSubrequestLoading">Memuat subrequest aktif...</p>
          <div v-else-if="activeSubrequest" class="font-medium text-primary">
            {{ activeSubrequest.project_name }} - {{ activeSubrequest.job_role }} <br />
            <br />
            <h2 class="font-normal text-sm text-slate-600">
              Silahkan hubungi kandidat untuk memulai proses rekrutmen kandidat melalui fitur chat.
            </h2>
          </div>
          <p v-else class="text-amber-600">Subrequest aktif belum ditemukan untuk kandidat ini.</p>
        </div>

        <div class="-mx-6 -mb-6 bg-slate-100 px-6 py-5">
          <div class="flex justify-center gap-3">
            <n-button secondary @click="closeChatModal">Batal</n-button>
            <n-button
              type="primary"
              :loading="isStartingChat || isActiveSubrequestLoading"
              :disabled="!activeSubrequest && !isActiveSubrequestLoading"
              @click="handleStartChatConfirm"
            >
              Mulai Chat
            </n-button>
          </div>
        </div>
      </div>
    </n-modal>

    <n-modal
      v-model:show="cancelRecruitmentModalVisible"
      preset="dialog"
      type="warning"
      title="Batalkan Rekrutmen"
      positive-text="Ya, Batalkan"
      negative-text="Batal"
      :positive-button-props="{ loading: isCancellingRecruitment }"
      :negative-button-props="{ disabled: isCancellingRecruitment }"
      @positive-click="handleConfirmCancelRecruitment"
      @negative-click="closeCancelRecruitmentModal"
    >
      <p>
        Apakah Anda yakin ingin membatalkan rekrutmen kandidat ini? Status akan kembali menjadi
        Available.
      </p>
    </n-modal>

    <n-modal
      v-model:show="finalizeModalVisible"
      preset="card"
      :bordered="false"
      style="width: 36rem"
    >
      <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800 -mt-8">Finalisasi Kontrak</h2>
        </div>

        <div class="mt-3 text-sm text-slate-600">
          <p>
            Dengan melanjutkan, {{ user?.name }} akan resmi dikontrak sebagai
            <span class="font-semibold text-primary">{{ activeSubrequest?.job_role }}</span>
            untuk proyek <span class="font-semibold">{{ activeSubrequest?.project_name }}</span>
            untuk periode:
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-5">
          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-500">Tanggal Mulai</label>
            <n-date-picker
              v-model:formatted-value="finalizeStartDate"
              type="date"
              format="dd/MM/yyyy"
              value-format="yyyy-MM-dd"
              placeholder="DD/MM/YYYY"
              clearable
            />
            <p v-if="startDateError" class="text-xs text-red-500">{{ startDateError }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-500">Tanggal Berakhir</label>
            <n-date-picker
              v-model:formatted-value="finalizeEndDate"
              type="date"
              format="dd/MM/yyyy"
              value-format="yyyy-MM-dd"
              placeholder="DD/MM/YYYY"
              clearable
            />
            <p v-if="endDateError" class="text-xs text-red-500">{{ endDateError }}</p>
          </div>
        </div>

        <p class="mt-3 text-xs text-slate-500">
          Tindakan ini akan memulai proses onboarding kandidat.
        </p>

        <div class="-mx-6 -mb-6 bg-slate-100 px-6 py-5 mt-6">
          <div class="flex justify-center gap-3">
            <n-button secondary :disabled="isFinalizingRecruitment" @click="closeFinalizeModal">
              Batal
            </n-button>
            <n-button
              type="primary"
              :loading="isFinalizingRecruitment"
              :disabled="!canSubmitFinalize"
              @click="handleFinalizeRecruitment"
            >
              Finalisasi Kontrak
            </n-button>
          </div>
        </div>
      </div>
    </n-modal>

    <n-modal
      v-model:show="finalizeFeedbackVisible"
      preset="dialog"
      :type="finalizeFeedbackType"
      :title="
        finalizeFeedbackType === 'success'
          ? 'Kontrak Berhasil di finalisasi'
          : 'Kontrak Gagal di finalisasi'
      "
      positive-text="Tutup"
      @positive-click="closeFinalizeFeedback"
    >
      <p>{{ finalizeFeedbackDetail }}</p>
    </n-modal>
  </AdminLayout>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
