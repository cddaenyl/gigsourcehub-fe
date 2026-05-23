<script setup lang="ts">
import { NModal, NCard, NIcon } from 'naive-ui'
import { X } from '@vicons/tabler'

interface Props {
  show: boolean
  title?: string
  width?: string | number
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '600px',
  closable: true,
})

const emit = defineEmits(['update:show', 'close'])

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}
</script>

<template>
  <n-modal
    :show="props.show"
    @update:show="emit('update:show', $event)"
    transform-origin="center"
    class="custom-modal"
  >
    <n-card
      :style="{ width: typeof width === 'number' ? width + 'px' : width }"
      :title="props.title"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      class="rounded-2xl"
    >
      <template #header-extra>
        <button
          v-if="props.closable"
          @click="handleClose"
          class="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <n-icon :component="X" size="20" />
        </button>
      </template>

      <div class="modal-content">
        <slot />
      </div>

      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped>
.custom-modal {
  max-height: 90vh;
}

.modal-content {
  max-height: calc(90vh - 160px);
  overflow-y: auto;
  padding-right: 4px;
}

:deep(.n-card-header) {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1rem;
}

:deep(.n-card__content) {
  padding-top: 1.5rem;
}

:deep(.n-card__footer) {
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
