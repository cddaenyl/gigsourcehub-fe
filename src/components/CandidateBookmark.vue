<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { Bookmark } from '@vicons/tabler'
import { useBookmarkStore } from '@/stores/bookmark.store'

const props = defineProps<{
  userId: string
}>()

const bookmarkStore = useBookmarkStore()

const isBookmarked = computed(() => bookmarkStore.isBookmarked(props.userId))

const toggleBookmark = async () => {
  try {
    await bookmarkStore.toggleBookmark(props.userId)
  } catch (error) {
    console.error('Failed to toggle bookmark:', error)
    // You can add a notification here to inform the user
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
