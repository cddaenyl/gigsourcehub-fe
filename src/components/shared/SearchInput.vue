<script setup lang="ts">
import {  } from 'vue'
import { NInput, NIcon } from 'naive-ui'
import { Search } from '@vicons/tabler'

interface Props {
  placeholder?: string
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Cari kandidat',
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
}>()

const handleSearch = () => {
  emit('search', props.modelValue)
}
</script>

<template>
  <n-input
    :value="modelValue"
    @update:value="emit('update:modelValue', $event)"
    :placeholder="props.placeholder"
    class="w-80"
    @keyup.enter="handleSearch"
  >
    <template #prefix>
      <n-icon :component="Search" />
    </template>
  </n-input>
</template>
