<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { getUserRole } from '@/utils/auth'
import type { User } from '@/models/User'
import CandidateBookmark from '@/components/CandidateBookmark.vue'
import UserStatusChip from '@/components/chip/UserStatusChip.vue'
import { NCard, NButton, NIcon, NAvatar, useMessage } from 'naive-ui'
import { UserSearch, MessageCircle2, X, Bookmark, Checks } from '@vicons/tabler'
import { useBookmarkStore } from '@/stores/bookmark.store'

const router = useRouter()

const authStore = useAuthStore()
const isAdmin = computed(() => getUserRole(authStore.user) === 'admin')
const isEmployee = computed(() => getUserRole(authStore.user) === 'employee')

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  (event: 'recruit'): void
  (event: 'start-chat'): void
  (event: 'cancel-recruitment'): void
}>()

const bookmarkStore = useBookmarkStore()
const message = useMessage()

const isBookmarked = computed(() => bookmarkStore.isBookmarked(props.user.id))

const toggleBookmark = async () => {
  if (bookmarkStore.isLoading) return
  const wasBookmarked = isBookmarked.value

  try {
    await bookmarkStore.toggleBookmark(props.user.id)

    message.success(
      wasBookmarked ? 'Candidate removed from bookmarks.' : 'Candidate added to bookmarks.',
      {
        duration: 2500,
      },
    )
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Please try again in a moment.'

    message.error(`Bookmark update failed: ${messageText}`, {
      duration: 3000,
    })
  }
}

const getProfilePictureThumbnail = (url: string | null): string | undefined => {
  if (!url) return undefined

  const lastDotIndex = url.lastIndexOf('.')
  if (lastDotIndex === -1) return url

  const filename = url.substring(0, lastDotIndex)
  const extension = url.substring(lastDotIndex)

  return `${filename}_thumb${extension}`
}

const profilePictureThumbnail = computed(() =>
  getProfilePictureThumbnail(props.user.profile_picture),
)

const recruitmentStatusName = computed(() => props.user.recruitment_status_name || '')

const showRecruitButton = computed(
  () => recruitmentStatusName.value === 'Available' && isAdmin.value,
)

const showStartChatButton = computed(
  () => recruitmentStatusName.value === 'Assigned' && isAdmin.value,
)

const showChatKandidatButton = computed(() => {
  const status = recruitmentStatusName.value
  return status !== 'Available' && status !== 'Assigned' && isAdmin.value
})

const showCancelRecruitmentButton = computed(() => {
  const status = recruitmentStatusName.value
  return status !== 'Available' && status !== 'Assigned' && isAdmin.value
})

const showAdminBookmarkButton = computed(() => isAdmin.value)
const showEmployeeBookmarkButton = computed(() => isEmployee.value)

const handleChatKandidat = (): void => {
  router.push(`/admin/candidate-chat/`)
}

const handleStartChat = (): void => {
  emit('start-chat')
}
</script>

<template>
  <n-card>
    <div class="flex gap-4 items-center px-1 stroke-gray-200">
      <div class="flex items-center justify-center">
        <n-avatar :size="50" :src="profilePictureThumbnail" round>
          <template #fallback>
            <n-icon :component="UserSearch" :size="24" />
          </template>
        </n-avatar>
      </div>

      <div class="flex-1">
        <h2 class="text-lg font-bold text-gray-800">{{ user.name }}</h2>
        <UserStatusChip
          :unavailable-until="user.unavailable_until"
          :recruitment-status-id="user.recruitment_status_id"
          :recruitment-status-name="user.recruitment_status_name"
        />
      </div>
      <div class="flex items-center gap-2">
        <n-button v-if="showAdminBookmarkButton" style="width: 40px; height: 35px; padding: 0">
          <CandidateBookmark class="scale-125" :user-id="user.id" />
        </n-button>
        <button v-if="showEmployeeBookmarkButton" class="flex" @click="toggleBookmark">
          <div
            class="cursor-pointer transition-all gap-2 px-4 py-2 w-full relative justify-center items-center flex hover:scale-105 rounded-xs"
            :class="isBookmarked ? 'border border-primary' : 'bg-primary'"
          >
            <div v-if="!isBookmarked" class="flex">
              <n-icon :component="Bookmark" :size="20" class="text-white transition-colors" />
            </div>
            <div v-else class="justify-center items-center flex">
              <n-icon :component="Checks" :size="20" class="text-primary transition-colors" />
            </div>
            <div class="flex justify-center items-center text-white text-sm">
              <p :class="isBookmarked ? 'text-primary' : 'text-white'">
                {{ isBookmarked ? 'Disimpan' : 'Simpan' }}
              </p>
            </div>
          </div>
        </button>
        <!-- Recruit Button - Show only if Available -->
        <n-button v-if="showRecruitButton" type="primary" @click="emit('recruit')">
          <template #icon>
            <n-icon :component="UserSearch" />
          </template>
          Rekrut
        </n-button>
        <!-- Mulai Chat Button - Show only if Assigned -->
        <n-button v-if="showStartChatButton" type="primary" @click="handleStartChat">
          <template #icon>
            <n-icon :component="MessageCircle2" />
          </template>
          Mulai Chat
        </n-button>
        <!-- Chat Kandidat Button - Show if status is not Available or Assigned -->
        <n-button v-if="showChatKandidatButton" type="primary" @click="handleChatKandidat">
          <template #icon>
            <n-icon :component="MessageCircle2" />
          </template>
          Chat Kandidat
        </n-button>
        <!-- Batalkan Rekrutmen Button - Show if status is not Available or Assigned -->
        <n-button
          v-if="showCancelRecruitmentButton"
          type="error"
          @click="emit('cancel-recruitment')"
        >
          <template #icon>
            <n-icon :component="X" />
          </template>
          Batalkan Rekrutmen
        </n-button>
      </div>
    </div>
  </n-card>
</template>
