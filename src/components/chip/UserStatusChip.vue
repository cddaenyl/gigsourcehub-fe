<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  unavailableUntil?: string | null
  recruitmentStatusId?: string | null
  recruitmentStatusName?: string | null
}>()

const statusInfo = computed(() => {
  // Unavailable, if the unvailable_until value is not null. Color Red
  if (props.unavailableUntil) {
    return { label: 'Unavailable', className: 'bg-red-100' as const }
  }

  // OnBoarding, if the recruitment_status == Accepted, Color Green
  if (props.recruitmentStatusName === 'Accepted') {
    return {
      label: 'OnBoarding',
      className: 'bg-emerald-500 ' as const,
    }
  }

  // Available, if the unvailable_until value is null and the recruitment_status_id is null. Color Blue
  if (!props.recruitmentStatusId) {
    return { label: 'Available', className: 'bg-blue-500' as const }
  }

  // Inprogress, if the unvailable_until value is null and the recruitment_status_id is not null, Color Yellow
  return {
    label: 'Inprogress',
    className: 'bg-amber-500 ' as const,
  }
})
</script>

<template>
  <div>
    <div
      :class="[
        'inline-flex items-center rounded-full px-2 py-1 text-xs leading-none text-white',
        statusInfo.className,
      ]"
    >
      {{ statusInfo.label }}
    </div>
  </div>
</template>
