<script setup lang="ts">
import { ref, watch } from 'vue'
import { NCard, NInput, NButton, NIcon } from 'naive-ui'
import { Send } from '@vicons/tabler'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  autosize?: { minRows?: number; maxRows?: number }
  clearOnSend?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send', payload: { text: string }): void
}>()

const internal = ref(props.modelValue ?? '')

watch(
  () => props.modelValue,
  (v) => {
    if (v !== internal.value) internal.value = v ?? ''
  },
)

watch(internal, (v) => {
  emit('update:modelValue', v)
})

const handleSend = () => {
  if (!internal.value.trim()) return
  emit('send', { text: internal.value })
  if (props.clearOnSend ?? true) {
    internal.value = ''
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <n-card
    style="flex: 1"
    :content-style="{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
    }"
  >
    <div class="flex h-full flex-1 flex-col gap-4">
      <slot name="header">
        <div class="flex flex-col gap-0.5">
          <h4 class="font-bold text-sm text-gray-500">Catatan</h4>
        </div>
      </slot>

      <div class="flex flex-col flex-1 gap-0.5">
        <slot>
          <h4 class="text-xs text-gray-400">Belum Ada Catatan</h4>
        </slot>
      </div>

      <div class="flex flex-col gap-0.5 items-end">
        <n-input
          v-model:value="internal"
          :placeholder="placeholder ?? 'Type here...'"
          round
          type="textarea"
          style="border-radius: 2rem"
          class="py-1"
          :autosize="autosize ?? { minRows: 1, maxRows: 3 }"
          :disabled="disabled"
          @keydown="onKeydown"
        >
          <template #suffix>
            <n-button
              circle
              type="primary"
              size="small"
              :loading="loading"
              :disabled="disabled"
              @click="handleSend"
            >
              <template #icon>
                <n-icon :component="Send" />
              </template>
            </n-button>
          </template>
        </n-input>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
