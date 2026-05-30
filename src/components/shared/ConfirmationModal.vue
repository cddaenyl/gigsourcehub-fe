<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NIcon } from 'naive-ui'
import { CircleX, CircleCheck, AlertCircle, InfoCircle } from '@vicons/tabler'

interface Props {
  show: boolean
  title: string
  message: string
  confirmText: string
  cancelText?: string
  loading?: boolean
  type?: 'danger' | 'warning' | 'info' | 'success'
}

const props = withDefaults(defineProps<Props>(), {
  cancelText: 'Batal',
  loading: false,
  type: 'danger',
})

const emit = defineEmits(['update:show', 'confirm', 'cancel'])

const handleClose = () => {
  emit('update:show', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}

const iconComponent = computed(() => {
  switch (props.type) {
    case 'success':
      return CircleCheck
    case 'warning':
      return AlertCircle
    case 'info':
      return InfoCircle
    case 'danger':
    default:
      return CircleX
  }
})
</script>

<template>
  <n-modal :show="props.show" @update:show="emit('update:show', $event)" transform-origin="center">
    <div class="bg-white rounded-lg shadow-xl overflow-hidden w-[90vw] md:w-[40vw] max-w-[580px] relative flex flex-col">
      <!-- Content -->
      <div class="px-8 pt-10 pb-8 flex flex-col items-center text-center">
        <!-- Big Center Icon -->
        <div :class="[
          'w-16 h-16 rounded-full flex items-center justify-center mb-6',
          props.type === 'danger' ? 'bg-rose-50 text-rose-500' :
            props.type === 'warning' ? 'bg-amber-50 text-amber-500' :
              props.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                'bg-blue-50 text-blue-500'
        ]">
          <n-icon size="40">
            <component :is="iconComponent" />
          </n-icon>
        </div>

        <h3 class="text-xl font-bold text-slate-800 mb-4">
          {{ props.title }}
        </h3>
        <p class="text-slate-500 text-sm leading-relaxed max-w-[420px]">
          {{ props.message }}
        </p>
      </div>

      <!-- Footer -->
      <div class="bg-slate-50 px-8 py-5 flex items-center justify-center gap-3 border-t border-slate-100">
        <button @click="handleClose" :disabled="props.loading"
          class="px-6 py-2 h-10 min-w-[100px] rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium transition-colors text-[14px]">
          {{ props.cancelText }}
        </button>
        <button @click="handleConfirm" :disabled="props.loading" :class="[
          'px-6 py-2 h-10 min-w-[100px] rounded-md text-white font-medium transition-colors text-[14px]',
          props.type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 active:bg-rose-700' :
            props.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700' :
              props.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700' :
                'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
        ]">
          <span v-if="props.loading">Processing...</span>
          <span v-else>{{ props.confirmText }}</span>
        </button>
      </div>
    </div>
  </n-modal>
</template>
