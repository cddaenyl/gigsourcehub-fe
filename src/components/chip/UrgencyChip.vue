<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  urgency: string
}

const props = defineProps<Props>()

const chipConfig = computed(() => {
  const urgency = props.urgency.toLowerCase()

  switch (urgency) {
    case 'low':
      return {
        className: 'bg-[#10B981] text-white border-[#10B981]',
      }
    case 'middle':
      return {
        className: 'bg-amber-500 text-white border-amber-500',
      }
    case 'high':
      return {
        className: 'bg-[#F43F5E] text-white border-[#F43F5E]',
      }
    case '':
    default:
      return {
        className: 'bg-gray-400 text-white border-gray-400',
      }
  }
})
</script>

<template>
  <div>
    <div
      :class="[
        'inline-flex items-center rounded-full border px-2 py-1 text-xs leading-none',
        chipConfig.className,
      ]"
    >
      {{ urgency }}
    </div>
  </div>
</template>
