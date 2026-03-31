<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/models/User'
import CandidateBookmark from '@/components/CandidateBookmark.vue'
import { NCard, NButton, NIcon, NTag, NAvatar } from 'naive-ui'
import { UserSearch, MessageCircle2 } from '@vicons/tabler'

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  (event: 'chat'): void
  (event: 'recruit'): void
}>()

const getProfilePictureThumbnail = (url: string | null) => {
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
        <n-button type="primary" @click="emit('chat')">
          <template #icon>
            <n-icon :component="MessageCircle2" />
          </template>
        </n-button>
        <n-button type="primary" @click="emit('recruit')">
          <template #icon>
            <n-icon :component="UserSearch" />
          </template>
          Rekrut
        </n-button>
      </div>
    </div>
  </n-card>
</template>
