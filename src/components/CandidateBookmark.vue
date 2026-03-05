<script setup lang="ts">
import { ref, watch } from 'vue'
import { NIcon } from 'naive-ui'
import { Bookmark } from '@vicons/tabler'

interface Candidate {
  no: number
  nama: string
  bidang: string
  appliedRole: string
  level: string
  status: string
}

const props = defineProps<{
  candidate: Candidate
  isBookmarked?: boolean
}>()

const emit = defineEmits<{
  toggle: [candidate: Candidate, isBookmarked: boolean]
}>()

const bookmarked = ref(props.isBookmarked || false)

// Watch for external changes to isBookmarked prop
watch(() => props.isBookmarked, (newValue) => {
  bookmarked.value = newValue || false
})

const toggleBookmark = () => {
  bookmarked.value = !bookmarked.value
  emit('toggle', props.candidate, bookmarked.value)
}
</script>

<template>
  <div
    class="cursor-pointer transition-all hover:scale-110 relative justify-center items-center flex w-4"
    @click="toggleBookmark"
  >
    <div v-if="!bookmarked">
      <n-icon
        :component="Bookmark"
        :size="20"
        class="text-gray-400 hover:text-gray-600 transition-colors"
      />
    </div>
    <div v-else class="justify-center items-center flex">
      <img src="../assets/checked.svg" alt="Bookmarked">
    </div>
  </div>
</template>
