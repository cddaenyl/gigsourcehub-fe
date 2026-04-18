<script setup lang="ts">
import { NIcon, NCard, NButton } from 'naive-ui'
import { ChevronLeft } from '@vicons/tabler'
import { useRouter } from 'vue-router'
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'

interface Props {
  title: string
  backUrl?: string
  loading?: boolean
  isReady?: boolean
  submitText?: string
}

const props = withDefaults(defineProps<Props>(), {
  backUrl: '/superadmin/user-management',
  loading: false,
  isReady: false,
  submitText: 'Save',
})

const emit = defineEmits(['submit'])
const router = useRouter()

const handleBack = () => {
  router.push(props.backUrl)
}

const handleSubmit = (e: MouseEvent) => {
  emit('submit', e)
}
</script>

<template>
  <SuperAdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button 
          @click="handleBack"
          type="button"
          class="flex items-center justify-center w-8 h-8 rounded-full bg-[#0014B2] text-white hover:bg-blue-800 transition-colors"
        >
          <n-icon :component="ChevronLeft" size="20" />
        </button>
        <h1 class="text-xl font-bold text-[#1E293B]">{{ title }}</h1>
      </div>

      <!-- Form Card -->
      <div class="p-0 sm:p-6">
        <n-card :bordered="false" class="rounded-xl shadow-sm overflow-hidden p-0">
          <div class="p-8 pb-4">
            <slot />
          </div>

          <!-- Card Footer -->
          <div class="p-8 pt-0">
            <div class="bg-[#F8FAFC] p-8 py-6 flex justify-end rounded-lg">
              <slot name="footer">
                <n-button 
                  type="primary" 
                  :color="isReady ? '#0014B2' : '#E2E8F0'" 
                  :text-color="isReady ? '#FFFFFF' : '#475569'"
                  class="font-semibold px-8"
                  :loading="loading"
                  :disabled="!isReady"
                  @click="handleSubmit"
                >
                  {{ submitText }}
                </n-button>
              </slot>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </SuperAdminLayout>
</template>

<style scoped>
:deep(.n-form-item-label) {
  color: #1E293B;
  font-weight: 600;
  font-size: 14px;
}

:deep(.n-input), :deep(.n-select) {
  --n-border-radius: 6px;
}

:deep(.n-card__content) {
  padding: 0 !important;
}
</style>
