<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/composables/useUser'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidateDetailHeader from '@/components/candidate-detail/CandidateDetailHeader.vue'
import CandidateProfileCard from '@/components/candidate-detail/CandidateProfileCard.vue'
import CandidateInfoCard from '@/components/candidate-detail/CandidateInfoCard.vue'
import CandidateRecruitmentPanel from '@/components/candidate-detail/CandidateRecruitmentPanel.vue'
import CandidateOnboardingHistory from '@/components/candidate-detail/CandidateOnboardingHistory.vue'
import { NButton, NSpin, NGrid, NGi, useMessage, type SelectOption } from 'naive-ui'
import { useRecruitmentStatuses } from '@/composables/useRecruitmentStatuses'
import type { UserRecruitmentStatusPayload } from '@/models/User'
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
const { user, isLoading, isError, error, updateRecruitmentStatus, isUpdatingRecruitmentStatus } =
  useUser(userId)

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

watch(userId, () => {
  optimisticLevel.value = null
  optimisticStatus.value = null
})

watch(
  userId,
  async (id) => {
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
  () => [user.value?.candidate_level, user.value?.recruitment_status_id],
  ([nextLevel, nextStatus]) => {
    if (nextLevel === optimisticLevel.value && nextStatus === optimisticStatus.value) {
      optimisticLevel.value = null
      optimisticStatus.value = null
    }
  },
)

// Handlers
const handleBack = () => {
  router.push('/admin/daftar-kandidat')
}

const handleRecruit = () => {
  console.log('Recruit candidate:', user.value)
  // TODO: Implement recruit logic
}

const handleChat = () => {
  console.log('Chat with candidate:', user.value)
  // TODO: Implement chat logic
}

const handleSaveRecruitment = async (payload: UserRecruitmentStatusPayload) => {
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

const handleSendNote = async (payload: { text: string }) => {
  if (!userId.value) return
  try {
    await notesStore.createNote(userId.value, payload.text)
    message.success('Catatan berhasil ditambahkan.', { duration: 2000 })
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Gagal menambahkan catatan.'
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
        <CandidateProfileCard :user="user" @chat="handleChat" @recruit="handleRecruit" />

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
              @save="handleSaveRecruitment"
              @send-note="handleSendNote"
            />
          </n-gi>
        </n-grid>
        <CandidateOnboardingHistory />
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
