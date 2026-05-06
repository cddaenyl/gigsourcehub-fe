<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
}

const props = defineProps<Props>()

const chipConfig = computed(() => {
  const status = props.status.toLowerCase()

  switch (status) {
    case 'pending':
    case 'menunggu validasi':
      return {
        className: 'bg-gray-700 text-white border-gray-700',
      }
    case 'processing':
    case 'diproses':
      return {
        className: 'bg-amber-500 text-white border-amber-500',
      }
    case 'accepted':
    case 'disetujui':
      return {
        className: 'bg-blue-500 text-white border-blue-500 ',
      }
    case 'rejected':
    case 'ditolak':
      return {
        className: 'bg-red-500 text-white border-red-500',
      }
    case 'done':
    case 'selesai':
      return {
        className: 'bg-green-600 text-white border-green-600',
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
      {{ status }}
    </div>
  </div>
</template>
