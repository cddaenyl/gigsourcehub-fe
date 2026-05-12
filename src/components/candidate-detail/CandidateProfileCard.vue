<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/models/User'
import CandidateBookmark from '@/components/CandidateBookmark.vue'
import { NCard, NButton, NIcon, NTag, NAvatar } from 'naive-ui'
import { UserSearch, MessageCircle2, X } from '@vicons/tabler'

const router = useRouter()

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  (event: 'recruit'): void
  (event: 'start-chat'): void
  (event: 'cancel-recruitment'): void
}>()

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

const showRecruitButton = computed(() => recruitmentStatusName.value === 'Available')

const showStartChatButton = computed(() => recruitmentStatusName.value === 'Assigned')

const showChatKandidatButton = computed(() => {
  const status = recruitmentStatusName.value
  return status !== 'Available' && status !== 'Assigned'
})

const showCancelRecruitmentButton = computed(() => {
  const status = recruitmentStatusName.value
  return status !== 'Available' && status !== 'Assigned'
})

const handleChatKandidat = (): void => {
  router.push(`/admin/candidate-chat/${props.user.id}`)
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
        <n-tag size="small" type="primary" round>Available (Api Not Developed)</n-tag>
      </div>
      <div class="flex items-center gap-2">
        <n-button style="width: 40px; height: 35px; padding: 0">
          <CandidateBookmark class="scale-125" :user-id="user.id" />
        </n-button>
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
