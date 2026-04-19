<script setup lang="ts">
import { ref, watch } from 'vue'
import { NInput, NIcon } from 'naive-ui'
import { Search } from '@vicons/tabler'
import { debounce } from 'lodash-es'

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

const internalValue = ref(props.modelValue)

// Keep internal value in sync with prop for external resets
watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

const debouncedSearch = debounce((val: string) => {
  emit('update:modelValue', val)
  emit('search', val)
}, 500)

watch(internalValue, (newVal) => {
  debouncedSearch(newVal)
})

const handleImmediateSearch = () => {
  debouncedSearch.cancel()
  emit('update:modelValue', internalValue.value)
  emit('search', internalValue.value)
}
</script>

<template>
  <n-input
    v-model:value="internalValue"
    :placeholder="props.placeholder"
    class="w-80"
    @keyup.enter="handleImmediateSearch"
  >
    <template #prefix>
      <n-icon :component="Search" />
    </template>
  </n-input>
</template>
