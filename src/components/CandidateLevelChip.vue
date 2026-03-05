<script setup lang="ts">
import { computed } from 'vue'
import { NTag } from 'naive-ui'

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
        type: 'success' as const,
        color: {
          color: '#10B981',
          textColor: '#ffffff',
          borderColor: '#10B981'
        }
      }
    case 'middle':
      return {
        show: true,
        type: 'warning' as const,
        color: {
          color: '#F59E0B',
          textColor: '#ffffff',
          borderColor: '#F59E0B'
        }
      }
    case 'senior':
      return {
        show: true,
        type: 'error' as const,
        color: {
          color: '#EF4444',
          textColor: '#ffffff',
          borderColor: '#EF4444'
        }
      }
      case 'junior':
      return {
        show: true,
        type: 'success' as const,
        color: {
          color: '#10B981',
          textColor: '#ffffff',
          borderColor: '#10B981'
        }
      }
    case 'middle':
      return {
        show: true,
        type: 'warning' as const,
        color: {
          color: '#F59E0B',
          textColor: '#ffffff',
          borderColor: '#F59E0B'
        }
      }
    case 'ineligible':
      return {
        show: true,
        type: 'default' as const,
        color: {
          color: '#8B5CF6',
          textColor: '#ffffff',
          borderColor: '#8B5CF6'
        }
      }
    case 'un-reviewed':
    default:
      return {
        show: false,
        type: 'default' as const,
        color: {}
      }
  }
})
</script>

<template>
  <div>
    <n-tag
      v-if="chipConfig.show"
      :type="chipConfig.type"
      :color="chipConfig.color"
      round
      size="medium"
    >
      {{ level }}
    </n-tag>
    <p v-else class="text-gray-500">
      {{ level }}
    </p>
  </div>
</template>
