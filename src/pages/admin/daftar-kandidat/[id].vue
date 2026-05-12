<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/composables/useUser'
import { useAdminMyRequests, useAssignCandidateToSubrequest } from '@/composables/useRequest'
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
  NSpace,
  useMessage,
  type SelectOption,
} from 'naive-ui'
import { useRecruitmentStatuses } from '@/composables/useRecruitmentStatuses'
import type { UserRecruitmentStatusPayload } from '@/models/User'
import type { RequestQueryParams } from '@/models/Request'
import { useCandidateNotesStore } from '@/stores/notes.store'
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
    value: 'In-Eligible',
  },
]

const { recruitmentStatuses } = useRecruitmentStatuses()
const recruitmentOptions = computed<SelectOption[]>(() =>
  recruitmentStatuses.value
    .filter((status) => status.is_active)
    .map((status) => ({
      label: status.name,
      value: status.id,
    })),
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
} = useUser(userId)

const recruitModalVisible = ref(false)
const chatModalVisible = ref(false)
const cancelRecruitmentModalVisible = ref(false)
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
  void Promise.all([refetchUser(), refetchMyRequests()])
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
    await Promise.all([refetchUser(), refetchMyRequests()])
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal membatalkan rekrutmen.'
    message.error(messageText, { duration: 3000 })
  }
}

const handleStartChatConfirm = async (): Promise<void> => {
  if (!user.value?.id || !selectedSubrequestId.value) {
    return
  }

  try {
    await startChat({
      candidate_user_id: user.value.id,
      subrequest_id: selectedSubrequestId.value,
    })

    message.success('Chat dimulai dengan kandidat.', { duration: 2000 })
    chatModalVisible.value = false

    // Refetch to get updated status
    await Promise.all([refetchUser(), refetchMyRequests()])
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal memulai chat dengan kandidat.'
    message.error(messageText, { duration: 3000 })
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
      <div v-else-if="user" class="space-y-6">
        <CandidateProfileCard
          :user="user"
          @recruit="handleRecruit"
          @start-chat="handleStartChat"
          @cancel-recruitment="handleCancelRecruitmentClick"
        />

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
              :notes="notes"
              :notes-loading="isNotesLoading"
              :notes-posting="isNotesPosting"
              :notes-error="notesError"
              :user="user"
              @save="handleSaveRecruitment"
              @send-note="handleSendNote"
            />
          </n-gi>
        </n-grid>
        <CandidateOnboardingHistory />
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

          <!-- <p class="text-sm text-slate-500">
            Catatan: Tombol Simpan akan dinonaktifkan jika kombinasi kandidat dan subrequest ini
            sudah pernah di-assign pada sesi ini.
          </p> -->
          <p v-if="isDuplicateAssignment" class="text-sm text-amber-600">
            Kandidat ini sudah di-assign ke posisi terpilih pada. Pilih posisi lain.
          </p>
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
      v-model:show="chatModalVisible"
      preset="card"
      :bordered="false"
      :close-on-esc="false"
      :mask-closable="false"
      style="width: 40rem"
    >
      <div class="">
        <div>
          <h2 class="text-lg font-semibold text-gray-800 -mt-8">Kandidat Berhasil di Assign</h2>
        </div>

        <p class="text-sm text-slate-600 mt-4 mb-6">
          Kandidat siap untuk memulai proses onboarding. Apakah Anda ingin memulai percakapan dengan
          kandidat?
        </p>

        <div class="-mx-6 -mb-6 bg-slate-100 px-6 py-5">
          <div class="flex justify-center gap-3">
            <n-button secondary @click="closeChatModal">Batal</n-button>
            <n-button type="primary" :loading="isStartingChat" @click="handleStartChatConfirm">
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
  </AdminLayout>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
