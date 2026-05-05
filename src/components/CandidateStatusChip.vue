<script setup lang="ts">
import { computed } from 'vue'
interface Props {
  status: string
  hexCode?: string | null
}

const props = defineProps<Props>()

const textColor = computed(() => {
  if (!props.hexCode) {
    return '#111827'
  }
  const normalizedHex = props.hexCode.replace('#', '')
  const fullHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split('')
          .map((char) => char + char)
          .join('')
      : normalizedHex
  if (fullHex.length !== 6) {
    return '#111827'
  }
  const r = Number.parseInt(fullHex.slice(0, 2), 16)
  const g = Number.parseInt(fullHex.slice(2, 4), 16)
  const b = Number.parseInt(fullHex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#111827' : '#FFFFFF'
})
</script>

<template>
  <p v-if="!hexCode" class="text-gray-500">{{ status }}</p>
  <div
    v-else
    class="inline-flex items-center rounded-full border px-2 py-1.5 text-xs leading-none"
    :style="{
      backgroundColor: hexCode,
      borderColor: hexCode,
      color: textColor,
    }"
  >
    {{ status }}
  </div>
</template>
