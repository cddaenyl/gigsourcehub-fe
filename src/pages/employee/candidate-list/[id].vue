<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/composables/useUser'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidateDetailHeader from '@/components/candidate-detail/CandidateDetailHeader.vue'
import CandidateProfileCard from '@/components/candidate-detail/CandidateProfileCard.vue'
import CandidateInfoCard from '@/components/candidate-detail/CandidateInfoCard.vue'
import CandidateNotesCard from '@/components/candidate-detail/CandidateNotesCard.vue'
import CandidateOnboardingHistory from '@/components/candidate-detail/CandidateOnboardingHistory.vue'
import { NButton, NSpin, NGrid, NGi, useMessage } from 'naive-ui'
import { useCandidateNotesStore } from '@/stores/notes.store'
const route = useRoute()
const router = useRouter()
const message = useMessage()
const note = ref('')

const userId = computed((): string => {
  const params = route.params as Record<string, string | string[]>
  const id = params['id']
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

// Fetch user data
const { user, isLoading, isError, error } = useUser(userId)

const selectedRequestId = ref<string | null>(null)
const selectedSubrequestId = ref<string | null>(null)
const assignedPairKeys = ref<string[]>([])

const notesStore = useCandidateNotesStore()
const notes = computed(() => notesStore.sortedNotes)
const isNotesLoading = computed(() => notesStore.isLoading)
const isNotesPosting = computed(() => notesStore.isPosting)
const notesError = computed(() => notesStore.error)

const optimisticLevel = ref<string | null>(null)
const optimisticStatus = ref<string | null>(null)

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
  router.push('/employee/candidate-list')
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

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

const formatNoteDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins}m lalu`
  if (diffHours < 24) return `${diffHours}h lalu`
  if (diffDays < 7) return `${diffDays}d lalu`

  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
        <CandidateProfileCard :user="user" />

        <n-grid :x-gap="8" :cols="2" item-responsive>
          <n-gi>
            <CandidateInfoCard :user="user" />
          </n-gi>

          <n-gi>
            <CandidateNotesCard
              v-model="note"
              class="min-h-full"
              :disabled="isNotesLoading || isNotesPosting"
              :loading="isNotesPosting"
              @send="handleSendNote"
              :clear-on-send="true"
            >
              <template #header>
                <div class="flex flex-col gap-0.5">
                  <h4 class="font-bold text-sm text-gray-500">Catatan</h4>
                </div>
              </template>

              <template #default>
                <div v-if="isNotesLoading" class="text-xs text-gray-400">Memuat catatan...</div>
                <div v-else-if="notesError" class="text-xs text-red-500">{{ notesError }}</div>
                <div v-else-if="notes.length" class="max-h-188 overflow-y-auto">
                  <div
                    v-for="noteItem in notes"
                    :key="noteItem.id"
                    class="flex gap-4 rounded-md py-2"
                  >
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-gray-100"
                    >
                      {{ getInitials(noteItem.admin_user_name || '') }}
                    </div>
                    <div class="flex flex-1 flex-col gap-1 mt-0.5">
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-semibold text-gray-700">
                          {{ noteItem.admin_user_name }}
                        </p>
                        <p class="text-sm text-gray-400">
                          {{ formatNoteDate(noteItem.created_at) }}
                        </p>
                      </div>
                      <p class="text-xs text-slate-500 whitespace-pre-line wrap-break-words">
                        {{ noteItem.content }}
                      </p>
                    </div>
                  </div>
                </div>
                <h4 v-else class="text-xs text-gray-400">Belum Ada Catatan</h4>
              </template>
            </CandidateNotesCard>
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
