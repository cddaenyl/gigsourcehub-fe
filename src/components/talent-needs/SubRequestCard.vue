<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NCard, NIcon, NInput, NSelect, NSpace, NTag } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import type { TalentRequestSubrequestForm } from '@/models/Request'
import { Trash } from '@vicons/tabler'

interface Props {
  modelValue: TalentRequestSubrequestForm
  positionOptions: SelectOption[]
  canRemove?: boolean
  position: number
}

const props = withDefaults(defineProps<Props>(), {
  canRemove: false,
  position: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: TalentRequestSubrequestForm]
  remove: []
}>()

const seniorityOptions: SelectOption[] = [
  { label: 'Junior', value: 'Junior' },
  { label: 'Middle', value: 'Middle' },
  { label: 'Senior', value: 'Senior' },
]

const techStackInput = ref('')

const techStackTags = computed(() => props.modelValue.techStack)

const updateField = <K extends keyof TalentRequestSubrequestForm>(
  field: K,
  value: TalentRequestSubrequestForm[K],
) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const addTechStack = () => {
  const nextValue = techStackInput.value.trim()

  if (!nextValue) {
    return
  }

  if (techStackTags.value.some((item) => item.toLowerCase() === nextValue.toLowerCase())) {
    techStackInput.value = ''
    return
  }

  updateField('techStack', [...techStackTags.value, nextValue])
  techStackInput.value = ''
}

const removeTechStack = (tagToRemove: string) => {
  updateField(
    'techStack',
    techStackTags.value.filter((tag) => tag !== tagToRemove),
  )
}

const handleTechStackKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter') {
    return
  }

  event.preventDefault()
  addTechStack()
}

const handleRemove = () => {
  emit('remove')
}
</script>

<template>
  <n-card size="small" :bordered="true">
    <n-space vertical class="mb-4">
      <n-space align="center" justify="space-between">
        <h3 v-if="canRemove" class="text-sm font-bold text-gray-500">#{{ position }}</h3>
        <n-button v-if="canRemove" tertiary size="small" type="error" @click="handleRemove">
          <template #icon>
            <n-icon :component="Trash" />
          </template>
          Hapus
        </n-button>
      </n-space>

      <div class="grid grid-cols-1 gap-4">
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
            <h3 class="text-xs font-semibold text-gray-500">Gambaran Umum Posisi</h3>
            <n-input
              :value="modelValue.overview"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 4 }"
              placeholder="Tambahkan catatan disini"
              @update:value="(value) => updateField('overview', value)"
            />
          </n-space>
        </div>

        <div>
          <n-space vertical :size="6">
            <h3 class="text-xs font-semibold text-gray-500">Keahlian / Tech Stack</h3>

            <n-input
              v-model:value="techStackInput"
              placeholder="Tambahkan keahlian lalu tekan Enter"
              clearable
              @keydown="handleTechStackKeydown"
              @blur="addTechStack"
            />

            <div v-if="techStackTags.length > 0" class="mt-1 flex flex-wrap gap-2">
              <n-tag
                v-for="tag in techStackTags"
                :key="tag"
                closable
                round
                :color="{ color: '#C7D0F3', textColor: '#07229E' }"
                @close="removeTechStack(tag)"
              >
                {{ tag }}
              </n-tag>
            </div>
          </n-space>
        </div>

        <div>
          <n-space vertical :size="6">
            <h3 class="text-xs font-semibold text-gray-500">Level Senioritas</h3>
            <n-select
              :value="modelValue.level"
              :options="seniorityOptions"
              placeholder="Pilih level senioritas"
              class="w-full"
              clearable
              @update:value="(value) => updateField('level', value)"
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
