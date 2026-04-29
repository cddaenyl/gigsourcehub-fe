<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  level: string
}

const props = defineProps<Props>()

const chipConfig = computed(() => {
  const level = props.level.toLowerCase()

  switch (level) {
    case 'junior':
      return {
        show: true,
        className: 'bg-emerald-500 text-white border-emerald-500',
      }
    case 'middle':
      return {
        show: true,
        className: 'bg-amber-500 text-white border-amber-500',
      }
    case 'senior':
      return {
        show: true,
        className: 'bg-red-500 text-white border-red-500',
      }
    case 'ineligible':
      return {
        show: true,
        className: 'bg-violet-500 text-white border-violet-500',
      }
    case 'un-reviewed':
    default:
      return {
        show: false,
        className: '',
      }
  }
})
</script>

<template>
  <div>
    <n-tag
      v-if="chipConfig.show"
      :class="[
        'inline-flex items-center rounded-full border px-2 py-1.5 text-xs leading-none',
        chipConfig.className,
      ]"
    >
      {{ level }}
    </n-tag>
    <p v-else class="text-gray-500">
      {{ level }}
    </p>
  </div>
</template>
