<script setup lang="ts">
import { NButton, NCard, NIcon, NInput, NInputNumber, NSelect, NSpace } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import { Trash } from '@vicons/tabler'

interface SubRequestForm {
  positionName: string | null
  techStack: string
  minimumExperience: number | null
  notes: string
}

interface Props {
  modelValue: SubRequestForm
  positionOptions: SelectOption[]
  canRemove?: boolean
  positon: number
}

const props = withDefaults(defineProps<Props>(), {
  canRemove: false,
  positon: 1,
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
        <p class="text-xs font-semibold text-[#334155]">Posisi #{{ positon }}</p>
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
            <p class="text-[11px] font-medium text-[#64748B]">Nama Posisi</p>
            <n-select
              :value="modelValue.positionName"
              :options="positionOptions"
              placeholder="Pilih posisi"
              clearable
              filterable
              @update:value="(value) => updateField('positionName', value)"
            />
          </n-space>
        </div>

        <div>
          <n-space vertical :size="6">
            <p class="text-[11px] font-medium text-[#64748B]">Keahlian / Tech Stack</p>
            <n-input
              :value="modelValue.techStack"
              placeholder="Tambahkan keahlian utama yang wajib dimiliki kandidat."
              @update:value="(value) => updateField('techStack', value)"
            />
          </n-space>
        </div>

        <div>
          <n-space vertical :size="6">
            <p class="text-[11px] font-medium text-[#64748B]">Minimal Pengalaman (Tahun)</p>
            <n-input-number
              :value="modelValue.minimumExperience"
              :min="0"
              placeholder="Masukkan minimal pengalaman"
              class="w-full"
              clearable
              @update:value="(value) => updateField('minimumExperience', value)"
            />
          </n-space>
        </div>

        <div>
          <n-space vertical :size="6">
            <n-space align="center" justify="space-between">
              <p class="text-[11px] font-medium text-[#64748B]">Catatan</p>
              <span class="text-[10px] text-[#94A3B8]">Optional</span>
            </n-space>
            <n-input
              :value="modelValue.notes"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="Tambahkan catatan disini"
              @update:value="(value) => updateField('notes', value)"
            />
          </n-space>
        </div>
      </div>
    </n-space>
  </n-card>
</template>
