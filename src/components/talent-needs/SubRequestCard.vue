<script setup lang="ts">
import { NButton, NCard, NIcon, NInput, NInputNumber, NSelect, NSpace } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import { Trash } from '@vicons/tabler'

interface SubRequestForm {
  jobRoleId: string | null
  minYearsExperience: number | null
  notes: string
  techStack: string
}

interface Props {
  modelValue: SubRequestForm
  positionOptions: SelectOption[]
  canRemove?: boolean
  position: number
}

const props = withDefaults(defineProps<Props>(), {
  canRemove: false,
  position: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: SubRequestForm]
  remove: []
}>()

const updateField = <K extends keyof SubRequestForm>(field: K, value: SubRequestForm[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const handleRemove = () => {
  emit('remove')
}
</script>

<template>
  <n-card size="small" :bordered="true">
    <n-space vertical class="mb-4">
      <n-space align="center" justify="space-between">
        <h3 v-if="canRemove" class="text-xs font-bold text-gray-500">- Posisi #{{ position }}</h3>
        <n-button v-if="canRemove" tertiary size="small" type="error" @click="handleRemove">
          <template #icon>
            <n-icon :component="Trash" />
          </template>
          Hapus
        </n-button>
      </n-space>

      <div class="grid grid-cols-1 gap-3">
        <div>
          <n-space vertical :size="6">
            <h3 class="text-xs font-semibold text-gray-500">Nama Posisi</h3>
            <n-select
              :value="modelValue.jobRoleId"
              :options="positionOptions"
              placeholder="Pilih posisi"
              clearable
              filterable
              @update:value="(value) => updateField('jobRoleId', value)"
            />
          </n-space>
        </div>

        <div>
          <n-space vertical :size="6">
            <h3 class="text-xs font-semibold text-gray-500">Keahlian / Tech Stack</h3>
            <n-input
              :value="modelValue.techStack"
              placeholder="Tambahkan keahlian utama yang wajib dimiliki kandidat."
              @update:value="(value) => updateField('techStack', value)"
            />
          </n-space>
        </div>

        <div>
          <n-space vertical :size="6">
            <h3 class="text-xs font-semibold text-gray-500">Minimal Pengalaman (Tahun)</h3>
            <n-input-number
              :value="modelValue.minYearsExperience"
              :min="0"
              placeholder="Masukkan minimal pengalaman"
              class="w-full"
              clearable
              @update:value="(value) => updateField('minYearsExperience', value)"
            />
          </n-space>
        </div>

        <div>
          <n-space vertical :size="6">
            <h3 class="text-xs font-semibold text-gray-500">Catatan</h3>
            <n-input
              :value="modelValue.notes"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              placeholder="Tambahkan catatan disini"
              @update:value="(value) => updateField('notes', value)"
            />
          </n-space>
        </div>
      </div>
    </n-space>
  </n-card>
</template>
