<script setup lang="ts">
import { NInput, NColorPicker, NIcon } from 'naive-ui'
import { ColorPicker } from '@vicons/tabler'

interface Props {
  value: string
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '#0014B2',
  size: 'large',
  disabled: false,
})

const emit = defineEmits(['update:value'])

const handleUpdate = (val: string) => {
  emit('update:value', val)
}
</script>

<template>
  <n-input 
    :value="props.value"
    @update:value="handleUpdate"
    :placeholder="props.placeholder" 
    :size="props.size"
    :disabled="props.disabled"
  >
    <template #prefix>
      <div class="flex items-center justify-center mr-2">
        <div 
          class="relative w-8 h-8 rounded-full ring-1 ring-slate-200 overflow-hidden shrink-0 transition-colors"
          :style="{ backgroundColor: props.value }"
        >
          <!-- Visible Icon - Centered via absolute inset-0 -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <n-icon 
              :component="ColorPicker" 
              class="text-white drop-shadow-sm" 
              style="display: flex; align-items: center; justify-content: center; line-height: 0;"
              size="18" 
            />
          </div>
          
          <!-- Invisible but active Color Picker Overlay -->
          <n-color-picker 
            :value="props.value"
            @update:value="handleUpdate"
            :show-alpha="false"
            :actions="['confirm']"
            :disabled="props.disabled"
            class="absolute inset-0 opacity-0 cursor-pointer scale-150"
          />
        </div>
      </div>
    </template>
  </n-input>
</template>
