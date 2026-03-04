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
    class="cursor-pointer transition-all hover:scale-110 relative"
    @click="toggleBookmark"
  >
    <div v-if="!bookmarked">
      <n-icon
        :component="Bookmark"
        :size="20"
        class="text-gray-400 hover:text-gray-600 transition-colors"
      />
    </div>
    <div v-else class="relative inline-block">
      <n-icon
        :component="Bookmark"
        :size="20"
        class="text-blue-600"
        style="fill: currentColor;"
      />
      <!-- <n-icon
        :component="Check"
        :size="12"
        class="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style="margin-top: -1px;"
      /> -->
    </div>
  </div>
</template>
