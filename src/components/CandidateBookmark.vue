<script setup lang="ts">
import { computed } from 'vue'
import { NIcon, useMessage } from 'naive-ui'
import { Bookmark } from '@vicons/tabler'
import { useBookmarkStore } from '@/stores/bookmark.store'

const props = defineProps<{
  userId: string
}>()

const bookmarkStore = useBookmarkStore()
const message = useMessage()

const isBookmarked = computed(() => bookmarkStore.isBookmarked(props.userId))

const toggleBookmark = async () => {
  if (bookmarkStore.isLoading) return
  const wasBookmarked = isBookmarked.value

  try {
    await bookmarkStore.toggleBookmark(props.userId)

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
</script>

<template>
  <div
    class="cursor-pointer transition-all hover:scale-110 relative justify-center items-center flex w-4"
    @click="toggleBookmark"
  >
    <div v-if="!isBookmarked">
      <n-icon
        :component="Bookmark"
        :size="20"
        class="text-gray-400 hover:text-gray-600 transition-colors"
      />
    </div>
    <div v-else class="justify-center items-center flex">
      <img src="../assets/checked.svg" alt="Bookmarked" />
    </div>
  </div>
</template>
